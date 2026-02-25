import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { useCart } from "@/hooks/use-cart";
import { useCoupon } from "@/hooks/use-coupon";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, CreditCard, Building2, Apple, Landmark, Lock, Check, Wallet, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { LocationMap } from "@/components/LocationMap";
import { useQuery } from "@tanstack/react-query";

import logoImg from "@assets/logo.png";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { appliedCoupon } = useCoupon();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "apple_pay" | "tabby" | "tamara" | "moyasar">("apple_pay");
  const { data: settings } = useQuery<any>({ queryKey: ["/api/settings"] });
  const [isAppleDevice, setIsAppleDevice] = useState(false);

  useEffect(() => {
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                   /Macintosh/.test(navigator.userAgent);
    setIsAppleDevice(isApple);
    setPaymentMethod(isApple ? "apple_pay" : "moyasar");
  }, []);
  const [showMoyasarForm, setShowMoyasarForm] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
  };

  const uploadReceipt = async (): Promise<string | null> => {
    if (!receiptFile) return null;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", receiptFile);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("فشل رفع الإيصال");
      const data = await res.json();
      return data.url;
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(user?.addresses?.[0]?.id || null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [showMapForm, setShowMapForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: "", city: "", nationalAddress: "" });
  const [shippingCompany, setShippingCompany] = useState<string>("");
  const [saveAddress, setSaveAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: shippingCompanies = [] } = useQuery({
    queryKey: ["/api/shipping-companies"],
    queryFn: async () => {
      const res = await fetch("/api/shipping-companies");
      return res.json();
    }
  });

  useEffect(() => {
    if (items.length === 0) {
      setLocation("/cart");
    }
  }, [items.length, setLocation]);

  useEffect(() => {
    if (shippingCompanies.length > 0) {
      const storageStation = shippingCompanies.find((c: any) => c.id === "storage-station");
      if (storageStation) {
        setShippingCompany(storageStation.id);
      } else {
        setShippingCompany(shippingCompanies[0].id);
      }
    }
  }, [shippingCompanies]);

  if (items.length === 0) {
    return null;
  }

  const selectedShipping = shippingCompanies.find((c: any) => c._id === shippingCompany || c.id === shippingCompany) || shippingCompanies[0];
  const shippingPrice = 20;

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = total();
    if (appliedCoupon.minOrderAmount && subtotal < appliedCoupon.minOrderAmount) {
      return 0;
    }
    if (appliedCoupon.type === "percentage") {
      return (subtotal * appliedCoupon.value) / 100;
    } else if (appliedCoupon.type === "cashback") {
      return 0;
    } else {
      return appliedCoupon.value;
    }
  };

  const calculateCashback = () => {
    if (!appliedCoupon || appliedCoupon.type !== "cashback") return 0;
    const subtotal = total();
    const cashbackAmount = (subtotal * appliedCoupon.value) / 100;
    if (appliedCoupon.maxCashback && cashbackAmount > appliedCoupon.maxCashback) {
      return appliedCoupon.maxCashback;
    }
    return cashbackAmount;
  };

  const discountAmount = calculateDiscount();
  const cashbackAmount = calculateCashback();
  const subtotal = total();
  const tax = subtotal * 0.15;
  const shipping = shippingPrice;
  const finalTotal = subtotal + tax + shipping - discountAmount;

  const handleCheckoutInitiate = () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يرجى تسجيل الدخول لإتمام الطلب",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (paymentMethod === "wallet" && Number(user.walletBalance) < finalTotal) {
      toast({
        title: "رصيد المحفظة غير كافٍ",
        description: `رصيدك الحالي: ${user.walletBalance} ر.س، المطلوب: ${finalTotal.toFixed(2)} ر.س`,
        variant: "destructive",
      });
      return;
    }

    if (!selectedAddressId && (!newAddress.street || !newAddress.city || !newAddress.nationalAddress)) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إكمال بيانات عنوان الشحن والعنوان الوطني",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleFinalCheckout = async () => {
    if (!confirmPassword && paymentMethod !== "tamara" && paymentMethod !== "tabby" && paymentMethod !== "moyasar" && paymentMethod !== "apple_pay") {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة المرور للتأكيد",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (paymentMethod !== "tamara" && paymentMethod !== "tabby" && paymentMethod !== "moyasar" && paymentMethod !== "apple_pay") {
        const verifyRes = await fetch("/api/auth/verify-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: confirmPassword }),
        });

        if (!verifyRes.ok) {
          throw new Error("كلمة المرور غير صحيحة");
        }
      }

      const selectedAddr = user?.addresses?.find(a => a.id === selectedAddressId);
      const deliveryAddress = selectedAddr ? `${selectedAddr.street}, ${selectedAddr.city}` : `${newAddress.street}, ${newAddress.city}`;
      
      if (saveAddress && !selectedAddressId) {
        try {
          await apiRequest("POST", "/api/user/addresses", {
            name: `عنوان ${newAddress.city}`,
            street: newAddress.street,
            city: newAddress.city,
            nationalAddress: newAddress.nationalAddress
          });
        } catch (e) {
          console.warn("Failed to save address to profile, but continuing with order");
        }
      }

      try {
        const selectedAddr = user?.addresses?.find(a => a.id === selectedAddressId);
        const res = await apiRequest("POST", "/api/orders", {
          userId: user?.id || user?._id,
          total: finalTotal.toFixed(2),
          subtotal: subtotal.toFixed(2),
          vatAmount: tax.toFixed(2),
          shippingCost: shipping.toFixed(2),
          shippingCompany: selectedShipping?.name || "Storage Station",
          shippingAddress: {
            city: selectedAddr?.city || newAddress.city,
            street: selectedAddr?.street || newAddress.street,
            country: "SA"
          },
          nationalAddress: (newAddress as any).nationalAddress || "",
          discountAmount: discountAmount.toFixed(2),
          cashbackAmount: cashbackAmount.toFixed(2),
          couponCode: appliedCoupon?.code || "",
          items: items.map(item => ({
            productId: item.productId,
            title: item.title,
            variantSku: item.variantSku,
            quantity: item.quantity,
            price: Number(item.price),
            cost: Number((item as any).cost || 0),
            selectedOptions: item.selectedOptions || undefined,
            attachedFile: item.attachedFile || undefined,
            customerNote: item.customerNote || undefined,
          })),
          shippingMethod: "delivery",
          paymentMethod,
          status: "new",
          paymentStatus: (paymentMethod === "wallet" || paymentMethod === "apple_pay") ? "paid" : "pending",
          branchId: "main",
          type: "online"
        });
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || data.error || "فشل في إنشاء الطلب");
        }
        
        const order = data.data;

        if (paymentMethod === "apple_pay") {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        if (paymentMethod === "tamara") {
          try {
            const tamaraRes = await apiRequest("POST", "/api/payments/tamara/checkout", {
              orderId: order.id || order._id,
              amount: finalTotal,
              items: items.map(item => ({
                title: item.title,
                quantity: item.quantity,
                price: item.price,
                productId: item.productId,
                variantSku: item.variantSku,
              })),
              customer: {
                name: user?.name || user?.phone,
                phone: user?.phone,
                email: user?.email || `${user?.phone}@genmz.sa`,
              },
              shippingAddress: {
                street: selectedAddr?.street || newAddress.street,
                city: selectedAddr?.city || newAddress.city,
              }
            });
            
            if (!tamaraRes.ok) {
              const errorData = await tamaraRes.json().catch(() => ({}));
              throw new Error(errorData.message || "فشل في الاتصال بخدمة تمارا");
            }

            const tamaraData = await tamaraRes.json();
            if (tamaraData.success && tamaraData.checkoutUrl) {
              window.location.href = tamaraData.checkoutUrl;
              return;
            } else {
              throw new Error(tamaraData.message || "فشل في إنشاء جلسة Tamara");
            }
          } catch (e: any) {
            console.error("[TAMARA] Payment Error:", e);
            toast({
              title: "خطأ",
              description: e.message || "فشل في معالجة دفع تمارا",
              variant: "destructive"
            });
            return;
          }
        }

        if (paymentMethod === "tabby") {
          try {
            const tabbyRes = await apiRequest("POST", "/api/payments/tabby/checkout", {
              orderId: order.id || order._id,
              amount: finalTotal,
              items: items.map(item => ({
                title: item.title,
                quantity: item.quantity,
                price: item.price,
                productId: item.productId,
                variantSku: item.variantSku,
                color: item.color,
                size: item.size,
              })),
              customer: {
                name: user?.name || user?.phone,
                phone: user?.phone,
                email: user?.email || `${user?.phone}@genmz.sa`,
              },
              shippingAddress: {
                street: selectedAddr?.street || newAddress.street,
                city: selectedAddr?.city || newAddress.city,
              }
            });

            if (!tabbyRes.ok) {
              const errorData = await tabbyRes.json().catch(() => ({}));
              throw new Error(errorData.message || "فشل في الاتصال بخدمة تابي");
            }

            const tabbyData = await tabbyRes.json();
            if (tabbyData.success && tabbyData.checkoutUrl) {
              window.location.href = tabbyData.checkoutUrl;
              return;
            } else {
              throw new Error(tabbyData.message || "فشل في إنشاء جلسة Tabby");
            }
          } catch (e: any) {
            console.error("[TABBY] Payment Error:", e);
            toast({
              title: "خطأ",
              description: e.message || "فشل في معالجة دفع تابي",
              variant: "destructive"
            });
            return;
          }
        }

        if (paymentMethod === "moyasar") {
          try {
            const response = await apiRequest("POST", "/api/payments/moyasar/initiate", {
              orderId: order.id || order._id
            });
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || "فشل بدء عملية الدفع");
            }

            const resData = await response.json();
            if (resData.success && resData.transactionUrl) {
              sessionStorage.setItem("lastMoyasarOrderId", order.id || order._id);
              window.location.href = resData.transactionUrl;
              return;
            } else {
              throw new Error("لم يتم استلام رابط الدفع من ميسر");
            }
          } catch (e: any) {
            console.error("[MOYASAR] Payment Error:", e);
            try {
              await apiRequest("DELETE", `/api/admin/orders/${order.id || order._id}`);
            } catch (delError) {
              console.error("Failed to cleanup pending order:", delError);
            }
            toast({
              title: "خطأ",
              description: e.message || "فشل في معالجة دفع ميسر",
              variant: "destructive"
            });
            return;
          }
        }

        if (paymentMethod === "wallet") {
          let newBalance = (Number(user!.walletBalance) - finalTotal);
          
          if (cashbackAmount > 0) {
            newBalance += cashbackAmount;
            await apiRequest("POST", "/api/wallet/transaction", {
              amount: cashbackAmount,
              type: "cashback",
              description: `كاش باك من الطلب #${order.id.slice(-8).toUpperCase()}`
            });
          }
          
          await apiRequest("PATCH", "/api/user/wallet", { balance: newBalance.toString() });
          await apiRequest("POST", "/api/wallet/transaction", {
            amount: -finalTotal,
            type: "payment",
            description: `دفع قيمة الطلب #${order.id.slice(-8).toUpperCase()}`
          });
        }

        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        clearCart();
        
        let toastMessage = "تم استلام طلبك بنجاح. سيتم التوصيل عبر Storage Station قريباً";
        if (paymentMethod === "apple_pay") {
          toastMessage = "تم استلام طلبك بنجاح عبر Apple Pay.";
        }
        if (cashbackAmount > 0) {
          toastMessage = `تم إضافة ${cashbackAmount.toLocaleString()} ر.س كاش باك إلى محفظتك! ${toastMessage}`;
        }
        
        toast({
          title: "تم استلام طلبك بنجاح",
          description: toastMessage,
        });
        
        setTimeout(() => {
          setLocation("/orders");
        }, 1500);
      } catch (innerError: any) {
        throw innerError;
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "خطأ في إتمام الطلب",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
      setConfirmPassword("");
    }
  };

  return (
    <Layout>
      <SEO title="إتمام الشراء" />
      <div className="bg-[#fcfcfc] min-h-screen">
        <div className="container py-16 px-4 text-right" dir="rtl">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 border-b border-black/5 pb-8">
            <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter">إتمام الشراء</h1>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-black/40">
              <span className="opacity-40">حقيبة التسوق</span>
              <span className="opacity-20">/</span>
              <span className="text-black">إتمام الطلب</span>
              <span className="opacity-20">/</span>
              <span>الدفع</span>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white border border-black/5 p-6 flex items-center gap-6 justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-none">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-black text-black uppercase tracking-widest" data-testid="text-security-title">تسوق آمن ١٠٠٪</h3>
                    <p className="text-[9px] text-black/40 mt-1 font-bold">تشفير بياناتك يتم بأعلى معايير الأمان العالمية SSL</p>
                  </div>
                </div>
                <Check className="h-5 w-5 text-green-600" />
              </div>

              <section className="bg-white p-8 border border-black/5 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-black/5 pb-6">
                  <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>عنوان الشحن</span>
                  </h2>
                </div>
                
                {!showAddAddressForm && user?.addresses && user.addresses.length > 0 && (
                  <div className="space-y-4">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 border rounded cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary/5"
                            : "border-black/5 hover:border-black/20"
                        }`}
                        data-testid={`card-address-${addr.id}`}
                      >
                        <div className="font-black text-sm">{addr.name}</div>
                        <div className="text-[10px] text-black/60 mt-1">{addr.street}, {addr.city}</div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => setShowAddAddressForm(true)}
                      className="w-full border-black/10"
                      data-testid="button-add-address"
                    >
                      إضافة عنوان جديد
                    </Button>
                  </div>
                )}

                {(showAddAddressForm || !user?.addresses || user.addresses.length === 0) && (
                  <div className="space-y-4">
                    {!showMapForm ? (
                      <>
                        <Input
                          placeholder="الشارع والرقم"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          className="h-12 border-black/10"
                          required
                          data-testid="input-street"
                        />
                        <Input
                          placeholder="المدينة"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="h-12 border-black/10"
                          required
                          data-testid="input-city"
                        />
                        <Input
                          placeholder="العنوان الوطني (إلزامي)"
                          value={newAddress.nationalAddress}
                          onChange={(e) => setNewAddress({ ...newAddress, nationalAddress: e.target.value })}
                          className="h-12 border-black/10"
                          required
                          data-testid="input-national-address"
                        />
                        <div className="flex items-center gap-3 pt-2">
                          <input
                            type="checkbox"
                            id="save-address"
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                            className="w-5 h-5 accent-primary cursor-pointer"
                            data-testid="checkbox-save-address"
                          />
                          <label htmlFor="save-address" className="text-xs font-bold text-black/60 cursor-pointer">
                            حفظ هذا العنوان للطلبات المستقبلية
                          </label>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setShowMapForm(true)}
                          className="w-full border-black/10"
                          data-testid="button-open-map"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          حدد الموقع من الخريطة
                        </Button>
                        {showAddAddressForm && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowAddAddressForm(false);
                              setSelectedAddressId(null);
                            }}
                            className="w-full border-black/10"
                            data-testid="button-cancel-address"
                          >
                            إلغاء
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <LocationMap
                          onLocationSelect={(coords, address) => {
                            setNewAddress({
                              street: address,
                              city: "الرياض",
                              nationalAddress: ""
                            });
                            setShowMapForm(false);
                            setSelectedAddressId(null);
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => setShowMapForm(false)}
                          className="w-full border-black/10"
                          data-testid="button-close-map"
                        >
                          إغلاق الخريطة
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </section>

              <section className="bg-white p-8 border border-black/5 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-black/5 pb-6">
                  <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <Truck className="h-5 w-5 text-primary" />
                    <span>شركة الشحن</span>
                  </h2>
                </div>
                
                <div className="grid gap-4">
                  {shippingCompanies.map((company: any) => (
                    <div
                      key={company.id || company._id}
                      onClick={() => setShippingCompany(company.id || company._id)}
                      className={`p-4 border rounded cursor-pointer transition-all flex items-center justify-between ${
                        (shippingCompany === company.id || shippingCompany === company._id)
                          ? "border-primary bg-primary/5"
                          : "border-black/5 hover:border-black/20"
                      }`}
                      data-testid={`card-shipping-${company.id || company._id}`}
                    >
                      <div className="flex items-center gap-4">
                        <Truck className="h-6 w-6" />
                        <div className="font-black text-sm">{company.name}</div>
                      </div>
                      <span className="font-black text-primary">{company.price} ر.س</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">التوصيل خلال ٢-٤ أيام عمل</p>
              </section>

              <section className="bg-white p-8 border border-black/5 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-black/5 pb-4 mb-6">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-black uppercase tracking-tighter">اختيار وسيلة الدفع</h2>
                </div>

                <div className="grid gap-3">
                  <div 
                    className={`group relative flex items-center justify-between p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === "moyasar" ? "border-black bg-black/[0.02] shadow-md" : "border-gray-100 hover:border-gray-200"}`}
                    onClick={() => setPaymentMethod("moyasar")}
                    data-testid="card-payment-moyasar"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${paymentMethod === "moyasar" ? "border-black bg-black" : "border-gray-300"}`}>
                        {paymentMethod === "moyasar" && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base text-gray-900">
                            {isAppleDevice ? "Apple Pay / بطاقة بنكية" : "بطاقة مدى / فيزا / ماستركارد"}
                          </span>
                          <div className="flex gap-2 items-center grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                            {isAppleDevice && <Apple className="h-6 w-6 text-black" />}
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 w-auto" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 w-auto" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Mada_Logo.svg" alt="Mada" className="h-3 w-auto" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">دفع آمن وسريع عبر بوابة ميسر المعتمدة</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`group relative flex items-center justify-between p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === "tabby" ? "border-[#00D3C5] bg-[#00D3C5]/[0.02] shadow-md" : "border-gray-100 hover:border-gray-200"}`}
                    onClick={() => setPaymentMethod("tabby")}
                    data-testid="card-payment-tabby"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${paymentMethod === "tabby" ? "border-[#00D3C5] bg-[#00D3C5]" : "border-gray-300"}`}>
                        {paymentMethod === "tabby" && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <img 
                            src="https://cdn.tabby.ai/assets/logo.svg" 
                            alt="Tabby" 
                            className="h-6 w-auto object-contain"
                          />
                          <span className="font-bold text-gray-900">{(finalTotal / 4).toFixed(2)} ر.س / شهر</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500 font-medium">اشتر الآن وادفع لاحقاً - 4 دفعات بدون فوائد</p>
                          <Badge variant="outline" className="text-[10px] font-bold border-[#00D3C5] text-[#00D3C5]">بدون رسوم</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`group relative flex items-center justify-between p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === "tamara" ? "border-[#FFD500] bg-[#FFD500]/[0.02] shadow-md" : "border-gray-100 hover:border-gray-200"}`}
                    onClick={() => setPaymentMethod("tamara")}
                    data-testid="card-payment-tamara"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${paymentMethod === "tamara" ? "border-[#FFD500] bg-[#FFD500]" : "border-gray-300"}`}>
                        {paymentMethod === "tamara" && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <img 
                            src="https://cdn.tamara.co/assets/svg/tamara-logo-badge-en.svg" 
                            alt="Tamara" 
                            className="h-6 w-auto object-contain"
                          />
                          <span className="font-bold text-gray-900">{(finalTotal / 4).toFixed(2)} ر.س / شهر</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500 font-medium">قسمها على 4 دفعات شهرية - متوافق مع الشريعة</p>
                          <Badge variant="outline" className="text-[10px] font-bold border-[#FFD500] text-gray-700">شرعي</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`group relative flex items-center justify-between p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === "wallet" ? "border-primary bg-primary/[0.02] shadow-md" : "border-gray-100 hover:border-gray-200"}`}
                    onClick={() => setPaymentMethod("wallet")}
                    data-testid="card-payment-wallet"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${paymentMethod === "wallet" ? "border-primary bg-primary" : "border-gray-300"}`}>
                        {paymentMethod === "wallet" && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                      <div className="flex items-center justify-between flex-1">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-primary" />
                            <span className="font-bold text-gray-900">رصيد المحفظة</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 font-medium">الرصيد المتاح: <span className="text-primary font-bold">{user?.walletBalance || 0} ر.س</span></p>
                        </div>
                        {Number(user?.walletBalance) < finalTotal && (
                          <Badge variant="destructive" className="text-[10px] font-bold">غير كافٍ</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
                <div className="mt-6 pt-6 border-t space-y-4">
                  <div 
                    dangerouslySetInnerHTML={{
                      __html: `
                        <tamara-widget class="tamara-product-widget" type="tamara-summary" inline-type="2" amount="${finalTotal}"></tamara-widget>
                      `
                    }}
                  />
                  <div 
                    dangerouslySetInnerHTML={{
                      __html: `
                        <div class="tabby-promo-widget" data-price="${finalTotal}" data-currency="SAR" data-lang="ar" data-source="product" data-type="installments"></div>
                      `
                    }}
                  />
                </div>
              </section>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white p-8 border border-black/5 shadow-xl">
                  <h3 className="font-black text-lg uppercase tracking-tighter mb-8 pb-4 border-b border-black/5">ملخص الطلب</h3>
                  
                  <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map(item => (
                      <div key={item.variantSku} className="flex gap-4 items-center">
                        <div className="w-16 aspect-[3/4] bg-muted shrink-0 border border-black/5">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="font-black text-[11px] leading-tight max-w-[120px]">{item.title}</span>
                            <span className="font-black text-[11px]">{item.price.toLocaleString()} ر.س</span>
                          </div>
                          <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{item.quantity}x <span className="mx-1">|</span> {item.color} <span className="mx-1">|</span> {item.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 mb-10 text-[11px] font-bold uppercase tracking-widest">
                    <div className="flex justify-between opacity-40">
                      <span>{subtotal.toLocaleString()} ر.س</span>
                      <span>المجموع الفرعي</span>
                    </div>
                    <div className="flex justify-between opacity-40">
                      <span>{tax.toLocaleString()} ر.س</span>
                      <span>الضريبة (١٥٪)</span>
                    </div>
                    <div className="flex justify-between opacity-40">
                      <span>{shipping.toLocaleString()} ر.س</span>
                      <span>رسوم الشحن</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>-{discountAmount.toLocaleString()} ر.س</span>
                        <span>الخصم</span>
                      </div>
                    )}
                    {cashbackAmount > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>+{cashbackAmount.toLocaleString()} ر.س</span>
                        <span>كاش باك (يُضاف للمحفظة)</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-black/5 pt-6 font-black text-3xl tracking-tighter text-black">
                      <span className="text-primary">{finalTotal.toLocaleString()} ر.س</span>
                      <span>الإجمالي</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 justify-center py-4 bg-black/[0.02] border border-black/5 opacity-40 text-[9px] font-black uppercase tracking-widest mb-4">
                      <Lock className="h-3 w-3" />
                      <span>دفع آمن ١٠٠٪ ومحمي</span>
                    </div>

                    <Button 
                      onClick={handleCheckoutInitiate}
                      disabled={isSubmitting}
                      className="w-full font-black h-16 uppercase tracking-[0.4em] rounded-none bg-primary text-white hover:bg-primary/90 border-none transition-all disabled:opacity-50 text-[10px] shadow-xl shadow-primary/10 active:scale-95"
                      data-testid="button-confirm-order"
                    >
                      {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-black/5 shadow-2xl p-8" dir="rtl">
          <DialogHeader className="text-right space-y-4">
            <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-2">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="font-black text-3xl tracking-tight">تأكيد الهوية</DialogTitle>
            <DialogDescription className="font-bold text-sm text-black/40 leading-relaxed">
              لحماية حسابك، يرجى إدخال كلمة المرور الخاصة بك لتأكيد طلب الشراء.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="confirm-password" title="كلمة المرور" className="text-[10px] font-black uppercase tracking-widest text-black/30 pr-1">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-14 bg-black/5 border-none rounded-2xl px-6 font-bold focus-visible:ring-primary/20"
                  placeholder="ادخل كلمة المرور هنا"
                  data-testid="input-confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-primary transition-colors"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Link href="/forgot-password">
              <button 
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                onClick={() => setShowConfirmDialog(false)}
                data-testid="link-forgot-password"
              >
                نسيت كلمة المرور؟
              </button>
            </Link>
          </div>
          <DialogFooter className="gap-3 sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="rounded-full h-14 px-8 font-black uppercase tracking-widest text-[10px] border-black/5"
              data-testid="button-cancel-checkout"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleFinalCheckout}
              disabled={isSubmitting || !confirmPassword}
              className="rounded-full h-14 px-12 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/10 flex-1 sm:flex-none"
              data-testid="button-final-checkout"
            >
              {isSubmitting ? "جاري التأكيد..." : "تأكيد وإتمام الطلب"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMoyasarForm} onOpenChange={setShowMoyasarForm}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-3xl" dir="rtl">
          <DialogHeader className="p-8 bg-black text-white space-y-2">
            <DialogTitle className="text-2xl font-black text-center tracking-tight">الدفع الآمن</DialogTitle>
            <DialogDescription className="text-white/60 text-center font-bold text-sm">
              بوابة ميسر (Moyasar) تدعم مدى، فيزا، ماستركارد، و Apple Pay
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 min-h-[400px]">
            <div 
              id="moyasar-payment-form" 
              className="mysr-form"
              ref={(el) => {
                if (el && !el.innerHTML && (window as any).Moyasar) {
                  (window as any).Moyasar.init({
                    element: el,
                    amount: Math.round(finalTotal * 100),
                    currency: 'SAR',
                    description: `طلب رقم: ${items[0]?.title.slice(0, 20)}...`,
                    publishable_api_key: import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY || 'pk_test_vcAnvS96pDezR1o53T71cT115Snnqg9f50eByE1L',
                    callback_url: `${window.location.origin}/api/payments/moyasar/verify`,
                    methods: ['creditcard', 'applepay'],
                  });
                }
              }}
            ></div>
          </div>
          <DialogFooter className="p-4 bg-black/5 border-t border-black/5">
            <Button variant="ghost" onClick={() => setShowMoyasarForm(false)} className="w-full font-black text-[10px] uppercase tracking-widest" data-testid="button-cancel-moyasar">
              إلغاء والعودة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
