import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";

const fallbackAnnouncements = [
  { ar: "شحن مجاني للطلبات فوق 200 ريال", en: "Free shipping on orders over 200 SAR" },
  { ar: "خصم 15% على طلبك الأول - استخدمي كود WELCOME15", en: "15% off your first order - Use code WELCOME15" },
  { ar: "منتجات أصلية 100% مع ضمان الجودة", en: "100% Authentic products with quality guarantee" },
];

export function MarketingBanners() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { data: marketing } = useQuery<any[]>({ 
    queryKey: ["/api/marketing/active"],
    queryFn: async () => {
      const res = await fetch("/api/marketing/active", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
  const [showPopup, setShowPopup] = useState(false);
  const [activePopup, setActivePopup] = useState<any>(null);
  const [visible, setVisible] = useState(true);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);

  useEffect(() => {
    if (!marketing) return;
    const popup = marketing.find(m => m.type === 'popup' && m.isActive);
    if (popup && !showPopup) {
      const timer = setTimeout(() => {
        setActivePopup(popup);
        setShowPopup(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [marketing, showPopup]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % fallbackAnnouncements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const banners = marketing?.filter(m => m.type === 'banner' && m.isActive) || [];

  return (
    <>
      {visible && (
        <div className="bg-gradient-to-r from-[#6b1219] via-[#8B1D24] to-[#6b1219] text-white relative overflow-hidden" data-testid="marketing-banner">
          {banners.length > 0 ? (
            <div className="flex animate-marquee whitespace-nowrap gap-8 items-center py-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-8 items-center">
                  {banners.map((banner: any) => (
                    <div key={banner.id} className="flex items-center gap-4">
                      <span className="text-[10px] font-bold tracking-wider">{banner.title}</span>
                      <div className="w-1 h-1 bg-white/30 rounded-full" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="container flex items-center justify-center h-9 sm:h-10 px-10 relative">
              <button
                onClick={() => setCurrentAnnouncement((prev) => (prev - 1 + fallbackAnnouncements.length) % fallbackAnnouncements.length)}
                className={`absolute ${isRTL ? 'right-2' : 'left-2'} text-white/50 hover:text-white transition-colors p-1`}
              >
                {isRTL ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
              </button>

              <AnimatePresence mode="wait">
                <motion.p
                  key={currentAnnouncement}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-[11px] sm:text-xs font-semibold text-center"
                >
                  {isRTL ? fallbackAnnouncements[currentAnnouncement].ar : fallbackAnnouncements[currentAnnouncement].en}
                </motion.p>
              </AnimatePresence>

              <button
                onClick={() => setCurrentAnnouncement((prev) => (prev + 1) % fallbackAnnouncements.length)}
                className={`absolute ${isRTL ? 'left-8' : 'right-8'} text-white/50 hover:text-white transition-colors p-1`}
              >
                {isRTL ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={() => setVisible(false)}
                className={`absolute ${isRTL ? 'left-2' : 'right-2'} text-white/50 hover:text-white transition-colors p-1`}
                data-testid="banner-close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-none bg-transparent shadow-none">
          {activePopup && (
            <div className="relative group bg-white shadow-2xl rounded-2xl overflow-hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 left-4 z-50 text-white bg-black/20 hover:bg-black/40 rounded-full"
                onClick={() => setShowPopup(false)}
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={activePopup.image} 
                  alt={activePopup.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 text-white text-right">
                  <h2 className="text-3xl font-black mb-2">{activePopup.title}</h2>
                  {activePopup.link && (
                    <a href={activePopup.link} className="inline-block mt-4">
                      <Button className="rounded-xl bg-white text-primary font-bold text-xs h-12 px-8 hover:bg-primary hover:text-white transition-all">
                        {isRTL ? 'تسوقي الآن' : 'Shop Now'}
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
