import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import logoImg from "@/assets/logo.png";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"loading" | "reveal">("loading");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 1200);
    const t2 = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 900);
    }, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #fff5f5 0%, #ffffff 50%, #fff0f0 100%)" }}
        >
          {/* Subtle background decorations */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.06, scale: 1 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, #8B1D24 0%, transparent 70%)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.05, scale: 1 }}
            transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
            className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, #8B1D24 0%, transparent 70%)" }}
          />

          {/* Thin top line accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute top-0 left-0 right-0 h-[2px] origin-left"
            style={{ background: "linear-gradient(90deg, transparent, #8B1D24, #c0392b, transparent)" }}
          />

          {/* Main content */}
          <div className="relative flex flex-col items-center gap-0">
            {/* Outer ring glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: phase === "reveal" ? 0.15 : 0, scale: phase === "reveal" ? 1.6 : 0.6 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute w-52 h-52 rounded-full pointer-events-none"
              style={{ border: "1px solid #8B1D24" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: phase === "reveal" ? 0.08 : 0, scale: phase === "reveal" ? 2.2 : 0.6 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
              className="absolute w-52 h-52 rounded-full pointer-events-none"
              style={{ border: "1px solid #8B1D24" }}
            />

            {/* Logo */}
            <motion.div
              initial={{ y: 30, opacity: 0, filter: "blur(12px)", scale: 0.85 }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="relative z-10 mb-6"
            >
              <img
                src={logoImg}
                alt="Anne Beauty"
                className="h-28 w-auto object-contain drop-shadow-[0_4px_24px_rgba(139,29,36,0.18)]"
              />
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: phase === "reveal" ? 1 : 0, y: phase === "reveal" ? 0 : 16 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="overflow-hidden text-center"
            >
              <p className="text-[11px] font-black uppercase tracking-[0.45em] text-black/35 mb-1">
                Unleash Your Inner Glow
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/20">
                آن بيوتي · Premium Beauty
              </p>
            </motion.div>

            {/* Progress bar */}
            <div className="mt-10 relative overflow-hidden" style={{ width: "120px", height: "1px" }}>
              <div className="absolute inset-0 bg-black/8 rounded-full" />
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.8, ease: "easeInOut", delay: 0.4 }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #8B1D24, #c0392b)" }}
              />
            </div>
          </div>

          {/* Bottom branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="absolute bottom-10 text-center"
          >
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-black/18">
              AnneBeauty.sa · © 2026
            </p>
          </motion.div>

          {/* Thin bottom line accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.4 }}
            className="absolute bottom-0 left-0 right-0 h-[2px] origin-right"
            style={{ background: "linear-gradient(90deg, transparent, #8B1D24, #c0392b, transparent)" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
