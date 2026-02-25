import logoImg from "@/assets/logo.png";
import freelanceDocImg from "@assets/image_1772029235148.png";
import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Menu, LogOut, Sun, Moon, Phone, Mail, Instagram, Twitter, Download, Globe, Check, Wallet, Search, Heart, ChevronDown, MapPin, Headphones } from "lucide-react";
import { SiTiktok, SiSnapchat, SiWhatsapp, SiX } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/hooks/use-language";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

import Screenshot_2026_02_25_072355 from "@assets/Screenshot 2026-02-25 072355.png";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const cartItems = useCart((state) => state.items);
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    // Set initial direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, [language]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const isDashboard = location.startsWith('/dashboard') || location.startsWith('/admin');

  if (isDashboard) {
    return <main className="min-h-screen bg-[#f8fafc]">{children}</main>;
  }

  const closeSidebar = () => setIsSidebarOpen(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [, setLoc] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLoc(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50/50 text-black flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Info Bar - Desktop Only */}
      <div className="hidden md:block bg-[#f7f7f7] border-b border-gray-200/80">
        <div className="container flex items-center justify-between h-8 px-4 text-[10px] text-gray-500">
          <div className="flex items-center gap-4">
            <a href="tel:+966538512423" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Headphones className="h-3 w-3" />
              <span dir="ltr">966 53 851 2423</span>
            </a>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {language === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {deferredPrompt && (
              <button onClick={handleInstall} className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium">
                <Download className="h-3 w-3" />
                {t('installApp')}
              </button>
            )}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium"
              data-testid="button-language-toggle"
            >
              <Globe className="h-3 w-3" />
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      </div>
      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white shadow-sm safe-top">
        <div className="container flex items-center h-14 sm:h-16 md:h-[72px] px-3 sm:px-4 gap-3 md:gap-6">
          {/* Mobile Menu */}
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden shrink-0 h-9 w-9 hover:bg-primary/5" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={language === 'ar' ? "right" : "left"} className="w-[85%] max-w-sm flex flex-col p-0 border-none bg-white">
              <div className="p-6 bg-gradient-to-br from-primary to-primary/80">
                <Link href="/" onClick={closeSidebar} className="flex items-center gap-3">
                  <img src={logoImg} alt="Anne Beauty" className="h-12 w-auto object-contain" />
                  <div>
                    <p className="text-white font-bold text-sm">Anne Beauty</p>
                    <p className="text-white/70 text-xs">آن بيوتي</p>
                  </div>
                </Link>
              </div>
              
              <div className={`flex flex-col flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="py-2">
                  <Link href="/" onClick={closeSidebar} className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors ${location === '/' ? 'text-primary bg-primary/5 border-r-4 border-primary' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {t('home')}
                  </Link>
                  <Link href="/products" onClick={closeSidebar} className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors ${location === '/products' ? 'text-primary bg-primary/5 border-r-4 border-primary' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {t('shop')}
                  </Link>
                  {user && (
                    <>
                      <Link href="/orders" onClick={closeSidebar} className="flex items-center gap-3 px-6 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        {t('myOrders')}
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" onClick={closeSidebar} className="flex items-center gap-3 px-6 py-4 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
                          {t('adminPanel')}
                        </Link>
                      )}
                    </>
                  )}
                </div>
                
                <div className="border-t mt-auto" />
                
                <div className="p-6">
                  <button
                    onClick={() => { setLanguage(language === 'ar' ? 'en' : 'ar'); closeSidebar(); }}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-4"
                  >
                    <Globe className="h-4 w-4" />
                    {language === 'ar' ? 'English' : 'العربية'}
                  </button>
                  
                  {deferredPrompt && (
                    <Button 
                      onClick={() => { handleInstall(); closeSidebar(); }}
                      className="w-full bg-primary text-white font-semibold rounded-xl h-11"
                    >
                      <Download className="h-4 w-4" />
                      {t('installApp')}
                    </Button>
                  )}
                </div>
                
                <div className="p-6 pt-0">
                  <p className="text-[10px] font-semibold text-gray-400 mb-4">{t('connectWithUs')}</p>
                  <div className={`flex gap-4 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                    <a href="https://www.instagram.com/annebeauty.sa/" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all"><Instagram className="h-4 w-4" /></a>
                    <a href="https://x.com/AnneBeautySA" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all"><SiX className="h-4 w-4" /></a>
                    <a href="https://www.tiktok.com/@annebeauty.sa" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-all"><SiTiktok className="h-4 w-4" /></a>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity" data-testid="link-logo">
            <img src={logoImg} alt="Anne Beauty" className="h-9 sm:h-10 md:h-12 w-auto object-contain" />
            <div className={`hidden sm:flex flex-col ${language === 'ar' ? 'mr-2.5 border-r border-primary/15 pr-2.5' : 'ml-2.5 border-l border-primary/15 pl-2.5'}`}>
              <span className="text-[10px] md:text-xs font-bold leading-none text-primary">Anne Beauty</span>
              <span className="text-[8px] md:text-[10px] font-medium leading-none text-gray-400 mt-0.5">آن بيوتي</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className={`hidden md:flex items-center gap-1 ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>
            <Link href="/" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${location === '/' ? 'text-primary bg-primary/5' : 'text-gray-600 hover:text-primary hover:bg-primary/5'}`}>{t('home')}</Link>
            <Link href="/products" className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${location === '/products' ? 'text-primary bg-primary/5' : 'text-gray-600 hover:text-primary hover:bg-primary/5'}`}>{t('shop')}</Link>
          </div>

          {/* Search Bar - Center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-2 md:mx-4">
            <div className="relative">
              <Input 
                placeholder={language === 'ar' ? 'ابحثي عن منتجات...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`h-10 md:h-11 bg-gray-50 border-gray-200 rounded-xl ${language === 'ar' ? 'pr-4 pl-11' : 'pl-4 pr-11'} text-sm focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all hover:bg-white hover:border-gray-300`}
                data-testid="input-search"
              />
              <button type="submit" className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'left-1' : 'right-1'} h-8 w-8 md:h-9 md:w-9 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors`} data-testid="button-search">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* Language Toggle - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="md:hidden h-9 w-9 hover:bg-primary/5 hover:text-primary transition-colors"
              data-testid="button-language-mobile"
            >
              <Globe className="h-4.5 w-4.5" />
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10 hover:bg-primary/5 hover:text-primary transition-colors" data-testid="button-cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className={`absolute -top-0.5 ${language === 'ar' ? '-left-0.5' : '-right-0.5'} h-[18px] min-w-[18px] px-1 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center shadow-sm`}>
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 sm:h-10 px-1.5 sm:px-2 flex items-center gap-1.5 sm:gap-2 hover:bg-primary/5 rounded-xl transition-all" data-testid="button-account-menu">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm">
                      {(user?.name || user?.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-[9px] text-gray-400 font-medium">{language === 'ar' ? 'مرحباً' : 'Hello'}</span>
                      <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[80px]">{user?.name || user?.username}</span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-gray-400 hidden lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={language === 'ar' ? "end" : "start"} className="w-64 p-1.5 rounded-xl border-gray-200 shadow-xl bg-white">
                  <div className="px-3 py-3 mb-1 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-lg">
                      {(user?.name || user?.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-medium">{t('welcome') || 'مرحباً بك'}</span>
                      <span className="text-sm font-bold text-gray-800 truncate max-w-[140px]">{user?.name || user?.username}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-0.5">
                    <Link href="/profile">
                      <DropdownMenuItem className={`cursor-pointer gap-3 px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-primary/5 hover:text-primary transition-all rounded-lg ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <User className="h-4 w-4 text-gray-400" />
                        {t('myAccount') || 'حسابي'}
                      </DropdownMenuItem>
                    </Link>
                    
                    <div className={`flex items-center justify-between px-3 py-2.5 bg-primary/5 rounded-lg ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <Wallet className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-gray-500">{t('wallet') || 'المحفظة'}</span>
                      </div>
                      <span dir="ltr" className="text-sm font-bold text-primary">{(user as any)?.walletBalance?.toLocaleString() || '0'} {t('currency')}</span>
                    </div>

                    <Link href="/orders">
                      <DropdownMenuItem className={`cursor-pointer gap-3 px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-primary/5 hover:text-primary transition-all rounded-lg ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <ShoppingBag className="h-4 w-4 text-gray-400" />
                        {t('myOrders') || 'طلباتي'}
                      </DropdownMenuItem>
                    </Link>
                    
                    {user?.role === 'admin' && (
                      <Link href="/admin">
                        <DropdownMenuItem className={`cursor-pointer gap-3 px-3 py-2.5 text-xs font-medium text-primary hover:bg-primary/5 transition-all rounded-lg ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                          <Check className="h-4 w-4" />
                          {t('adminPanel')}
                        </DropdownMenuItem>
                      </Link>
                    )}
                    
                    <DropdownMenuSeparator className="my-1 bg-gray-100" />
                    
                    <DropdownMenuItem onClick={() => logout()} className={`cursor-pointer gap-3 px-3 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-all rounded-lg ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <LogOut className="h-4 w-4" />
                      {t('signOut')}
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-9 sm:h-10 px-3 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" data-testid="button-sign-in">
                  <User className={`h-4 w-4 ${language === 'ar' ? 'ml-1.5' : 'mr-1.5'} hidden sm:block`} />
                  {t('signIn')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      {/* Floating WhatsApp Button */}
      <a
        href="https://api.whatsapp.com/send/?phone=966538512423&text&type=phone_number&app_absent=0"
        target="_blank"
        rel="noreferrer"
        className={`fixed bottom-6 ${language === 'ar' ? 'right-6' : 'left-6'} z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:scale-110 transition-transform group`}
      >
        <span className="font-bold whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500">{t('contactUs')}</span>
        <SiWhatsapp className="h-6 w-6" />
      </a>
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-0">
        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-primary/90 via-primary to-primary/90">
          <div className="container px-4 py-8 sm:py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                <h3 className="text-white font-bold text-base sm:text-lg">{language === 'ar' ? 'اشتركي في نشرتنا البريدية' : 'Subscribe to our newsletter'}</h3>
                <p className="text-white/70 text-xs sm:text-sm mt-1">{language === 'ar' ? 'احصلي على أحدث العروض والخصومات' : 'Get the latest offers and discounts'}</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <input type="email" placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Your email'} className={`flex-1 md:w-72 h-11 px-4 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 ${language === 'ar' ? 'text-right' : 'text-left'}`} data-testid="input-newsletter" />
                <Button className="h-11 px-6 bg-white text-primary font-bold rounded-xl hover:bg-white/90 text-sm" data-testid="button-newsletter">
                  {language === 'ar' ? 'اشتراك' : 'Subscribe'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container px-4 py-10 sm:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
            {/* About */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <img src={Screenshot_2026_02_25_072355} alt="Anne Beauty" className="h-10 sm:h-12 w-auto object-contain brightness-0 invert" />
                <div>
                  <p className="text-white font-bold text-sm">Anne Beauty</p>
                  <p className="text-gray-500 text-[10px]">آن بيوتي</p>
                </div>
              </Link>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
                {language === 'ar' 
                  ? "وجهتك المفضلة لمنتجات التجميل الأصلية في المملكة العربية السعودية. جودة عالية وتوصيل سريع."
                  : "Your go-to destination for authentic beauty products in Saudi Arabia. Premium quality with fast delivery."}
              </p>
              <div className="flex gap-2">
                <a href="https://www.instagram.com/annebeauty.sa/" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors" data-testid="link-instagram"><Instagram className="h-3.5 w-3.5" /></a>
                <a href="https://x.com/AnneBeautySA" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors" data-testid="link-x"><SiX className="h-3.5 w-3.5" /></a>
                <a href="https://www.snapchat.com/@annebeauty.sa" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-[#FFFC00] hover:text-black transition-colors" data-testid="link-snapchat"><SiSnapchat className="h-3.5 w-3.5" /></a>
                <a href="https://www.tiktok.com/@annebeauty.sa" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors" data-testid="link-tiktok"><SiTiktok className="h-3.5 w-3.5" /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">{language === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">{t('home')}</Link></li>
                <li><Link href="/products" className="text-gray-400 hover:text-white transition-colors">{t('shop')}</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">{t('terms')}</Link></li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">{t('help')}</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">{language === 'ar' ? 'سياسة الاسترجاع' : 'Return Policy'}</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">{language === 'ar' ? 'الشحن والتوصيل' : 'Shipping & Delivery'}</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">{language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">{t('contactUs')}</h4>
              <div className="space-y-3 text-xs sm:text-sm">
                <a href="tel:+966538512423" className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-primary flex items-center justify-center transition-colors shrink-0"><Phone className="h-3.5 w-3.5" /></div>
                  <span dir="ltr">966 53 851 2423</span>
                </a>
                <a href="mailto:aannebeauty@gmail.com" className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-primary flex items-center justify-center transition-colors shrink-0"><Mail className="h-3.5 w-3.5" /></div>
                  <span dir="ltr" className="truncate">aannebeauty@gmail.com</span>
                </a>
                <a href="https://api.whatsapp.com/send/?phone=966538512423" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-[#25D366] flex items-center justify-center transition-colors shrink-0"><SiWhatsapp className="h-3.5 w-3.5" /></div>
                  <span>{t('whatsapp')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Certification */}
        <div className="border-t border-gray-800">
          <div className="container px-4 py-6 sm:py-8">
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                <div className="h-8 sm:h-9 w-auto px-2 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/apple_pay.svg" loading="lazy" alt="Apple Pay" className="h-5 object-contain brightness-0 invert opacity-70" />
                </div>
                <div className="h-8 sm:h-9 w-auto px-2 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/mada-circle.png" loading="lazy" alt="Mada" className="h-5 object-contain brightness-0 invert opacity-70" />
                </div>
                <div className="h-8 sm:h-9 w-auto px-2 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/visa-circle.png" loading="lazy" alt="Visa" className="h-5 object-contain brightness-0 invert opacity-70" />
                </div>
                <div className="h-8 sm:h-9 w-auto px-2 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/mastercard-circle.png" loading="lazy" alt="Mastercard" className="h-5 object-contain brightness-0 invert opacity-70" />
                </div>
                <div className="h-8 sm:h-9 w-auto px-2 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/stc_pay.png" loading="lazy" alt="STC Pay" className="h-5 object-contain brightness-0 invert opacity-70" />
                </div>
                <div className="h-8 sm:h-9 w-auto px-2 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/tabby2.svg" loading="lazy" alt="Tabby" className="h-5 object-contain brightness-0 invert opacity-70" />
                </div>
                <div className="h-8 sm:h-9 w-auto px-2 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <img src="https://media.zid.store/cdn-cgi/image/h=80,q=100/https://media.zid.store/static/tamara2.svg" loading="lazy" alt="Tamara" className="h-5 object-contain brightness-0 invert opacity-70" />
                </div>
              </div>

              <a 
                href="https://eauthenticate.saudibusiness.gov.sa/certificate-details/0000203202" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img 
                  src={freelanceDocImg}
                  loading="lazy" 
                  alt="وثيقة العمل الحر" 
                  className="h-10 w-auto object-contain" 
                />
                <span className="text-[10px] font-medium text-gray-500">{language === 'ar' ? 'وثيقة العمل الحر' : 'Freelance Document'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800">
          <div className="container px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>© 2026 Anne Beauty. {t('allRightsReserved')}.</p>
            <p className="text-[10px]">{t('madeWithLove')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
