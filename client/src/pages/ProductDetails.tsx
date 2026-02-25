import { Layout } from "@/components/Layout";
import { useProduct } from "@/hooks/use-products";
import { useCart, type SelectedCustomOption } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useRoute } from "wouter";
import { useState, useEffect } from "react";
import { ShoppingBag, Check, Star, Upload, FileText, MessageSquare, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { Textarea } from "@/components/ui/textarea";

// Generate unique UUID for Tamara widget
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function ProductDetails() {
  const [, params] = useRoute("/products/:id");
  const id = params?.id;
  const { data: product, isLoading } = useProduct(id || "");
  const { addItem } = useCart();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCustomOptions, setSelectedCustomOptions] = useState<Record<string, string[]>>({});
  const [customerNote, setCustomerNote] = useState("");
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Collect all unique images (product images only, excluding variant images as per request)
  const allImages = product?.images || [];

  // Auto-rotate images every 2 seconds
  useEffect(() => {
    if (allImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [allImages.length]);

  // Update current image when variant changes (if variant has an image)
  useEffect(() => {
    if (selectedVariant?.image) {
      const index = allImages.indexOf(selectedVariant.image);
      if (index !== -1) {
        setCurrentImageIndex(index);
      }
    }
  }, [selectedVariant, allImages]);

  // Ensure variants exist, otherwise provide default
  const variants = product?.variants && product.variants.length > 0 ? product.variants : [{ sku: 'default', color: 'Default', size: 'One Size', stock: 10, image: '' }];
  
  // Extract unique colors
  const colors = Array.from(new Set(variants.map((v: any) => v.color)));
  
  // Get available sizes for selected color
  const availableSizes = selectedColor 
    ? Array.from(new Set(variants.filter((v: any) => v.color === selectedColor).map((v: any) => v.size)))
    : Array.from(new Set(variants.map((v: any) => v.size)));
  
  // Get variant images grouped by color
  const colorImages: Record<string, string> = {};
  colors.forEach(color => {
    const variant = variants.find((v: any) => v.color === color);
    if (variant?.image) {
      colorImages[color] = variant.image;
    }
  });
  
  // Auto select first color if not selected
  useEffect(() => {
    if (!selectedColor && colors.length > 0) {
      setSelectedColor(colors[0]);
    }
  }, [colors, selectedColor]);

  // Auto select first size when color changes
  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    } else if (!availableSizes.includes(selectedSize || "")) {
      setSelectedSize(availableSizes[0] || null);
    }
  }, [selectedColor, availableSizes, selectedSize]);

  // Find and set selected variant based on color and size
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = variants.find((v: any) => v.color === selectedColor && v.size === selectedSize);
      if (variant) {
        setSelectedVariant(variant);
      }
    }
  }, [selectedColor, selectedSize, variants]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 animate-pulse">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-muted rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-muted w-2/3 rounded" />
              <div className="h-4 bg-muted w-1/3 rounded" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <h2 className="text-2xl font-bold">{t('productNotFound')}</h2>
          <p className="text-muted-foreground mt-4">{t('noResults')}</p>
        </div>
      </Layout>
    );
  }

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
    // Find index of the variant's image in product images to sync gallery
    const imageIndex = product.images.findIndex(img => img === variant.image);
    if (imageIndex !== -1) {
      setCurrentImageIndex(imageIndex);
    }
  };

  const handleCustomOptionToggle = (optionId: string, value: string, type: string) => {
    setSelectedCustomOptions(prev => {
      const current = prev[optionId] || [];
      if (type === "single") {
        return { ...prev, [optionId]: current.includes(value) ? [] : [value] };
      }
      if (current.includes(value)) {
        return { ...prev, [optionId]: current.filter(v => v !== value) };
      }
      return { ...prev, [optionId]: [...current, value] };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: language === 'ar' ? "الملف كبير جداً (الحد الأقصى 10 ميجا)" : "File too large (max 10MB)", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setAttachedFile(url);
      toast({ title: language === 'ar' ? "تم رفع الملف بنجاح" : "File uploaded" });
    } catch {
      toast({ title: language === 'ar' ? "فشل رفع الملف" : "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const getOptionsExtraPrice = () => {
    if (!product?.customOptions) return 0;
    let extra = 0;
    product.customOptions.forEach((opt: any) => {
      const selected = selectedCustomOptions[opt.id] || [];
      opt.options.forEach((choice: any) => {
        if (selected.includes(choice.label)) {
          extra += choice.priceAdjustment || 0;
        }
      });
    });
    return extra;
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    if (product.customOptions?.length) {
      const missingRequired = product.customOptions.filter((opt: any) => 
        opt.required && !(selectedCustomOptions[opt.id]?.length)
      );
      if (missingRequired.length > 0) {
        toast({
          title: language === 'ar' ? "يرجى اختيار جميع الخيارات المطلوبة" : "Please select all required options",
          description: missingRequired.map((o: any) => o.name).join(", "),
          variant: "destructive",
        });
        return;
      }
    }

    const optionsForCart: SelectedCustomOption[] = [];
    if (product.customOptions?.length) {
      product.customOptions.forEach((opt: any) => {
        const selected = selectedCustomOptions[opt.id] || [];
        if (selected.length > 0) {
          let adjustment = 0;
          opt.options.forEach((choice: any) => {
            if (selected.includes(choice.label)) {
              adjustment += choice.priceAdjustment || 0;
            }
          });
          optionsForCart.push({
            optionName: opt.name,
            selectedValues: selected,
            priceAdjustment: adjustment,
          });
        }
      });
    }
    
    setIsAnimating(true);
    addItem(product, selectedVariant, quantity, {
      selectedOptions: optionsForCart.length > 0 ? optionsForCart : undefined,
      attachedFile: attachedFile || undefined,
      customerNote: customerNote.trim() || undefined,
    });
    
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <Layout>
      <div className="bg-white">
        <div className="container py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className={`grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-start ${language === 'ar' ? '' : 'lg:flex-row-reverse'}`}>
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square sm:aspect-[4/5] bg-gray-50 overflow-hidden rounded-2xl sm:rounded-3xl group">
              <div 
                className="w-full h-full flex items-center justify-center p-4 sm:p-8 cursor-zoom-in"
                onClick={() => {
                  const img = allImages[currentImageIndex];
                  if (img) window.open(img, '_blank');
                }}
              >
                <img 
                  key={currentImageIndex}
                  src={allImages[currentImageIndex] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80"} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {product.isFeatured && (
                <div className={`absolute top-3 ${language === 'ar' ? 'right-3' : 'left-3'}`}>
                  <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-lg shadow-md">
                    {language === 'ar' ? 'مميز' : 'Featured'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto py-1 no-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                    className={`
                      relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300
                      ${currentImageIndex === idx ? 'ring-2 ring-primary shadow-md scale-105' : 'ring-1 ring-gray-200 opacity-60 hover:opacity-100'}
                    `}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <div className={`flex flex-col ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">{product.name}</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-primary">
                  {Number(product.price).toLocaleString()}
                </span>
                <span className="text-sm sm:text-base text-primary font-medium">{t('currency')}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">(4.0)</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">{language === 'ar' ? 'متوفر' : 'In Stock'}</span>
              </div>
            </div>

            <div className="border-t border-b border-gray-100 py-4 mb-6">
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* SKU Display */}
            {selectedVariant && selectedVariant.sku && (
              <div className="mb-6 flex items-center gap-2 text-xs text-gray-400" data-testid="section-sku">
                <span className="font-medium">{language === 'ar' ? 'رمز المنتج:' : 'SKU:'}</span>
                <span className="font-mono text-gray-500" data-testid="text-product-sku">{selectedVariant.sku}</span>
              </div>
            )}

            {/* Variants - Colors Section */}
            <div className="space-y-6 mb-6">
              {/* Colors */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-3">{t('colorLabel')}: <span className="text-gray-800">{selectedColor}</span></label>
                <div className={`flex flex-wrap gap-3 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                  {colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`
                        relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden transition-all duration-200
                        ${selectedColor === color 
                          ? 'ring-2 ring-primary ring-offset-2 shadow-md' 
                          : 'ring-1 ring-gray-200 hover:ring-gray-400'}
                      `}
                      data-testid={`button-color-${color}`}
                    >
                      {colorImages[color] ? (
                        <img src={colorImages[color]} alt={color} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[9px] font-semibold text-gray-500 text-center px-1">
                          {color}
                        </div>
                      )}
                      {selectedColor === color && (
                        <div className="absolute inset-0 bg-primary/15 flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-3">{t('sizeLabel')}</label>
                <div className={`flex flex-wrap gap-2 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                  {availableSizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200
                        ${selectedSize === size
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                      `}
                      data-testid={`button-size-${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-3">{t('quantityLabel')}</label>
                <div className={`flex items-center ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-gray-200 transition-colors text-lg"
                      data-testid="button-decrease-quantity"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold w-10 sm:w-12 text-center" data-testid="text-quantity">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-gray-200 transition-colors text-lg"
                      data-testid="button-increase-quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Options */}
            {product.customOptions && product.customOptions.length > 0 && (
              <div className="space-y-4 mb-6">
                {product.customOptions.map((opt: any) => (
                  <div key={opt.id} className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-2">
                      {opt.name}
                      {opt.required && <span className="text-red-500 mr-1">*</span>}
                      {opt.type === "multiple" && (
                        <span className="text-[10px] text-gray-400 font-normal mr-2">
                          ({language === 'ar' ? 'يمكنك اختيار أكثر من خيار' : 'Select multiple'})
                        </span>
                      )}
                    </label>
                    <div className={`flex flex-wrap gap-2 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                      {opt.options.map((choice: any) => {
                        const isSelected = (selectedCustomOptions[opt.id] || []).includes(choice.label);
                        return (
                          <button
                            key={choice.label}
                            type="button"
                            onClick={() => handleCustomOptionToggle(opt.id, choice.label, opt.type)}
                            className={`
                              px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200
                              ${isSelected
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                            `}
                            data-testid={`button-option-${opt.id}-${choice.label}`}
                          >
                            {choice.label}
                            {choice.priceAdjustment !== 0 && (
                              <span className={`mr-1 text-[10px] ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                ({choice.priceAdjustment > 0 ? '+' : ''}{choice.priceAdjustment} {language === 'ar' ? 'ر.س' : 'SAR'})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* File Upload */}
            {product.allowFileUpload && (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  <FileText className="inline h-3.5 w-3.5 ml-1" />
                  {language === 'ar' ? 'إرفاق ملف' : 'Attach File'}
                </label>
                {attachedFile ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="text-xs text-green-700 flex-1 truncate">
                      {language === 'ar' ? 'تم رفع الملف بنجاح' : 'File uploaded successfully'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      data-testid="button-remove-file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {isUploading
                        ? (language === 'ar' ? 'جاري الرفع...' : 'Uploading...')
                        : (language === 'ar' ? 'اضغط لرفع ملف (الحد الأقصى 10 ميجا)' : 'Click to upload (max 10MB)')
                      }
                    </span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                      data-testid="input-file-upload"
                    />
                  </label>
                )}
              </div>
            )}

            {/* Customer Note */}
            {product.allowNote && (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  <MessageSquare className="inline h-3.5 w-3.5 ml-1" />
                  {language === 'ar' ? 'أضف ملاحظة' : 'Add Note'}
                </label>
                <Textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder={language === 'ar' ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
                  className="rounded-xl text-xs min-h-[80px] resize-none text-right"
                  maxLength={500}
                  data-testid="textarea-customer-note"
                />
                <p className="text-[10px] text-gray-400 mt-1 text-left">{customerNote.length}/500</p>
              </div>
            )}

            {/* Price with adjustments */}
            {getOptionsExtraPrice() > 0 && (
              <div className="mb-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-primary">
                    {(Number(product.price) + getOptionsExtraPrice()).toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}
                  </span>
                  <span className="text-gray-500">
                    {language === 'ar' ? 'السعر الإجمالي مع الخيارات' : 'Total with options'}
                  </span>
                </div>
              </div>
            )}

            {/* Installment Plans Section */}
            <div className="mb-6 p-4 sm:p-5 bg-gray-50 rounded-2xl border border-gray-100" data-testid="section-installment-plans">
              <p className="text-xs font-semibold text-gray-500 mb-3">{language === 'ar' ? 'خيارات التقسيط' : 'Installment Plans'}</p>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded-xl border border-gray-100" data-testid="card-installment-tamara">
                  <div 
                    className="tamara-product-widget" 
                    data-price={product.price}
                    data-lang={language}
                    data-country="SA"
                  />
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-100" data-testid="card-installment-tabby">
                  <div 
                    className="tabby-product-widget" 
                    data-price={product.price}
                    data-currency="SAR"
                    data-lang={language}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100" data-testid="card-installment-instant">
                  <span className="font-semibold text-xs sm:text-sm text-gray-700">{language === 'ar' ? 'التقسيط الفوري' : 'Instant Installment'}</span>
                  <span className="text-primary font-semibold text-xs sm:text-sm">{language === 'ar' ? 'متاح عند الدفع' : 'Available at Checkout'}</span>
                </div>
              </div>
            </div>

            <script dangerouslySetInnerHTML={{
              __html: `
                function initInstallmentWidgets() {
                  if (window.loadTamaraProductWidget) {
                    window.loadTamaraProductWidget();
                  }
                  if (window.TabbyPromo) {
                    new window.TabbyPromo({
                      selector: '.tabby-product-widget',
                      currency: 'SAR',
                      lang: '${language}',
                      price: ${product.price},
                      installmentsCount: 4,
                      source: 'product'
                    });
                  }
                }
                setTimeout(initInstallmentWidgets, 1000);
              `
            }} />

            <Button 
              size="lg" 
              className="w-full h-14 sm:h-16 text-sm font-bold rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 border-none relative overflow-visible transition-all"
              onClick={handleAddToCart}
              disabled={isAnimating}
              data-testid="button-add-to-cart"
            >
              {isAnimating && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 1, x: 0, y: 0 }}
                  animate={{ 
                    scale: 0.2, 
                    opacity: 0,
                    x: language === 'ar' ? -400 : 400,
                    y: -800,
                    rotate: 360
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                >
                  <div className="w-16 h-16 bg-white shadow-2xl rounded-xl p-1">
                    <img 
                      src={selectedVariant?.image || product.images[0]} 
                      alt="" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </motion.div>
              )}
              <ShoppingBag className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {t('addToCart')}
            </Button>

            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[10px] font-medium text-gray-500">{t('originalProduct')}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[10px] font-medium text-gray-500">{t('luxuryPackaging')}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[10px] font-medium text-gray-500">{t('secureShipping')}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
}
