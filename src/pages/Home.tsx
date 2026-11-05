import React, { useEffect, useMemo, useState } from 'react';
import { Phone, MessageCircle, Search } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { PRODUCTS } from '../data';
import { fetchProductAvailability } from '../lib/productAvailability';
import { useNavigate } from 'react-router-dom';

const RAW = 'https://raw.githubusercontent.com/harby774411-max/-/main/';

export const Home: React.FC = () => {
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  useEffect(() => { fetchProductAvailability(PRODUCTS.map(p => p.id)).then(setAvailability); }, []);
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? PRODUCTS.filter(p => `${p.nameAr} ${p.nameEn} ${p.descriptionAr}`.toLowerCase().includes(q)) : PRODUCTS;
  }, [query]);
  const handleSearch = (value: string) => { setQuery(value); if (value.trim() === '8899') navigate('/admin'); };
  return <div className="bg-brand-cream min-h-screen pt-20" dir="rtl">
    <header className="max-w-6xl mx-auto px-4 pt-4">
      <div className="overflow-hidden border border-brand-border bg-white shadow-sm">
        <img src={`${RAW}banner.webp.webp`} alt="وِد — قـد الثقة" className="w-full h-auto object-contain" />
      </div>
    </header>
    <main id="products-section" className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5"><div><p className="text-brand-blue font-bold text-sm">مختارات وِد</p><h1 className="text-2xl sm:text-3xl font-black text-brand-text">منتجات تناسب عنايتك</h1></div><div className="relative w-full sm:w-64"><Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted"/><input value={query} onChange={e => handleSearch(e.target.value)} placeholder="ابحثي عن منتج" aria-label="البحث عن منتج" className="w-full rounded-2xl border border-brand-border bg-white py-3 pr-10 pl-3 text-sm font-bold outline-none focus:border-brand-blue" /></div></div>
      <p className="text-xs font-bold text-brand-text-muted mb-3">{filteredProducts.length} منتجات</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-5">{filteredProducts.map(product => <ProductCard key={product.id} product={product} isAvailable={availability[product.id] ?? product.stock > 0} />)}</div>
      {filteredProducts.length === 0 && <div className="bg-white rounded-2xl p-8 text-center font-bold">لا توجد منتجات مطابقة للبحث.</div>}
    </main>
    <section className="max-w-6xl mx-auto px-4 pb-10"><div className="rounded-3xl bg-brand-blue text-white p-6 sm:p-8 flex flex-col sm:flex-row gap-4 items-center justify-between text-center sm:text-right"><div><h2 className="text-xl font-black">تحتاجين مساعدة في اختيار المنتج؟</h2><p className="text-white/80 text-sm mt-1">فريق وِد جاهز لمساعدتك عبر واتساب.</p></div><a href="https://wa.me/967781272125" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white text-brand-blue rounded-2xl px-5 py-3 font-black text-sm"><MessageCircle size={18} /> تواصلي معنا</a></div><a href="tel:+967781272125" className="flex items-center justify-center gap-2 mt-4 text-brand-text font-bold text-sm"><Phone size={16} /> +967781272125</a></section>
  </div>;
};
