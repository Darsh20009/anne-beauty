import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Star, ShieldCheck, Truck, ChevronRight, ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, useMemo } from "react";
import { MarketingBanners } from "@/components/marketing-banners";
import heroImg from "@assets/Screenshot_2026-02-25_075934_1771995737623.png";
import heroImg2 from "@assets/Screenshot_2026-02-25_080037_1771995737624.png";
import heroImg3 from "@assets/Screenshot_2026-02-25_080154_1771995737625.png";
import heroImg4 from "@assets/Screenshot_2026-02-25_080206_1771995737625.png";
import mergeImg from "@assets/Screenshot_2026-02-25_075934_1771995737623.png";
import doubleLayerImg from "@assets/Screenshot_2026-02-25_080037_1771995737624.png";
import shoppingImg from "@assets/Screenshot_2026-02-25_080154_1771995737625.png";
import womenImg from "@assets/Screenshot_2026-02-25_080206_1771995737625.png";
import burgundyImg from "@assets/Screenshot_2026-02-25_075934_1771995737623.png";

const heroImages = [heroImg, heroImg2, heroImg3, heroImg4];

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = useProducts();
  const { t, language } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [collectionIndex, setCollectionIndex] = useState(0);
  const [isHeroLoaded, setIsHeroLoaded] = useState<{ [key: number]: boolean }>({});
  const [isCollectionLoaded, setIsCollectionLoaded] = useState<{ [key: number]: boolean }>({});
  
  const collectionImages = useMemo(() => [
    { src: mergeImg, label: language === 'ar' ? 'مكياج' : 'Makeup', title: 'GLOW' },
    { src: doubleLayerImg, label: language === 'ar' ? 'جمال' : 'Beauty', title: 'EYES' },
    { src: shoppingImg, label: language === 'ar' ? 'أناقة' : 'Elegance', title: 'STYLE' },
    { src: womenImg, label: language === 'ar' ? 'عناية' : 'Care', title: 'ANNE' },
    { src: burgundyImg, label: language === 'ar' ? 'إبداع' : 'Creative', title: 'BEAUTY' }
  ], [language]);

  // Preload all images
  useEffect(() => {
    const preloadImages = (images: string[]) => {
      images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };
    preloadImages(heroImages);
    preloadImages(collectionImages.map(img => img.src));
  }, [collectionImages]);

  useEffect(() => {
    if (user && ["admin", "employee", "support"].includes(user.role)) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  // Rotate hero images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  // Rotate collection images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCollectionIndex(prev => (prev + 1) % collectionImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [collectionImages]);

  const featuredProducts = products?.slice(0, 8) || [];

  return (
    <Layout>
      <MarketingBanners />
      {/* Image Carousel Section */}
      <section className="relative py-8 sm:py-12 md:py-20 lg:py-32 bg-white overflow-hidden">
        <div className="container px-3 sm:px-4">
          <div className="relative w-full max-w-2xl mx-auto overflow-hidden">
            <div className="relative aspect-[16/9] w-full">
              <AnimatePresence mode="wait">
                <motion.img
                  src={heroImages[currentImageIndex]}
                  alt={`Hero ${currentImageIndex + 1}`}
                  key={`current-${currentImageIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 1.2,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 w-full h-full object-contain block"
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Hero Section */}
      <section className="relative min-h-[80vh] sm:min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden bg-white">
        <div className="container relative z-10 grid lg:grid-cols-2 gap-6 sm:gap-8 items-center px-3 sm:px-4 py-12 sm:py-16 md:py-20 md:pt-20">
          <motion.div 
            initial={{ opacity: 0, x: language === 'ar' ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className={language === 'ar' ? "text-right z-20" : "text-left z-20"}
          >
            <span className="inline-block text-[10px] sm:text-xs font-bold tracking-[0.2em] text-primary mb-3 sm:mb-4 uppercase">
              {language === 'ar' ? '✦ مجموعة المكياج الجديدة' : '✦ New Makeup Collection'}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.9] mb-6 sm:mb-8 text-black tracking-tighter">
              ANNE BEAUTY
              <span className="block text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl mt-2 sm:mt-3 md:mt-4 font-light text-primary italic font-serif">Unleash Your Inner Glow</span>
              <span className="block text-sm md:text-base mt-2 font-bold text-muted-foreground">
                {language === 'ar' ? 'تجميل · رعاية · أناقة' : 'Beauty · Care · Elegance'}
              </span>
            </h1>
            <p className={`text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl mb-8 sm:mb-10 md:mb-12 max-w-md ${language === 'ar' ? 'mr-0 ml-auto' : 'ml-0 mr-auto'} leading-relaxed font-light`}>
              {language === 'ar' 
                ? 'اكتشفي عالم الجمال مع آن بيوتي. تشكيلات مكياج حصرية مختارة بعناية لتناسب ذوقك الرفيع وتُبرز جمالك الطبيعي.'
                : 'Discover the world of beauty with Anne Beauty. Exclusive makeup collections carefully curated to match your refined taste.'}
            </p>
            <div className={`flex gap-4 sm:gap-6 flex-wrap ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
              <Link href="/products">
                <Button size="lg" className="px-6 sm:px-8 md:px-10 py-6 sm:py-7 md:py-8 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] rounded-none shadow-2xl hover-elevate transition-all bg-primary text-white border-none">
                  {language === 'ar' ? 'تسوقي الآن' : 'Shop Now'} {language === 'ar' ? <ChevronLeft className="mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5" /> : <ChevronRight className="ml-2 sm:ml-3 h-4 sm:h-5 w-4 sm:w-5" />}
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1, delay: 0.2 }}
             className="relative hidden sm:block"
          >
            <div className="relative aspect-[3/4] md:aspect-square max-w-md sm:max-w-lg md:max-w-xl mx-auto group">
              <div className="absolute inset-0 border-[10px] sm:border-[15px] md:border-[20px] border-primary/5 -m-6 sm:-m-8 md:-m-10 hidden md:block" />
              <img 
                src={heroImg} 
                alt="Anne Beauty Hero" 
                className="w-full h-full object-cover shadow-2xl transition-all duration-1000"
              />
              <div className={`absolute -bottom-4 sm:-bottom-6 ${language === 'ar' ? '-right-4 sm:-right-6' : '-left-4 sm:-left-6'} bg-black text-white p-3 sm:p-4 md:p-6 hidden md:block`}>
                <p className="text-[8px] sm:text-[9px] tracking-widest uppercase font-bold mb-1">{t('featuredItem')}</p>
                <p className="text-sm sm:text-base md:text-lg font-black leading-none">ANNE BEAUTY SPECIAL</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-24 bg-white border-y border-primary/5 overflow-hidden">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-primary/8 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-4">
                {language === 'ar' ? 'منتجات أصيلة 100%' : '100% Authentic'}
              </h3>
              <p className="text-muted-foreground font-light italic">
                {language === 'ar' ? 'جميع منتجاتنا أصلية 100٪ من أفضل ماركات التجميل العالمية.' : 'All our products are 100% authentic from the finest global beauty brands.'}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-primary/8 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-4">
                {language === 'ar' ? 'توصيل سريع وآمن' : 'Fast & Safe Delivery'}
              </h3>
              <p className="text-muted-foreground font-light italic">
                {language === 'ar' ? 'توصيل لجميع مناطق المملكة مع تغليف فاخر يحمي منتجاتك.' : 'Delivery to all Saudi regions with luxury packaging to protect your beauty products.'}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-primary/8 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-4">
                {language === 'ar' ? 'ضمان الجودة' : 'Quality Guarantee'}
              </h3>
              <p className="text-muted-foreground font-light italic">
                {language === 'ar' ? 'ضمان استرجاع خلال 7 أيام إذا لم تكوني راضية عن المنتج.' : '7-day return guarantee if you are not satisfied with your product.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products showcase */}
      <section className="py-32 bg-white">
        <div className="container px-4">
          <div className={`flex flex-col md:flex-row justify-between items-end gap-8 mb-20 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-bold tracking-[0.2em] text-primary mb-4 uppercase">{t('discoverCollection')}</span>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">{t('exclusivePicks')}</h2>
              <p className="text-xl text-muted-foreground font-light italic">{t('heroDesc')}</p>
            </div>
            <Link href="/products">
              <Button size="lg" className="rounded-none border-black font-bold uppercase tracking-widest text-xs h-14 px-10 group bg-black text-white hover:bg-black/80 transition-all">
                {t('viewAllProducts')}
                {language === 'ar' ? <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> : <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-square bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  data-testid={`card-product-${product.id}`}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-8 opacity-20" />
              <p className="text-xl text-muted-foreground mb-10">{language === 'ar' ? 'لم نجد منتجات متاحة حالياً' : 'No products available at the moment'}</p>
              <Link href="/products">
                <Button size="lg" className="bg-black text-white">{language === 'ar' ? 'استكشف المتجر' : 'Explore Store'}</Button>
              </Link>
            </div>
          )}
        </div>
      </section>


      {/* Collection Showcase Section */}
      <section className="relative py-32 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="container px-4">
          <div className={`text-center max-w-3xl mx-auto mb-24 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <span className="inline-block text-xs font-bold tracking-[0.2em] text-primary mb-4 uppercase">{t('newCollection')}</span>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">{language === 'ar' ? 'تشكيلتنا الحصرية' : 'Our Exclusive Collection'}</h2>
            <p className="text-xl text-muted-foreground font-light italic">{language === 'ar' ? 'اكتشف التنوع والإبداع في كل قطعة' : 'Discover diversity and creativity in every piece'}</p>
          </div>
          
          <div className="relative w-full max-w-5xl mx-auto">
            {/* Carousel Container */}
            <div className="relative h-[500px] md:h-[700px] bg-gray-100 rounded-2xl overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                {/* Current Image */}
                <motion.img
                  src={collectionImages[collectionIndex].src}
                  alt={collectionImages[collectionIndex].title}
                  key={`current-collection-${collectionIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 1.2,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Overlay with Info */}
              <motion.div
                key={`overlay-${collectionIndex}`}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col items-end justify-end p-8"
              >
                <div className={`text-white ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p className="text-sm uppercase tracking-widest font-bold opacity-80">{collectionImages[collectionIndex].label}</p>
                  <p className="text-4xl md:text-5xl font-black">{collectionImages[collectionIndex].title}</p>
                </div>
              </motion.div>
            </div>

            {/* Navigation Indicators */}
            <div className="flex justify-center gap-3 mt-8">
              {collectionImages.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCollectionIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`rounded-full transition-all ${
                    index === collectionIndex 
                      ? 'w-10 h-3 bg-black' 
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                  data-testid={`carousel-indicator-${index}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 px-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCollectionIndex((prev) => (prev - 1 + collectionImages.length) % collectionImages.length)}
                className="p-3 rounded-full bg-black text-white hover-elevate transition-all"
                data-testid="button-collection-prev"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCollectionIndex((prev) => (prev + 1) % collectionImages.length)}
                className="p-3 rounded-full bg-black text-white hover-elevate transition-all"
                data-testid="button-collection-next"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story / CTA */}
      <section className="relative py-48 overflow-hidden text-white" style={{ background: "linear-gradient(135deg, #6b1219 0%, #8B1D24 50%, #a52330 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80" 
            alt="Beauty background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 0%, rgba(107,18,25,0.6) 100%)" }} />
        <div className="container px-4 relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
          >
            <span className="block text-xs font-bold tracking-[0.4em] uppercase opacity-60 mb-6">Anne Beauty</span>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12 leading-[0.9]">
              {language === 'ar' ? 'جمالك يبدأ من هنا' : 'Your Beauty Starts Here'}
            </h2>
            <p className="text-xl font-light italic mb-16 opacity-70 leading-relaxed">
              {language === 'ar' ? 'اكتشفي أحدث تشكيلات المكياج والعناية بالبشرة. منتجات مختارة بعناية لتُبرز جمالك الطبيعي.' : 'Discover the latest makeup and skincare collections. Products carefully chosen to enhance your natural beauty.'}
            </p>
            <Link href="/products">
              <Button size="lg" className="h-20 px-16 text-sm font-black uppercase tracking-[0.4em] rounded-none bg-white text-primary hover:bg-white/90 border-2 border-white transition-all duration-500">
                <ShoppingBag className={`${language === 'ar' ? 'ml-3' : 'mr-3'} h-5 w-5`} />
                {language === 'ar' ? 'تسوقي الآن' : 'Shop Now'}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
