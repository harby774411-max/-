import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Menu, X, Phone, MapPin, Mail 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import { useSettings } from '../lib/useSettings';
import { WedLogo } from './WedLogo';
import { 
  WhatsAppIcon, InstagramIcon, TikTokIcon, SnapchatIcon, FacebookIcon, TelegramIcon 
} from './SocialIcons';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query === '8899' || query === 'yass') {
      navigate('/admin/login');
      setSearchQuery('');
      setIsSearchOpen(false);
      return;
    }
    if (query) {
      navigate(`/products?q=${encodeURIComponent(query)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  // Nav links with distinct items and generous spacing
  const navLinks = [
    { nameAr: 'الرئيسية', path: '/' },
    { nameAr: 'باقات ود', path: '/products?category=bundles' },
    { nameAr: 'تتبع طلبك', path: '/track' },
    { nameAr: 'عن ود', path: '/about' },
    { nameAr: 'تواصل معنا', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group py-2">
            <WedLogo size="md" variant="default" />
          </Link>

          {/* Desktop Navigation Links with generous spacing */}
          <div className="hidden lg:flex items-center space-x-reverse space-x-8 xl:space-x-10">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path && !location.search;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "arabic-text text-sm sm:text-base transition-all duration-200 py-1.5 px-1 relative hover:text-brand-blue",
                    isActive ? "text-brand-blue font-black" : "text-brand-text font-bold"
                  )}
                >
                  {link.nameAr}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Action Icons & Wider Search Button with icon and 'بحث' */}
          <div className="flex items-center space-x-reverse space-x-2.5">
            {/* Top Search Button: Wider, with magnifying glass icon and text 'بحث' */}
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div 
                className={cn(
                  "flex items-center bg-[#F0F3F6] hover:bg-white focus-within:bg-white rounded-full border border-brand-border px-3 py-1.5 transition-all shadow-2xs",
                  isSearchOpen ? "w-44 sm:w-56 border-brand-blue ring-1 ring-brand-blue/30" : "w-24 sm:w-32 cursor-pointer"
                )}
                onClick={() => {
                  if (!isSearchOpen) setIsSearchOpen(true);
                }}
              >
                <Search className="w-3.5 h-3.5 text-brand-blue shrink-0 ml-1.5" />
                <input
                  type="text"
                  placeholder="بحث..."
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 arabic-text text-[11px] sm:text-xs outline-none text-brand-text placeholder:text-brand-text-muted font-bold"
                />
                {isSearchOpen && searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    className="text-brand-text-muted hover:text-brand-text p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </form>

            {/* WhatsApp Quick Link */}
            <a
              href={`https://wa.me/${(settings.whatsapp_orders || settings.whatsapp || '+967770000000').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-brand-text border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white rounded-full text-xs font-bold transition-all shadow-2xs"
              title="تواصل واتساب"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] group-hover:text-white" />
              <span>واتساب وِد</span>
            </a>

            {/* Cart Icon */}
            <Link 
              to="/cart" 
              className="p-2.5 bg-brand-blue text-white rounded-full hover:bg-brand-blue-dark transition-all relative group shadow-xs cursor-pointer"
              title="سلة التسوق"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#233446] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-md ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Menu */}
            <button
              className="lg:hidden p-2.5 bg-[#F0F3F6] border border-brand-border rounded-full text-brand-text hover:bg-brand-gray-light transition-colors cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
              title="القائمة"
            >
              {isOpen ? <X className="w-5 h-5 text-brand-text" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Without 'المنتجات') */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-brand-border overflow-hidden shadow-lg"
          >
            <div className="px-6 py-6 space-y-3 text-right">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block arabic-text text-base font-bold text-brand-text hover:text-brand-blue py-2.5 border-b border-brand-border/40"
                  onClick={() => setIsOpen(false)}
                >
                  {link.nameAr}
                </Link>
              ))}
              
              {/* Authentic Social Media Brand Icons */}
              <div className="pt-3 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-brand-text-muted block text-center">تابعينا وتواصلي معنا</span>
                <div className="flex justify-center items-center gap-3 pt-1">
                  {settings.instagram && (
                    <a 
                      href={settings.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
                      title="Instagram"
                    >
                      <InstagramIcon className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {settings.tiktok && (
                    <a 
                      href={settings.tiktok} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
                      title="TikTok"
                    >
                      <TikTokIcon className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {settings.snapchat && (
                    <a 
                      href={settings.snapchat} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-xl bg-[#FFFC00] text-black flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
                      title="Snapchat"
                    >
                      <SnapchatIcon className="w-5 h-5 text-black" />
                    </a>
                  )}
                  {settings.facebook && (
                    <a 
                      href={settings.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
                      title="Facebook"
                    >
                      <FacebookIcon className="w-5 h-5 text-white" />
                    </a>
                  )}
                  <a 
                    href={`https://wa.me/${(settings.whatsapp_orders || settings.whatsapp || '+967770000000').replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
                    title="WhatsApp"
                  >
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#233446] text-white pt-14 pb-10 border-t border-brand-border relative overflow-hidden text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <WedLogo size="lg" variant="white" />
            <p className="arabic-text text-white/80 leading-relaxed text-xs sm:text-sm">
              «وِد» - علامة يمنية موثوقة للعناية بالبشرة، تجمع بين نقاء المكونات الطبيعية والتركيبات الفعالة لتجربة عناية ميسرة وبشرة نضرة.
            </p>
            {/* Authentic Brand Social Icons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {settings.instagram && (
                <a 
                  href={settings.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform" 
                  title="Instagram"
                >
                  <InstagramIcon className="w-4 h-4 text-white" />
                </a>
              )}
              {settings.tiktok && (
                <a 
                  href={settings.tiktok} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform" 
                  title="TikTok"
                >
                  <TikTokIcon className="w-4 h-4 text-white" />
                </a>
              )}
              {settings.snapchat && (
                <a 
                  href={settings.snapchat} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-xl bg-[#FFFC00] text-black flex items-center justify-center shadow-xs hover:scale-110 transition-transform" 
                  title="Snapchat"
                >
                  <SnapchatIcon className="w-4 h-4 text-black" />
                </a>
              )}
              {settings.facebook && (
                <a 
                  href={settings.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform" 
                  title="Facebook"
                >
                  <FacebookIcon className="w-4 h-4 text-white" />
                </a>
              )}
              {settings.telegram && (
                <a 
                  href={settings.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform" 
                  title="Telegram"
                >
                  <TelegramIcon className="w-4 h-4 text-white" />
                </a>
              )}
              <a 
                href={`https://wa.me/${(settings.whatsapp_orders || settings.whatsapp || '+967770000000').replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform" 
                title="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="arabic-text text-sm sm:text-base font-black mb-4 text-brand-pink border-r-2 border-brand-blue pr-3">روابط المتجر</h4>
            <ul className="space-y-2.5 arabic-text text-xs sm:text-sm text-white/80 font-medium">
              <li><Link to="/products?category=bundles" className="hover:text-brand-blue transition-colors">باقات ود المتكاملة</Link></li>
              <li><Link to="/track" className="hover:text-brand-blue transition-colors">تتبع حالة الطلب</Link></li>
              <li><Link to="/about" className="hover:text-brand-blue transition-colors">عن ود</Link></li>
              <li><Link to="/contact" className="hover:text-brand-blue transition-colors">تواصل وطلب سريع</Link></li>
            </ul>
          </div>

          {/* Policies & Assurance */}
          <div>
            <h4 className="arabic-text text-sm sm:text-base font-black mb-4 text-brand-pink border-r-2 border-brand-blue pr-3">الخدمة والتوصيل</h4>
            <ul className="space-y-2.5 arabic-text text-xs sm:text-sm text-white/80 font-medium">
              <li><Link to="/contact" className="hover:text-brand-blue transition-colors">توصيل مجاني داخل صنعاء</Link></li>
              <li><Link to="/contact" className="hover:text-brand-blue transition-colors">شحن موثوق لجميع المحافظات</Link></li>
              <li><Link to="/contact" className="hover:text-brand-blue transition-colors">الدفع عند الاستلام أو التحويل</Link></li>
              <li><Link to="/about" className="hover:text-brand-blue transition-colors">ضمان الجودة والأصالة</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="arabic-text text-sm sm:text-base font-black mb-4 text-brand-pink border-r-2 border-brand-blue pr-3">تواصلي معنا</h4>
            <ul className="space-y-3 arabic-text text-xs sm:text-sm text-white/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <span>صنعاء، اليمن</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-blue shrink-0" />
                <span dir="ltr" className="font-sans font-bold">{settings.whatsapp || '+967 770 000 000'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-blue shrink-0" />
                <span className="font-sans">{settings.email || 'care@wad-beauty.com'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60 arabic-text">
          <p>© {new Date().getFullYear()} «ود» للعناية بالبشرة. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <span>صنعاء - الجمهورية اليمنية</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
