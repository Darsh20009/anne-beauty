import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Star, ShieldCheck, Truck, ChevronRight, ChevronLeft, Sparkles, Heart, Gift, Crown, Palette, Eye, Droplets, Scissors, Zap, ArrowRight, ArrowLeft, Timer, TrendingUp, Award, Package } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { MarketingBanners } from "@/components/marketing-banners";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@assets/Screenshot_2026-02-25_075934_1771995737623.png";
import heroImg2 from "@assets/Screenshot_2026-02-25_080037_1771995737624.png";
import heroImg3 from "@assets/Screenshot_2026-02-25_080154_1771995737625.png";
import heroImg4 from "@assets/Screenshot_2026-02-25_080206_1771995737625.png";
import logoImg from "@/assets/logo.png";

const heroSlides = [
  { img: heroImg, titleAr: "تشكيلة المكياج الجديدة", titleEn: "New Makeup Collection", subtitleAr: "خصم يصل إلى ٣٠٪", subtitleEn: "Up to 30% Off" },
  { img: heroImg2, titleAr: "أدوات التجميل الاحترافية", titleEn: "Professional Beauty Tools", subtitleAr: "جودة لا تُقاوم", subtitleEn: "Unmatched Quality" },
  { img: heroImg3, titleAr: "العناية بالبشرة", titleEn: "Skincare Essentials", subtitleAr: "لبشرة مثالية", subtitleEn: "For Perfect Skin" },
  { img: heroImg4, titleAr: "عروض حصرية", titleEn: "Exclusive Deals", subtitleAr: "لفترة محدودة", subtitleEn: "Limited Time" },
];

const categoryIcons = [
  { icon: Palette, nameAr: "مكياج", nameEn: "Makeup", slug: "makeup", color: "from-rose-500 to-pink-600" },
  { icon: Eye, nameAr: "عيون", nameEn: "Eyes", slug: "eyes", color: "from-purple-500 to-indigo-600" },
  { icon: Heart, nameAr: "شفاه", nameEn: "Lips", slug: "lips", color: "from-red-500 to-rose-600" },
  { icon: Droplets, nameAr: "وجه", nameEn: "Face", slug: "face", color: "from-amber-500 to-orange-600" },
  { icon: Scissors, nameAr: "أدوات", nameEn: "Tools", slug: "tools", color: "from-teal-500 to-emerald-600" },
  { icon: Sparkles, nameAr: "عطور", nameEn: "Perfumes", slug: "perfumes", color: "from-violet-500 to-purple-600" },
  { icon: Crown, nameAr: "فاخر", nameEn: "Luxury", slug: "luxury", color: "from-yellow-500 to-amber-600" },
  { icon: Gift, nameAr: "هدايا", nameEn: "Gifts", slug: "gifts", color: "from-pink-500 to-rose-600" },
];

