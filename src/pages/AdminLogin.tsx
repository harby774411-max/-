import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Loader2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { WedLogo } from '../components/WedLogo';

export const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Support credentials: yass/7736 or PIN 8899 / admin credentials
    if ((username === 'yass' && password === '7736') || (username === 'admin' && password === '8899') || username === '8899') {
      localStorage.setItem('qurra_admin_auth', 'true');
      localStorage.setItem('qurra_admin_user', username || 'yass');
      localStorage.setItem('wed_admin_role', 'owner');
      navigate('/admin');
      setLoading(false);
      return;
    }

    setError('خطأ في اسم المستخدم أو رمز المرور. يرجى المحاولة مرة أخرى.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#FAF6F0] flex items-center justify-center px-4 text-brand-text">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[36px] shadow-xl p-8 sm:p-10 border border-brand-border"
      >
        <div className="text-center mb-8 space-y-3">
          <div className="flex justify-center mb-4">
            <WedLogo size="md" variant="burgundy" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blush-light rounded-full text-[11px] font-bold text-brand-burgundy border border-brand-blush/40">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
            <span>بوابة إدارة «ود» الرسمية</span>
          </div>
          <h1 className="arabic-text text-2xl font-black text-brand-burgundy">
            تسجيل دخول الطاقم الإداري
          </h1>
          <p className="arabic-text text-xs text-brand-text-muted">
            أدخلي بيانات الاعتماد المخصصة لمتابعة الطلبات والمخزون
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 text-right">
          <div className="space-y-1.5">
            <label className="arabic-text block text-xs font-bold text-gray-900">اسم المستخدم أو الرمز</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 focus:bg-white border border-gray-300 focus:border-[#722F37] rounded-2xl outline-none transition-all arabic-text text-sm font-bold text-gray-900 placeholder:text-gray-400"
                placeholder="yass أو 8899"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="arabic-text block text-xs font-bold text-gray-900">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="password"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 focus:bg-white border border-gray-300 focus:border-[#722F37] rounded-2xl outline-none transition-all arabic-text text-sm font-bold text-gray-900 placeholder:text-gray-400"
                placeholder="••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="arabic-text text-red-700 text-center text-xs font-bold bg-red-50 p-2.5 rounded-xl border border-red-200"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#722F37] text-white py-4 rounded-full text-sm font-black arabic-text hover:bg-[#582229] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <>
                <span>دخول لوحة التحكم</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-brand-border pt-4">
          <Link 
            to="/"
            className="arabic-text text-brand-text-muted hover:text-brand-burgundy text-xs font-bold transition-colors"
          >
            العودة إلى المتجر الرئيسي
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
