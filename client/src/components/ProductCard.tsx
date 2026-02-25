import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useState, useEffect } from "react";
import { ShoppingBag, Heart, Eye, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact }: ProductCardProps) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const images = product.images && product.images.length > 0 
    ? product.images 
    : ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80"];

  useEffect(() => {
    if (!isHovered || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isHovered, images]);

  useEffect(() => {
    if (!isHovered) setCurrentImageIndex(0);
  }, [isHovered]);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`}>
        <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer" data-testid={`card-product-${product.id}`}>
          <div className={`relative ${compact ? 'aspect-square' : 'aspect-[4/5]'} overflow-hidden bg-gray-50`}>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {product.isFeatured && (
              <div className={`absolute top-2.5 ${isRTL ? 'right-2.5' : 'left-2.5'}`}>
                <span className="bg-primary text-white text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg">
                  {isRTL ? 'مميز' : 'Featured'}
                </span>
              </div>
            )}

            <div className={`absolute top-2.5 ${isRTL ? 'left-2.5' : 'right-2.5'} flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0`}>
              <button className="w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all" data-testid={`button-wishlist-${product.id}`}>
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <button className="w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all" data-testid={`button-quickview-${product.id}`}>
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>

            {images.length > 1 && isHovered && (
              <div className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all ${
                      idx === currentImageIndex ? "bg-white w-4 shadow-sm" : "bg-white/50 w-1"
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <Button
                size="sm"
                className="w-full bg-primary/95 hover:bg-primary text-white font-bold rounded-xl text-[10px] sm:text-xs h-8 sm:h-9 backdrop-blur-sm shadow-lg"
                data-testid={`button-add-cart-${product.id}`}
              >
                <ShoppingBag className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                {isRTL ? 'أضيفي للسلة' : 'Add to Cart'}
              </Button>
            </div>
          </div>
          
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-1 mb-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
              ))}
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium mr-1">(4.0)</span>
            </div>
            <h3 className="font-semibold text-xs sm:text-sm text-gray-800 line-clamp-2 mb-2 leading-relaxed group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-primary font-black text-sm sm:text-base">{Number(product.price).toLocaleString()} <span className="text-[10px] sm:text-xs font-semibold">{t('currency')}</span></span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[9px] sm:text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                {isRTL ? 'شحن سريع' : 'Fast Shipping'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