const featuredBanners = [
  { titleAr: "أحمر شفاه مات", titleEn: "Matte Lipsticks", descAr: "تشكيلة واسعة من الألوان", descEn: "Wide range of colors", bg: "from-rose-600 to-pink-700", icon: Heart },
  { titleAr: "كريمات أساس", titleEn: "Foundations", descAr: "لكل أنواع البشرة", descEn: "For all skin types", bg: "from-amber-600 to-orange-700", icon: Droplets },
  { titleAr: "فرش مكياج", titleEn: "Makeup Brushes", descAr: "احترافية 100%", descEn: "100% Professional", bg: "from-teal-600 to-emerald-700", icon: Scissors },
];

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dealTimer, setDealTimer] = useState({ hours: 5, minutes: 42, seconds: 18 });
  const isRTL = language === 'ar';

  useEffect(() => {
    if (user && ["admin", "employee", "support"].includes(user.role)) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDealTimer(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const featuredProducts = products?.filter(p => p.isFeatured)?.slice(0, 8) || [];
  const allProductsList = products?.slice(0, 12) || [];
  const newArrivals = products?.slice().reverse().slice(0, 6) || [];

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <Layout>
      <MarketingBanners />

      {/* Hero Carousel - Full Width Noon-style */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 to-white" data-testid="hero-section">
        <div className="container px-3 sm:px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Banner */}
            <div className="lg:col-span-3 relative rounded-2xl overflow-hidden h-[280px] sm:h-[350px] md:h-[420px] group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0"
                >
                  <img
                    src={heroSlides[currentSlide].img}
                    alt={isRTL ? heroSlides[currentSlide].titleAr : heroSlides[currentSlide].titleEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className={`absolute bottom-6 sm:bottom-10 ${isRTL ? 'right-6 sm:right-10 text-right' : 'left-6 sm:left-10 text-left'}`}>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/80 text-xs sm:text-sm font-semibold mb-1 sm:mb-2"
                    >
                      {isRTL ? heroSlides[currentSlide].subtitleAr : heroSlides[currentSlide].subtitleEn}
                    </motion.p>
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-white text-xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4"
                    >
                      {isRTL ? heroSlides[currentSlide].titleAr : heroSlides[currentSlide].titleEn}
                    </motion.h2>
                    <Link href="/products">
                      <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 sm:px-8" data-testid="button-shop-now">
                        {isRTL ? 'تسوقي الآن' : 'Shop Now'}
                        {isRTL ? <ChevronLeft className="mr-2 h-4 w-4" /> : <ChevronRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Carousel Controls */}
              <button onClick={prevSlide} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity`} data-testid="button-hero-prev">
                {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
              <button onClick={nextSlide} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity`} data-testid="button-hero-next">
                {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {heroSlides.map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} data-testid={`hero-dot-${i}`} />
                ))}
              </div>
            </div>

            {/* Side Promo Cards */}
            <div className="hidden lg:flex flex-col gap-4">
              <div className="flex-1 rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => setLocation('/products')}>
                <img src={heroImg3} alt="Promo 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <p className="text-xs font-bold mb-1">{isRTL ? 'وصل حديثاً' : 'New Arrival'}</p>
                    <p className="text-sm font-black">{isRTL ? 'مجموعة الربيع' : 'Spring Collection'}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => setLocation('/products')}>
                <img src={heroImg4} alt="Promo 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <p className="text-xs font-bold mb-1">{isRTL ? 'عروض خاصة' : 'Special Offers'}</p>
                    <p className="text-sm font-black">{isRTL ? 'خصم ٢٠٪' : '20% Off'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Strip - Noon style */}
      <section className="py-6 sm:py-8 bg-white border-b" data-testid="categories-section">
        <div className="container px-3 sm:px-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold">{isRTL ? 'تسوقي حسب الفئة' : 'Shop by Category'}</h2>
            <Link href="/products">
              <span className="text-primary text-sm font-semibold hover:underline cursor-pointer flex items-center gap-1" data-testid="link-all-categories">
                {isRTL ? 'عرض الكل' : 'View All'}
                {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
            {categoryIcons.map((cat, i) => (
              <Link key={i} href={`/products?category=${cat.slug}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                  data-testid={`category-${cat.slug}`}
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all`}>
                    <cat.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-center text-gray-700 group-hover:text-primary transition-colors">
                    {isRTL ? cat.nameAr : cat.nameEn}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals with Timer */}
      <section className="py-6 sm:py-10 bg-gradient-to-r from-primary/5 via-white to-primary/5" data-testid="deals-section">
        <div className="container px-3 sm:px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-lg sm:text-2xl font-black text-primary">{isRTL ? 'عروض خاطفة' : 'Flash Deals'}</h2>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-primary/10 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2">
                <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                <div className="flex items-center gap-1 font-mono text-sm sm:text-base font-black text-primary">
                  <span className="bg-primary text-white rounded-md px-1.5 py-0.5 text-xs sm:text-sm">{String(dealTimer.hours).padStart(2, '0')}</span>
                  <span>:</span>
                  <span className="bg-primary text-white rounded-md px-1.5 py-0.5 text-xs sm:text-sm">{String(dealTimer.minutes).padStart(2, '0')}</span>
                  <span>:</span>
                  <span className="bg-primary text-white rounded-md px-1.5 py-0.5 text-xs sm:text-sm">{String(dealTimer.seconds).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
            <Link href="/products">
              <span className="text-primary text-sm font-semibold hover:underline cursor-pointer hidden sm:flex items-center gap-1" data-testid="link-all-deals">
                {isRTL ? 'عرض الكل' : 'View All'}
                {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </span>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {allProductsList.slice(0, 6).map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -4 }}
                  className="group"
                  data-testid={`deal-product-${product.id}`}
                >
                  <Link href={`/products/${product.id}`}>
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 cursor-pointer">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={product.images?.[0] || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                            -30%
                          </span>
                        </div>
                      </div>
                      <div className="p-2 sm:p-3">
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 mb-1">{product.name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-primary font-black text-sm sm:text-base">{Number(product.price).toLocaleString()} {t('currency')}</span>
                        </div>
                        <div className="mt-1 sm:mt-2 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${Math.random() * 40 + 40}%` }} />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">{isRTL ? 'بقي عدد محدود' : 'Limited stock'}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promotional Banners Grid - 3 columns */}
      <section className="py-6 sm:py-8 bg-white" data-testid="promo-banners">
        <div className="container px-3 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {featuredBanners.map((banner, i) => (
              <Link key={i} href="/products">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`relative rounded-2xl overflow-hidden h-32 sm:h-40 bg-gradient-to-br ${banner.bg} cursor-pointer group`}
                  data-testid={`promo-banner-${i}`}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                  <div className={`relative z-10 h-full flex items-center justify-between p-4 sm:p-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="text-white/80 text-xs font-semibold mb-1">{isRTL ? banner.descAr : banner.descEn}</p>
                      <h3 className="text-white text-lg sm:text-xl font-black">{isRTL ? banner.titleAr : banner.titleEn}</h3>
                      <p className="text-white/70 text-xs mt-2 font-semibold flex items-center gap-1">
                        {isRTL ? 'تسوقي الآن' : 'Shop Now'}
                        {isRTL ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </p>
                    </div>
                    <banner.icon className="h-12 w-12 sm:h-16 sm:w-16 text-white/20" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Amazon/Noon Grid */}
      <section className="py-8 sm:py-12 bg-gray-50" data-testid="featured-section">
        <div className="container px-3 sm:px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h2 className="text-lg sm:text-2xl font-black">{isRTL ? 'الأكثر مبيعاً' : 'Best Sellers'}</h2>
            </div>
            <Link href="/products">
              <Button variant="outline" size="sm" className="rounded-xl font-semibold border-primary/20 text-primary hover:bg-primary/5" data-testid="button-view-all-featured">
                {isRTL ? 'عرض الكل' : 'View All'}
                {isRTL ? <ChevronLeft className="mr-1 h-4 w-4" /> : <ChevronRight className="ml-1 h-4 w-4" />}
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featuredProducts.map((product) => (
                <div key={product.id} data-testid={`card-product-${product.id}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : allProductsList.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {allProductsList.slice(0, 8).map((product) => (
                <div key={product.id} data-testid={`card-product-${product.id}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
              <p className="text-lg text-muted-foreground mb-6">{isRTL ? 'لم نجد منتجات متاحة حالياً' : 'No products available'}</p>
              <Link href="/products">
                <Button className="bg-primary text-white rounded-xl">{isRTL ? 'استكشفي المتجر' : 'Explore Store'}</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges Strip */}
      <section className="py-6 sm:py-8 bg-white border-y" data-testid="trust-badges">
        <div className="container px-3 sm:px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-800">{isRTL ? 'توصيل سريع' : 'Fast Delivery'}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{isRTL ? 'لجميع مناطق المملكة' : 'All Saudi regions'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-800">{isRTL ? 'منتجات أصلية' : '100% Authentic'}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{isRTL ? 'ضمان الجودة' : 'Quality guaranteed'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-800">{isRTL ? 'استرجاع مجاني' : 'Free Returns'}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{isRTL ? 'خلال ٧ أيام' : 'Within 7 days'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-800">{isRTL ? 'ماركات عالمية' : 'Global Brands'}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{isRTL ? 'أفضل العلامات التجارية' : 'Top beauty brands'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-8 sm:py-12 bg-white" data-testid="new-arrivals-section">
        <div className="container px-3 sm:px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h2 className="text-lg sm:text-2xl font-black">{isRTL ? 'وصل حديثاً' : 'New Arrivals'}</h2>
            </div>
            <Link href="/products">
              <Button variant="outline" size="sm" className="rounded-xl font-semibold border-primary/20 text-primary hover:bg-primary/5" data-testid="button-view-new-arrivals">
                {isRTL ? 'عرض الكل' : 'View All'}
                {isRTL ? <ChevronLeft className="mr-1 h-4 w-4" /> : <ChevronRight className="ml-1 h-4 w-4" />}
              </Button>
            </Link>
          </div>

          {!isLoading && newArrivals.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {newArrivals.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
                    data-testid={`new-arrival-${product.id}`}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={product.images?.[0] || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'}`}>
                        <span className="bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                          {isRTL ? 'جديد' : 'NEW'}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3">
                      <h3 className="text-xs font-semibold text-gray-800 line-clamp-1 mb-1">{product.name}</h3>
                      <span className="text-primary font-black text-sm">{Number(product.price).toLocaleString()} {t('currency')}</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Big CTA Banner */}
      <section className="py-8 sm:py-12 bg-gray-50" data-testid="cta-section">
        <div className="container px-3 sm:px-4">
          <div className="relative rounded-3xl overflow-hidden h-[200px] sm:h-[280px]" style={{ background: "linear-gradient(135deg, #6b1219 0%, #8B1D24 50%, #a52330 100%)" }}>
            <div className="absolute inset-0 opacity-10">
              <img
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <img src={logoImg} alt="Anne Beauty" className="h-12 sm:h-16 w-auto mx-auto mb-3 sm:mb-4 drop-shadow-xl" />
                <h2 className="text-white text-xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3">
                  {isRTL ? 'جمالك يبدأ من هنا' : 'Your Beauty Starts Here'}
                </h2>
                <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-6 max-w-md mx-auto">
                  {isRTL ? 'اكتشفي أحدث منتجات المكياج والعناية بالبشرة' : 'Discover the latest makeup and skincare products'}
                </p>
                <Link href="/products">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold rounded-xl px-8 shadow-xl" data-testid="button-cta-shop">
                    <ShoppingBag className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {isRTL ? 'تسوقي الآن' : 'Shop Now'}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* All Products Grid */}
      {allProductsList.length > 6 && (
        <section className="py-8 sm:py-12 bg-white" data-testid="all-products-section">
          <div className="container px-3 sm:px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-2xl font-black">{isRTL ? 'تصفحي المنتجات' : 'Browse Products'}</h2>
              <Link href="/products">
                <Button variant="outline" size="sm" className="rounded-xl font-semibold border-primary/20 text-primary hover:bg-primary/5">
                  {isRTL ? 'المتجر الكامل' : 'Full Store'}
                  {isRTL ? <ChevronLeft className="mr-1 h-4 w-4" /> : <ChevronRight className="ml-1 h-4 w-4" />}
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
              {allProductsList.slice(6).map((product) => (
                <div key={product.id} data-testid={`card-product-${product.id}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
