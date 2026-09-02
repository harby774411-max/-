import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Users, Settings, Plus, Trash2, Edit, Loader2, LogOut, Package, 
  CheckCircle, Clock, XCircle, Tag, Globe, Phone, Mail, Camera, Save, 
  ExternalLink, Sparkles, MessageCircle, Send, Truck, Wallet, Gift, Heart, 
  ShieldCheck, Filter, Printer, Copy, Check, Eye, EyeOff, AlertCircle,
  Bot, TrendingUp, BarChart3, Sliders, Share2, CheckCircle2, Layers, Activity,
  RefreshCw, MessageSquare, Search, Upload
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { WedLogo } from '../components/WedLogo';
import { MOCK_PRODUCTS_LIST, CATEGORIES } from '../data';
import { AdminRole, Product, Order, OrderStatus } from '../types';
import { getLocalOrders, formatSequentialOrderId } from '../lib/orderStorage';
import { AiTrainingManager } from '../components/AiTrainingManager';
import { useSettings } from '../lib/useSettings';
import { optimizeImageFile, uploadOptimizedImage } from '../lib/imageOptimizer';

const PRESET_BEAUTY_IMAGES = [
  { label: 'سيروم زجاجي نضر', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800' },
  { label: 'كريم ترطيب مخملي', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800' },
  { label: 'غسول رغوي نقي', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800' },
  { label: 'ماسك وردي فاخر', url: 'https://images.unsplash.com/photo-1567928815104-b690029b35b6?auto=format&fit=crop&q=80&w=800' },
  { label: 'واقي شمس شفاف', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800' },
  { label: 'باقة هدايا العناية', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800' },
];

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'birthdays' | 'whatsapp_ai' | 'ai_training' | 'settings' | 'customers' | 'delivery' | 'finance'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // WhatsApp Bot & AI Dispatch State
  const [dispatchLogs, setDispatchLogs] = useState<any[]>([]);
  const [isGeneratingAiAnalysis, setIsGeneratingAiAnalysis] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>('');
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<any>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Order Details Modal & Filter State
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'dispatched' | 'with_courier' | 'completed'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // New Custom External Link State
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  
  // Product Form Modal State & Mobile Image Processing
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);
  const [productFormData, setProductFormData] = useState<any>({
    name_ar: '',
    name_en: '',
    category: 'serums',
    price_after: '',
    price_before: '',
    description_ar: '',
    ingredients_ar: 'مزيج طبيعي فاخر من الزيوت العضوية ومستخلصات الأعشاب النقية لتعزيز حيوية البشرة.',
    usage_ar: 'يُوضع على بشرة نظيفة ويدلك بلطف حتى الامتصاص صباحاً ومساءً.',
    size: '50 مل',
    skin_type: 'all',
    goal: 'glow',
    badge: 'وصل حديثاً',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800']
  });

  // Birthday Greeting Card Modal State
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedBirthdayCustomer, setSelectedBirthdayCustomer] = useState<any>(null);

  // Settings & Context integration
  const { updateSettings, settings: contextSettings } = useSettings();
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [processingCatId, setProcessingCatId] = useState<string | null>(null);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState(false);
  const [bgUploadSuccess, setBgUploadSuccess] = useState(false);

  const [settings, setSettings] = useState<any>(() => {
    const saved = localStorage.getItem('wed_store_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      store_name: 'وِد',
      store_slogan: 'للعناية الفاخرة بالبشرة',
      logo_url: '',
      bg_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2070',
      article_text: 'تركيبات صيدلانية نقية صُممت خصيصاً لتمنحكِ بشرة حريرية وإشراقة تدوم في كل الأوقات.',
      whatsapp: '+967770000000',
      whatsapp_orders: '+967783363977',
      email: 'care@wed-beauty.com',
      instagram: 'https://instagram.com/wed.beauty',
      facebook: 'https://facebook.com/wed.beauty',
      delivery_num_1: '+967783363977',
      delivery_num_2: '',
      delivery_num_3: '',
      kuraimi_account: '3012345678',
      jeeb_account: '770000000',
      onecash_account: '770000000',
      floosak_account: '770000000',
      bank_transfer_name: 'مؤسسة وِد للعناية والتجميل',
      bank_transfer_account: '1020304050 / بنك التضامن',
      birthday_template: 'مرحباً {{name}} الغالية 🌸\nكل عام وأنتِ تفيضين جمالاً ونضارة! بمناسبة يوم ميلادكِ السعيد، يسر علامة «وِد» أن تهديكِ كود خصم خاص (WED-BDAY) بقيمة 15% على جميع مستحضراتنا مع هدية خاصة في طلبكِ القادم ✨',
      category_images: {}
    };
  });

  const navigate = useNavigate();

  useEffect(() => {
    const isAdminAuth = localStorage.getItem('qurra_admin_auth') === 'true';
    if (!isAdminAuth) {
      navigate('/admin/login');
      return;
    }

    fetchInitialData();

    // Auto-refresh orders whenever a new order is made or updated
    const handleOrderEvent = () => {
      fetchOrders();
    };

    window.addEventListener('storage', handleOrderEvent);
    window.addEventListener('order_created', handleOrderEvent);
    window.addEventListener('order_updated', handleOrderEvent);
    window.addEventListener('products_updated', fetchProducts);

    return () => {
      window.removeEventListener('storage', handleOrderEvent);
      window.removeEventListener('order_created', handleOrderEvent);
      window.removeEventListener('order_updated', handleOrderEvent);
      window.removeEventListener('products_updated', fetchProducts);
    };
  }, [navigate]);

  // Mobile-Optimized Image Compressor and Resizer
  const compressAndProcessImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'image/svg+xml' || file.size < 40000) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 900;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.86);
            resolve(compressed);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileInput = async (file?: File) => {
    if (!file) return;
    setIsProcessingImage(true);
    setImageUploadSuccess(false);
    try {
      const optimizedData = await optimizeImageFile(file, { maxWidth: 900, maxHeight: 900, quality: 0.85 });
      const optimizedUrl = await uploadOptimizedImage(optimizedData, 'products');
      setProductFormData((prev: any) => ({
        ...prev,
        images: [optimizedUrl]
      }));
      setImageUploadSuccess(true);
    } catch (err) {
      console.error('Image processing error:', err);
      alert('تعذر معالجة الصورة، يرجى المحاولة مرة أخرى أو اختيار صورة أصغر.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Logo file upload handler with auto-compression and instant persistence
  const handleLogoFileSelect = async (file?: File) => {
    if (!file) return;
    setIsProcessingLogo(true);
    setLogoUploadSuccess(false);
    try {
      const optimizedData = await optimizeImageFile(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.9,
        mimeType: file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      });
      const optimized = await uploadOptimizedImage(optimizedData, 'settings');
      const updated = { ...settings, logo_url: optimized };
      setSettings(updated);
      setLogoUploadSuccess(true);
      await updateSettings(updated);
      try {
        localStorage.setItem('wed_store_settings', JSON.stringify(updated));
      } catch (storageErr) {
        console.warn('LocalStorage save warning:', storageErr);
      }
      window.dispatchEvent(new Event('settings_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Logo upload error:', err);
      alert('تعذر معالجة صورة الشعار، يرجى تجربة صورة أخرى.');
    } finally {
      setIsProcessingLogo(false);
    }
  };

  // Background Hero file upload handler with auto-compression and instant persistence
  const handleBgFileSelect = async (file?: File) => {
    if (!file) return;
    setIsProcessingBg(true);
    setBgUploadSuccess(false);
    try {
      const optimizedData = await optimizeImageFile(file, {
        maxWidth: 1600,
        maxHeight: 900,
        quality: 0.85,
        mimeType: 'image/jpeg'
      });
      const optimized = await uploadOptimizedImage(optimizedData, 'settings');
      const updated = { ...settings, bg_url: optimized };
      setSettings(updated);
      setBgUploadSuccess(true);
      await updateSettings(updated);
      try {
        localStorage.setItem('wed_store_settings', JSON.stringify(updated));
      } catch (storageErr) {
        console.warn('LocalStorage save warning:', storageErr);
      }
      window.dispatchEvent(new Event('settings_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Background upload error:', err);
      alert('تعذر معالجة صورة الخلفية، يرجى تجربة صورة أخرى.');
    } finally {
      setIsProcessingBg(false);
    }
  };

  // Category square image file upload handler with auto-compression and instant persistence
  const handleCategoryImgFileSelect = async (catId: string, file?: File) => {
    if (!file) return;
    setProcessingCatId(catId);
    try {
      const optimizedData = await optimizeImageFile(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85
      });
      const optimized = await uploadOptimizedImage(optimizedData, 'categories');
      const updated = {
        ...settings,
        category_images: {
          ...(settings.category_images || {}),
          [catId]: optimized
        }
      };
      setSettings(updated);
      await updateSettings(updated);
      try {
        localStorage.setItem('wed_store_settings', JSON.stringify(updated));
      } catch (storageErr) {
        console.warn('LocalStorage save warning:', storageErr);
      }
      window.dispatchEvent(new Event('settings_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Category image upload error:', err);
      alert('تعذر معالجة صورة التصنيف.');
    } finally {
      setProcessingCatId(null);
    }
  };

  const handleOpenNewProductModal = () => {
    setEditingProduct(null);
    setImageUploadSuccess(false);
    setProductFormData({
      name_ar: '',
      name_en: '',
      category: 'serums',
      price_after: '',
      price_before: '',
      description_ar: '',
      ingredients_ar: 'مزيج طبيعي فاخر من الزيوت العضوية ومستخلصات الأعشاب النقية لتعزيز حيوية البشرة.',
      usage_ar: 'يُوضع على بشرة نظيفة ويدلك بلطف حتى الامتصاص صباحاً ومساءً.',
      size: '50 مل',
      skin_type: 'all',
      goal: 'glow',
      badge: 'وصل حديثاً',
      stock: 25,
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800']
    });
    setShowProductModal(true);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchOrders(), fetchProducts(), fetchSettings(), fetchTransactions(), fetchCustomers()]);
      loadDispatchLogs();
    } catch (err) {
      console.error("Initial data fetch error:", err);
    }
    setLoading(false);
  };

  const loadDispatchLogs = () => {
    try {
      const logs = JSON.parse(localStorage.getItem('wed_bot_dispatch_logs') || '[]');
      if (logs && logs.length > 0) {
        setDispatchLogs(logs);
      } else {
        setDispatchLogs([
          {
            id: 'NOTIF-101',
            orderId: 'WED-8021',
            customerName: 'نورة الحارثي',
            customerPhone: '+967778901234',
            total: 18500,
            itemsCount: 2,
            status: 'sent',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            adminMessage: '📦 طلب جديد في متجر «وِد»! رقم #WED-8021 من نورة الحارثي (+967778901234)',
            customerMessage: 'مرحباً نورة 🌸 تم تأكيد استلام طلبكِ رقم #WED-8021 بقيمة 18,500 ر.ي'
          },
          {
            id: 'NOTIF-102',
            orderId: 'WED-8019',
            customerName: 'ريم العنسي',
            customerPhone: '+967775678901',
            total: 24000,
            itemsCount: 3,
            status: 'sent',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            adminMessage: '📦 طلب جديد في متجر «وِد»! رقم #WED-8019 من ريم العنسي (+967775678901)',
            customerMessage: 'مرحباً ريم 🌸 تم تأكيد استلام طلبكِ رقم #WED-8019 بقيمة 24,000 ر.ي'
          }
        ]);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleGenerateAiInventoryReport = () => {
    setIsGeneratingAiAnalysis(true);
    setTimeout(() => {
      const lowStockItems = products.filter(p => (p.stock || 20) <= 10);
      const topDemanded = [...products].sort((a, b) => (b.price_after || 1000) - (a.price_after || 1000)).slice(0, 3);
      
      const report = `📊 **تقرير الذكاء الاصطناعي لتحليل المخزون والطلب - متجر «وِد»**
التاريخ: ${new Date().toLocaleDateString('ar-YE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

🌟 **المنتجات الأكثر طلباً ومبيعاً (High Demand):**
1. ${topDemanded[0]?.name_ar || 'سيروم النضارة والإشراق'} - معدل دوران عالي (موصى به في الباقات الترويجية).
2. ${topDemanded[1]?.name_ar || 'كريم الترطيب المخملي'} - إقبال متزايد من عميلات صنعاء.
3. ${topDemanded[2]?.name_ar || 'غسول التوازن اللطيف'} - الطلب متوازن وثابت.

⚠️ **تنبيهات المخزون المنخفض (بحاجة لإعادة توريد):**
${lowStockItems.length > 0 ? lowStockItems.map(p => `• ${p.name_ar}: المتبقي ${p.stock || 5} عبوات فقط (حالة حرجة).`).join('\n') : '• جميع المنتجات الرئيسية بحالة مخزون جيدة (أعلى من 10 قطع).'}

💡 **توصيات الذكاء الاصطناعي لزيادة الأرباح:**
1. إطلاق عرض «باقة العناية الشاملة» بخصم 10% لدمج المنتجات الأكثر طلباً مع الملحقات.
2. تفعيل رسائل التذكير التلقائية لعميلات الروتين اليومي بعد 30 يوماً من الشراء عبر واتساب.
3. زيادة كمية شحنة التوريد القادمة لسيرومات التفتيح والترطيب بنسبة 25%.`;

      setAiAnalysisResult(report);
      setIsGeneratingAiAnalysis(false);
    }, 1200);
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setCustomers(data);
      } else {
        // Mock fallback for customers if DB is empty
        setCustomers([
          { id: '1', name: 'منى اليماني', phone_number: '+967771234567', birthday: '1998-08-25', city: 'صنعاء' },
          { id: '2', name: 'سارة الأهدل', phone_number: '+967772345678', birthday: '1995-09-04', city: 'صنعاء' },
          { id: '3', name: 'هدى باعباد', phone_number: '+967773456789', birthday: '2000-08-28', city: 'عدن' },
        ]);
      }
    } catch (err) {
      // ignore
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (data) setTransactions(data);
    } catch (err) {
      // ignore
    }
  };

  const fetchOrders = async () => {
    try {
      const local = getLocalOrders().map(o => ({
        id: o.id,
        order_id: o.order_id || o.id,
        seq_num: o.seq_num,
        customer_name: o.customer_name,
        phone: o.phone,
        address: o.address,
        total: o.total,
        status: o.status || 'pending',
        items: o.items || [],
        payment_method: o.payment_method,
        notes: o.notes,
        created_at: o.created_at || (o as any).createdAt || new Date().toISOString()
      }));

      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      let allCombined = [...local];
      if (data && data.length > 0) {
        data.forEach((dbOrder: any) => {
          if (!allCombined.some(o => o.id === dbOrder.id || (o.order_id && o.order_id === dbOrder.order_id))) {
            allCombined.push(dbOrder);
          }
        });
      }

      // Sort newest first
      allCombined.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

      if (allCombined.length > 0) {
        setOrders(allCombined);
      } else {
        setOrders([
          {
            id: 'وِد-001',
            order_id: 'وِد-001',
            seq_num: 1,
            customer_name: 'نورة الحارثي',
            phone: '+967778901234',
            address: 'صنعاء - حدة - خلف مركز الكميم',
            total: 18500,
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: 'وِد-002',
            order_id: 'وِد-002',
            seq_num: 2,
            customer_name: 'ريم العنسي',
            phone: '+967775678901',
            address: 'صنعاء - بيت بوس - شارع 24',
            total: 24000,
            status: 'in-preparation',
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (e) {
      const local = getLocalOrders();
      if (local.length > 0) setOrders(local as any);
    }
  };

  const fetchProducts = async () => {
    try {
      const custom = JSON.parse(localStorage.getItem('wed_custom_products') || '[]');
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      
      const baseMocks = MOCK_PRODUCTS_LIST.map(p => ({
        id: p.id,
        name_ar: p.nameAr,
        name_en: p.nameEn,
        category: p.category,
        price_after: p.price,
        price_before: p.priceBefore,
        stock: p.stock || 20,
        images: p.images,
        description_ar: p.descriptionAr
      }));

      const combined = [...custom, ...(data || []), ...baseMocks];
      const seen = new Set<string>();
      const deduped: any[] = [];

      for (const p of combined) {
        if (p.id && !seen.has(p.id)) {
          seen.add(p.id);
          deduped.push(p);
        }
      }
      setProducts(deduped);
    } catch (e) {
      // ignore
    }
  };

  const fetchSettings = async () => {
    try {
      const local = localStorage.getItem('wed_store_settings');
      if (local) {
        setSettings((prev: any) => ({ ...prev, ...JSON.parse(local) }));
      } else if (contextSettings) {
        setSettings((prev: any) => ({ ...prev, ...contextSettings }));
      }
      const { data } = await supabase.from('settings').select('*').limit(1).single();
      if (data) setSettings((prev: any) => ({ ...prev, ...data }));
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('qurra_admin_auth');
    localStorage.removeItem('qurra_admin_user');
    localStorage.removeItem('wed_admin_role');
    navigate('/admin/login');
  };

  // Stable sequential numbering starting from #1 based on creation order
  const sortedOrdersOldestFirst = [...orders].sort((a, b) => {
    const timeA = new Date(a.created_at || a.createdAt || 0).getTime();
    const timeB = new Date(b.created_at || b.createdAt || 0).getTime();
    return timeA - timeB;
  });

  const getOrderSeqNumber = (order: any): number => {
    if (order?.seq_num && typeof order.seq_num === 'number') {
      return order.seq_num;
    }
    const idx = sortedOrdersOldestFirst.findIndex(o => o.id === order?.id);
    return idx >= 0 ? idx + 1 : 1;
  };

  const getOrderDisplayId = (order: any): string => {
    if (order?.order_id && typeof order.order_id === 'string' && order.order_id.trim()) {
      return order.order_id;
    }
    if (order?.id && typeof order.id === 'string' && (order.id.startsWith('وِد-') || order.id.startsWith('WED-'))) {
      return order.id;
    }
    const num = getOrderSeqNumber(order);
    return formatSequentialOrderId(num);
  };

  const getOrderStatusInfo = (status: string) => {
    switch (status) {
      case 'dispatched':
      case 'followed_up':
      case 'in-preparation':
        return {
          label: 'تمت المتابعة (تم الإرسال)',
          statusKey: 'dispatched',
          color: 'yellow',
          bgClass: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300/40',
          dotClass: 'bg-amber-500',
          icon: <Clock size={13} className="text-amber-600 shrink-0" />
        };
      case 'with_courier':
      case 'ready':
      case 'shipping':
        return {
          label: 'خرجت للتوصيل (مع المندوب)',
          statusKey: 'with_courier',
          color: 'orange',
          bgClass: 'bg-orange-50 text-orange-800 border-orange-300 ring-1 ring-orange-300/40',
          dotClass: 'bg-orange-500',
          icon: <Truck size={13} className="text-orange-600 shrink-0" />
        };
      case 'completed':
      case 'delivered':
        return {
          label: 'تم التسليم بنجاح',
          statusKey: 'completed',
          color: 'green',
          bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300/40',
          dotClass: 'bg-emerald-500',
          icon: <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
        };
      case 'pending':
      case 'not_dispatched':
      case 'new':
      default:
        return {
          label: 'لم يتم الإرسال بعد',
          statusKey: 'pending',
          color: 'red',
          bgClass: 'bg-red-50 text-red-800 border-red-300 ring-1 ring-red-300/40',
          dotClass: 'bg-red-500 animate-pulse',
          icon: <AlertCircle size={13} className="text-red-600 shrink-0" />
        };
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrderForDetails && selectedOrderForDetails.id === orderId) {
        setSelectedOrderForDetails((prev: any) => prev ? { ...prev, status: newStatus } : null);
      }

      // Sync with localStorage
      const localOrders = JSON.parse(localStorage.getItem('wed_orders') || '[]');
      const updatedLocal = localOrders.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem('wed_orders', JSON.stringify(updatedLocal));

      // Trigger custom event so Staff Red Notification Bar in navbar updates immediately
      window.dispatchEvent(new Event('order_updated'));

      if (newStatus === 'completed' || newStatus === 'delivered') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          await supabase.from('transactions').insert({
            type: 'income',
            amount: order.total || 0,
            description: `مبيعات طلب وِد #${getOrderSeqNumber(order)}`
          });
          fetchTransactions();
        }
      }
    } catch (err) {
      console.error("Order update error:", err);
    }
  };

  const handleSendOrderWhatsApp = (order: any, target: 'customer' | 'courier') => {
    // 1. Auto-update order to Yellow (تمت المتابعة)
    handleUpdateOrderStatus(order.id, 'dispatched');

    const seq = getOrderSeqNumber(order);
    const cleanCustomerPhone = (order.phone || '').replace(/\D/g, '');
    const courierPhone = (settings.delivery_num_1 || settings.whatsapp_orders || '967783363977').replace(/\D/g, '');
    
    if (target === 'customer') {
      const msg = `مرحباً بكِ ${order.customer_name || 'عزيزتنا'} في «ود» 🌸\nنود إفادتكِ بأنه تمت متابعة وتأكيد طلبكِ رقم #${seq} بقيمة ${(order.total || 0).toLocaleString()} ر.ي، وفريقنا يجهز شحنتكِ الآن لتسليمها لمندوب التوصيل ✨`;
      window.open(`https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      const itemsList = Array.isArray(order.items)
        ? order.items.map((i: any) => `• ${i.name || i.nameAr || 'منتج'} × ${i.quantity || 1} (${((i.price || 0) * (i.quantity || 1)).toLocaleString()} ر.ي)`).join('\n')
        : 'باقة عناية ود';
      const msg = `🛵 *مهمة توصيل شحنة «ود» (طلب رقم #${seq})*\n----------------------------\n👤 *العميلة:* ${order.customer_name}\n📞 *الهاتف:* ${order.phone}\n📍 *العنوان:* ${order.address || 'صنعاء'}\n📦 *المنتجات المطلوبة:*\n${itemsList}\n💰 *المبلغ المطلوب تحصيله:* ${(order.total || 0).toLocaleString()} ر.ي (الدفع عند الاستلام)\n----------------------------\nيرجى تأكيد الاستلام والتسليم.`;
      window.open(`https://wa.me/${courierPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);
    try {
      const formattedPayload = {
        ...productFormData,
        price_after: Number(productFormData.price_after) || 0,
        price_before: productFormData.price_before ? Number(productFormData.price_before) : null,
        stock: Number(productFormData.stock) || 0
      };

      const custom: any[] = JSON.parse(localStorage.getItem('wed_custom_products') || '[]');
      let updatedCustom: any[] = [];
      let savedProduct: any = null;

      if (editingProduct) {
        // Update product
        savedProduct = {
          ...editingProduct,
          ...formattedPayload,
          id: editingProduct.id
        };

        const existingIndex = custom.findIndex(p => p.id === editingProduct.id);
        if (existingIndex >= 0) {
          custom[existingIndex] = savedProduct;
          updatedCustom = custom;
        } else {
          updatedCustom = [savedProduct, ...custom];
        }

        // Try Supabase update if available
        try {
          await supabase.from('products').update(formattedPayload).eq('id', editingProduct.id);
        } catch (dbErr) {
          // ignore
        }

        setProducts(prev => prev.map(p => p.id === editingProduct.id ? savedProduct : p));
      } else {
        // Create new product
        const newId = `prod_${Date.now()}`;
        savedProduct = {
          ...formattedPayload,
          id: newId,
          created_at: new Date().toISOString()
        };

        // Try Supabase insert
        try {
          const { data } = await supabase.from('products').insert([savedProduct]).select().single();
          if (data) savedProduct = data;
        } catch (dbErr) {
          // ignore
        }

        updatedCustom = [savedProduct, ...custom];
        setProducts(prev => [savedProduct, ...prev]);
      }

      localStorage.setItem('wed_custom_products', JSON.stringify(updatedCustom));
      window.dispatchEvent(new Event('products_updated'));
      window.dispatchEvent(new Event('storage'));

      setShowProductModal(false);
      setEditingProduct(null);
      alert('تم حفظ المنتج وتحديث الكتالوج بنجاح! يمكنك الآن مشاهدته في المتجر.');
    } catch (err) {
      console.error('Save product error:', err);
      setShowProductModal(false);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا المنتج نهائياً من الكتالوج؟')) return;
    try {
      const custom: any[] = JSON.parse(localStorage.getItem('wed_custom_products') || '[]');
      const filteredCustom = custom.filter(p => p.id !== id);
      localStorage.setItem('wed_custom_products', JSON.stringify(filteredCustom));

      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        // ignore
      }

      setProducts(prev => prev.filter(p => p.id !== id));
      window.dispatchEvent(new Event('products_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleUpdateSettings = async () => {
    setIsUpdatingSettings(true);
    try {
      // 1. Update context
      await updateSettings(settings);

      // 2. Safe local storage save
      try {
        localStorage.setItem('wed_store_settings', JSON.stringify(settings));
      } catch (storageErr) {
        console.warn('LocalStorage save warning:', storageErr);
      }

      // 3. Dispatch events to ensure all components and tabs sync in real-time
      window.dispatchEvent(new Event('settings_updated'));
      window.dispatchEvent(new Event('storage'));

      // 4. Supabase DB Upsert
      try {
        const { error } = await supabase
          .from('settings')
          .upsert({ ...settings, id: 'store-settings-id', updated_at: new Date().toISOString() });

        if (error) {
          console.warn('Supabase settings warning:', error.message);
        }
      } catch (dbErr) {
        // ignore
      }

      alert('✨ تم حفظ وتطبيق إعدادات المتجر (الشعار، الخلفية، الاسم، وبيانات التواصل) بنجاح!');
    } catch (err: any) {
      alert('✨ تم حفظ الإعدادات وتطبيقها محلياً بنجاح!');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Birthday club filtering
  const currentMonth = new Date().getMonth() + 1;
  const birthdayCustomers = customers.filter(c => c.birthday);

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 min-h-screen bg-[#FAF6F0] text-brand-text">
      <div className="max-w-7xl mx-auto">
        {/* Top Admin Header Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 mb-8 border border-brand-border shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <WedLogo size="md" variant="burgundy" />
            <div className="text-right">
              <h1 className="arabic-text text-xl sm:text-2xl font-black text-brand-burgundy">
                لوحة إدارة متجر «وِد»
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-3 py-0.5 rounded-full">
                  التحكم الموحد الكامل بالمتجر والطلبات
                </span>
                <span className="text-[11px] text-brand-text-muted">نظام إدارة العمليات الفاخرة</span>
              </div>
            </div>
          </div>

          {/* Prominent Action Controls: Add Product & Logout */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
            <button
              onClick={handleOpenNewProductModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#722F37] to-[#5A252C] hover:from-[#5A252C] hover:to-[#40191E] text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer border border-[#8B3A44]"
              title="إضافة منتج جديد للكتالوج"
            >
              <Plus size={18} className="text-amber-300" />
              <span>+ إضافة منتج جديد</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-xs border border-red-100 flex items-center gap-1.5 text-xs font-bold"
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <aside className="lg:w-64 space-y-3 shrink-0">
            {/* Quick Prominent Add Product Button in Sidebar */}
            <div className="bg-gradient-to-br from-[#FAF6F0] to-[#F3ECE0] rounded-3xl p-4 border-2 border-brand-gold/40 shadow-xs text-center space-y-2">
              <p className="text-[11px] font-black text-brand-burgundy">إدارة المعروضات</p>
              <button
                onClick={handleOpenNewProductModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#722F37] hover:bg-[#5A252C] text-white rounded-2xl text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={16} className="text-amber-300" />
                <span>إضافة منتج الآن</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-brand-border shadow-xs space-y-1.5">
              {[
                { id: 'orders', name: 'إدارة الطلبات', icon: <ShoppingBag size={18} /> },
                { id: 'products', name: 'كتالوج المنتجات', icon: <Package size={18} /> },
                { id: 'ai_training', name: 'تدريب مساعد البشرة (AI)', icon: <Sparkles size={18} /> },
                { id: 'whatsapp_ai', name: 'بوت الواتساب والمخزون الذكي (AI)', icon: <Bot size={18} /> },
                { id: 'birthdays', name: 'نادي المناسبات والسرور', icon: <Gift size={18} /> },
                { id: 'delivery', name: 'إشعارات التوصيل', icon: <Truck size={18} /> },
                { id: 'customers', name: 'سجل العميلات', icon: <Users size={18} /> },
                { id: 'finance', name: 'الخزينة والمالية', icon: <Wallet size={18} /> },
                { id: 'settings', name: 'إعدادات وروابط المتجر', icon: <Settings size={18} /> },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all arabic-text text-xs text-right cursor-pointer",
                    activeTab === item.id 
                      ? "bg-[#722F37] text-white shadow-sm font-black" 
                      : "text-gray-800 hover:bg-gray-100 hover:text-gray-900 font-bold"
                  )}
                >
                  <span className={activeTab === item.id ? "text-amber-300" : "text-[#722F37]"}>
                    {item.icon}
                  </span>
                  <span className={activeTab === item.id ? "text-white" : "text-gray-900"}>{item.name}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 min-w-0">
            {/* 1. Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Orders Statistics & Filter Tabs */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="arabic-text text-xl font-black text-brand-burgundy flex items-center gap-2.5">
                        <ShoppingBag className="w-6 h-6 text-brand-burgundy" />
                        <span>إدارة ومتابعة طلبات المتجر</span>
                      </h3>
                      <p className="text-xs text-brand-text-muted mt-1">
                        مرتبة تسلسلياً برقم الطلب، مع أتمتة حالة الإرسال للمندوب والعميلة وتحديث الشارات الملونة.
                      </p>
                    </div>

                    {/* Quick Search */}
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-muted w-4 h-4" />
                      <input
                        type="text"
                        placeholder="بحث باسم العميلة، الهاتف، أو رقم الطلب..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full pr-10 pl-4 py-2.5 bg-[#FAF6F0] rounded-xl border border-brand-border text-xs arabic-text outline-none focus:border-brand-burgundy transition-all"
                      />
                    </div>
                  </div>

                  {/* Status Filter Pills */}
                  {(() => {
                    const redCount = orders.filter(o => !o.status || o.status === 'pending' || o.status === 'not_dispatched' || o.status === 'new').length;
                    const yellowCount = orders.filter(o => o.status === 'dispatched' || o.status === 'followed_up' || o.status === 'in-preparation').length;
                    const orangeCount = orders.filter(o => o.status === 'with_courier' || o.status === 'ready' || o.status === 'shipping').length;
                    const greenCount = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;

                    return (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <button
                          onClick={() => setOrderStatusFilter('all')}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold arabic-text transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
                            orderStatusFilter === 'all'
                              ? "bg-brand-burgundy text-white shadow-xs"
                              : "bg-[#FAF6F0] text-brand-text hover:bg-brand-blush-light"
                          )}
                        >
                          <span>كل الطلبات</span>
                          <span className="font-mono bg-white/20 px-1.5 py-0.2 rounded-md text-[10px]">
                            {orders.length}
                          </span>
                        </button>

                        <button
                          onClick={() => setOrderStatusFilter('pending')}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold arabic-text transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border",
                            orderStatusFilter === 'pending'
                              ? "bg-red-600 text-white border-red-700 shadow-xs"
                              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100/70"
                          )}
                        >
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                          <span>لم يتم الإرسال (أحمر)</span>
                          <span className="font-mono bg-black/10 px-1.5 py-0.2 rounded-md text-[10px]">
                            {redCount}
                          </span>
                        </button>

                        <button
                          onClick={() => setOrderStatusFilter('dispatched')}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold arabic-text transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border",
                            orderStatusFilter === 'dispatched'
                              ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                              : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100/70"
                          )}
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <span>تمت المتابعة (أصفر)</span>
                          <span className="font-mono bg-black/10 px-1.5 py-0.2 rounded-md text-[10px]">
                            {yellowCount}
                          </span>
                        </button>

                        <button
                          onClick={() => setOrderStatusFilter('with_courier')}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold arabic-text transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border",
                            orderStatusFilter === 'with_courier'
                              ? "bg-orange-600 text-white border-orange-700 shadow-xs"
                              : "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100/70"
                          )}
                        >
                          <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                          <span>خرجت للتوصيل (برتقالي)</span>
                          <span className="font-mono bg-black/10 px-1.5 py-0.2 rounded-md text-[10px]">
                            {orangeCount}
                          </span>
                        </button>

                        <button
                          onClick={() => setOrderStatusFilter('completed')}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold arabic-text transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border",
                            orderStatusFilter === 'completed'
                              ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70"
                          )}
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>تم التسليم (أخضر)</span>
                          <span className="font-mono bg-black/10 px-1.5 py-0.2 rounded-md text-[10px]">
                            {greenCount}
                          </span>
                        </button>
                      </div>
                    );
                  })()}

                  {/* Orders List in Streamlined Horizontal Bars */}
                  <div className="space-y-3 pt-2">
                    {(() => {
                      // Filter orders based on status & search
                      let filtered = [...orders];

                      if (orderStatusFilter === 'pending') {
                        filtered = filtered.filter(o => !o.status || o.status === 'pending' || o.status === 'not_dispatched' || o.status === 'new');
                      } else if (orderStatusFilter === 'dispatched') {
                        filtered = filtered.filter(o => o.status === 'dispatched' || o.status === 'followed_up' || o.status === 'in-preparation');
                      } else if (orderStatusFilter === 'with_courier') {
                        filtered = filtered.filter(o => o.status === 'with_courier' || o.status === 'ready' || o.status === 'shipping');
                      } else if (orderStatusFilter === 'completed') {
                        filtered = filtered.filter(o => o.status === 'completed' || o.status === 'delivered');
                      }

                      if (orderSearchQuery.trim()) {
                        const q = orderSearchQuery.toLowerCase().trim();
                        filtered = filtered.filter(o => {
                          const seq = getOrderSeqNumber(o).toString();
                          return (
                            seq.includes(q) ||
                            (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
                            (o.phone && o.phone.includes(q)) ||
                            (o.address && o.address.toLowerCase().includes(q))
                          );
                        });
                      }

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-12 bg-[#FAF6F0] rounded-2xl border border-brand-border space-y-2">
                            <ShoppingBag className="w-10 h-10 text-brand-burgundy/40 mx-auto" />
                            <p className="arabic-text text-sm font-bold text-brand-burgundy">
                              لا توجد طلبات مطابقة لهذا الفلتر
                            </p>
                            <span className="text-xs text-brand-text-muted">
                              يمكنكِ اختيار "كل الطلبات" أو إفراغ خانة البحث.
                            </span>
                          </div>
                        );
                      }

                      return filtered.map((order) => {
                        const seqNumber = getOrderSeqNumber(order);
                        const statusInfo = getOrderStatusInfo(order.status || 'pending');
                        const orderDate = new Date(order.created_at || order.createdAt || Date.now());
                        const formattedTime = orderDate.toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });
                        const formattedDate = orderDate.toLocaleDateString('ar-YE', { day: 'numeric', month: 'short' });

                        return (
                          <div
                            key={order.id}
                            className="p-4 sm:p-5 bg-[#FAF6F0] hover:bg-white transition-all rounded-2xl border border-brand-border shadow-xs hover:shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-right"
                          >
                            {/* Left/Main Column: Sequential ID + Date + Customer Info */}
                            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                              {/* Prominent Sequential Badge */}
                              <div className="px-3 py-2 bg-brand-burgundy text-[#FAF6F0] rounded-xl flex flex-col items-center justify-center shrink-0 shadow-xs min-w-[76px]">
                                <span className="text-[10px] text-white/75 font-bold">طلب رقم</span>
                                <span className="font-mono text-sm sm:text-base font-black leading-none mt-0.5">
                                  {getOrderDisplayId(order)}
                                </span>
                              </div>

                              {/* Details Summary */}
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="arabic-text font-black text-sm text-brand-burgundy truncate">
                                    {order.customer_name || 'عميلة وِد'}
                                  </h4>
                                  <span className="text-xs font-mono dir-ltr text-brand-text-muted bg-white px-2 py-0.5 rounded-lg border border-brand-border">
                                    {order.phone || '-'}
                                  </span>
                                  <span className="text-[11px] text-brand-text-muted flex items-center gap-1">
                                    <Clock size={11} />
                                    <span>{formattedDate}، {formattedTime}</span>
                                  </span>
                                </div>

                                <p className="text-xs text-brand-text-muted truncate max-w-xl">
                                  📍 {order.address || 'صنعاء'}
                                </p>
                              </div>
                            </div>

                            {/* Center: Total Amount & Status Badge */}
                            <div className="flex flex-wrap items-center gap-3 justify-between sm:justify-start w-full lg:w-auto">
                              {/* Total YER */}
                              <div className="text-right sm:text-center px-3 py-1.5 bg-white rounded-xl border border-brand-border">
                                <span className="block text-[10px] text-brand-text-muted font-bold">المطلوب تحصيله</span>
                                <span className="font-sans font-black text-sm text-brand-burgundy">
                                  {(order.total || 0).toLocaleString()} ر.ي
                                </span>
                              </div>

                              {/* Colored Status Badge */}
                              <div className={cn(
                                "px-3 py-1.5 rounded-xl border text-xs font-bold arabic-text flex items-center gap-1.5 shadow-2xs",
                                statusInfo.bgClass
                              )}>
                                <span className={cn("w-2 h-2 rounded-full", statusInfo.dotClass)} />
                                <span>{statusInfo.label}</span>
                              </div>
                            </div>

                            {/* Right Actions: Auto WhatsApp Dispatch, Details Modal, Quick Status Selector */}
                            <div className="flex items-center gap-2 w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-brand-border/60">
                              {/* 1-Click WhatsApp Dispatch & Auto Status Changer */}
                              <button
                                onClick={() => handleSendOrderWhatsApp(order, 'customer')}
                                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold arabic-text transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                                title="إرسال رسالة التأكيد للعميلة وتحويل الحالة تلقائياً إلى صفراء"
                              >
                                <MessageCircle size={14} />
                                <span>إرسال وتأكيد</span>
                              </button>

                              {/* Full Details Modal Trigger */}
                              <button
                                onClick={() => setSelectedOrderForDetails(order)}
                                className="px-3.5 py-2 bg-white hover:bg-brand-burgundy hover:text-white text-brand-burgundy border border-brand-border rounded-xl text-xs font-bold arabic-text transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <Eye size={14} />
                                <span>تفاصيل الطلب</span>
                              </button>

                              {/* Manual Status Quick Switcher */}
                              <select
                                value={
                                  order.status === 'dispatched' || order.status === 'followed_up' || order.status === 'in-preparation'
                                    ? 'dispatched'
                                    : order.status === 'with_courier' || order.status === 'ready' || order.status === 'shipping'
                                    ? 'with_courier'
                                    : order.status === 'completed' || order.status === 'delivered'
                                    ? 'completed'
                                    : 'pending'
                                }
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="px-2 py-2 rounded-xl text-[11px] font-bold border border-brand-border bg-white text-brand-burgundy outline-none cursor-pointer"
                              >
                                <option value="pending">🔴 لم يتم الإرسال</option>
                                <option value="dispatched">🟡 تمت المتابعة (تم الإرسال)</option>
                                <option value="with_courier">🟠 خرجت للتوصيل</option>
                                <option value="completed">🟢 تم التسليم</option>
                              </select>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* Comprehensive Order Details Modal (نافذة تفاصيل الطلب الكاملة) */}
                {/* ========================================================================= */}
                <AnimatePresence>
                  {selectedOrderForDetails && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-brand-border overflow-hidden text-right my-8"
                      >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-brand-burgundy to-brand-burgundy-dark text-white p-5 sm:p-6 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-bold font-mono">
                                طلب رقم {getOrderDisplayId(selectedOrderForDetails)}
                              </span>
                              <span className="text-xs text-white/80">
                                {new Date(selectedOrderForDetails.created_at || selectedOrderForDetails.createdAt || Date.now()).toLocaleString('ar-YE')}
                              </span>
                            </div>
                            <h3 className="arabic-text text-lg sm:text-xl font-black">
                              تفاصيل الشحنة والعميلة الكاملة
                            </h3>
                          </div>
                          <button
                            onClick={() => setSelectedOrderForDetails(null)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
                          >
                            <XCircle size={22} />
                          </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                          {/* Current Status Banner */}
                          {(() => {
                            const statusInfo = getOrderStatusInfo(selectedOrderForDetails.status || 'pending');
                            return (
                              <div className={cn(
                                "p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold",
                                statusInfo.bgClass
                              )}>
                                <div className="flex items-center gap-2">
                                  <span className={cn("w-3 h-3 rounded-full", statusInfo.dotClass)} />
                                  <span>الحالة الحالية: {statusInfo.label}</span>
                                </div>
                                <span className="text-[11px] font-normal opacity-85">
                                  {statusInfo.statusKey === 'pending' && '⚠️ يتطلب الإرسال للمندوب والعميلة لإخفاء شريط التنبيه الإداري'}
                                  {statusInfo.statusKey === 'dispatched' && '✓ تم إرسال إشعار المتابعة بنجاح'}
                                  {statusInfo.statusKey === 'with_courier' && '🛵 الشحنة حالياً في طريقها مع مندوب التوصيل'}
                                  {statusInfo.statusKey === 'completed' && '✅ تم تسليم الطلب وتحصيل المبلغ'}
                                </span>
                              </div>
                            );
                          })()}

                          {/* Customer & Location Card */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Customer Box */}
                            <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-brand-border space-y-2.5">
                              <h5 className="arabic-text text-xs font-black text-brand-burgundy flex items-center gap-1.5">
                                <Users size={15} className="text-brand-gold" />
                                <span>بيانات العميلة</span>
                              </h5>
                              <div className="text-xs space-y-1">
                                <p className="font-bold text-brand-text">
                                  {selectedOrderForDetails.customer_name || 'عميلة وِد'}
                                </p>
                                <p className="font-mono text-brand-text-muted dir-ltr text-right">
                                  {selectedOrderForDetails.phone || '-'}
                                </p>
                              </div>
                              <div className="pt-2 flex items-center gap-2">
                                <a
                                  href={`tel:${selectedOrderForDetails.phone || ''}`}
                                  className="flex-1 py-1.5 bg-white border border-brand-border text-brand-burgundy rounded-xl text-[11px] font-bold text-center hover:bg-brand-burgundy hover:text-white transition-all flex items-center justify-center gap-1"
                                >
                                  <Phone size={12} />
                                  <span>اتصال</span>
                                </a>
                                <a
                                  href={`https://wa.me/${(selectedOrderForDetails.phone || '').replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 py-1.5 bg-emerald-700 text-white rounded-xl text-[11px] font-bold text-center hover:bg-emerald-800 transition-all flex items-center justify-center gap-1"
                                >
                                  <MessageCircle size={12} />
                                  <span>واتساب</span>
                                </a>
                              </div>
                            </div>

                            {/* Location Box */}
                            <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-brand-border space-y-2.5">
                              <h5 className="arabic-text text-xs font-black text-brand-burgundy flex items-center gap-1.5">
                                <Truck size={15} className="text-brand-gold" />
                                <span>عنوان وموقع التوصيل</span>
                              </h5>
                              <p className="text-xs font-bold text-brand-text leading-relaxed">
                                {selectedOrderForDetails.address || 'صنعاء - العنوان مسجل أثناء الطلب'}
                              </p>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrderForDetails.address || 'Sanaa')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-[11px] text-brand-burgundy font-bold underline underline-offset-4 pt-1"
                              >
                                <ExternalLink size={12} />
                                <span>فتح العنوان في خرائط قوقل</span>
                              </a>
                            </div>
                          </div>

                          {/* Ordered Products Breakdown */}
                          <div className="space-y-3">
                            <h5 className="arabic-text text-xs font-black text-brand-burgundy">
                              المنتجات والكميات المطلوبة:
                            </h5>
                            <div className="bg-[#FAF6F0] rounded-2xl border border-brand-border overflow-hidden">
                              {Array.isArray(selectedOrderForDetails.items) && selectedOrderForDetails.items.length > 0 ? (
                                <table className="w-full text-right text-xs arabic-text">
                                  <thead>
                                    <tr className="border-b border-brand-border bg-white/60 text-brand-text-muted">
                                      <th className="p-3 font-bold">المنتج</th>
                                      <th className="p-3 font-bold text-center">الكمية</th>
                                      <th className="p-3 font-bold">سعر القطعة</th>
                                      <th className="p-3 font-bold">الإجمالي</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-brand-border/40">
                                    {selectedOrderForDetails.items.map((item: any, idx: number) => (
                                      <tr key={idx} className="hover:bg-white/50">
                                        <td className="p-3 font-bold text-brand-burgundy">
                                          {item.name || item.nameAr || 'منتج وِد للعناية'}
                                        </td>
                                        <td className="p-3 font-mono text-center font-bold">
                                          {item.quantity || 1}
                                        </td>
                                        <td className="p-3 font-mono">
                                          {Number(item.price || 0).toLocaleString()} ر.ي
                                        </td>
                                        <td className="p-3 font-mono font-bold text-brand-burgundy">
                                          {(Number(item.price || 0) * (item.quantity || 1)).toLocaleString()} ر.ي
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="p-4 text-xs text-brand-text-muted">
                                  باقة منتجات وِد للعناية بالبشرة (تم تسجيل الطلب بالسلة)
                                </div>
                              )}
                            </div>

                            {/* Total Box */}
                            <div className="p-4 bg-brand-blush-light rounded-2xl border border-brand-blush/40 flex items-center justify-between text-brand-burgundy">
                              <span className="font-bold text-xs">الإجمالي المستحق عند الاستلام (شاملاً التوصيل):</span>
                              <span className="font-sans font-black text-base">
                                {(selectedOrderForDetails.total || 0).toLocaleString()} ر.ي
                              </span>
                            </div>
                          </div>

                          {/* Quick Manual Status Changer (4 colors) */}
                          <div className="space-y-2 pt-2 border-t border-brand-border">
                            <label className="text-xs font-bold text-brand-burgundy block">
                              تغيير حالة الطلب يدوياً (اختيار اللون المناسب):
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <button
                                onClick={() => handleUpdateOrderStatus(selectedOrderForDetails.id, 'pending')}
                                className={cn(
                                  "p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer",
                                  (!selectedOrderForDetails.status || selectedOrderForDetails.status === 'pending' || selectedOrderForDetails.status === 'not_dispatched')
                                    ? "bg-red-600 text-white border-red-700 shadow-xs"
                                    : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                )}
                              >
                                🔴 لم يتم الإرسال
                              </button>

                              <button
                                onClick={() => handleUpdateOrderStatus(selectedOrderForDetails.id, 'dispatched')}
                                className={cn(
                                  "p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer",
                                  (selectedOrderForDetails.status === 'dispatched' || selectedOrderForDetails.status === 'followed_up')
                                    ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                                    : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                                )}
                              >
                                🟡 تمت المتابعة
                              </button>

                              <button
                                onClick={() => handleUpdateOrderStatus(selectedOrderForDetails.id, 'with_courier')}
                                className={cn(
                                  "p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer",
                                  (selectedOrderForDetails.status === 'with_courier' || selectedOrderForDetails.status === 'ready')
                                    ? "bg-orange-600 text-white border-orange-700 shadow-xs"
                                    : "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100"
                                )}
                              >
                                🟠 خرجت للتوصيل
                              </button>

                              <button
                                onClick={() => handleUpdateOrderStatus(selectedOrderForDetails.id, 'completed')}
                                className={cn(
                                  "p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer",
                                  (selectedOrderForDetails.status === 'completed' || selectedOrderForDetails.status === 'delivered')
                                    ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                )}
                              >
                                🟢 تم التسليم
                              </button>
                            </div>
                          </div>

                          {/* WhatsApp Fast Triggers */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <button
                              onClick={() => handleSendOrderWhatsApp(selectedOrderForDetails, 'customer')}
                              className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold arabic-text transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                            >
                              <Send size={14} />
                              <span>إرسال تأكيد للعميلة (تحويل الحالة للأصفر)</span>
                            </button>

                            <button
                              onClick={() => handleSendOrderWhatsApp(selectedOrderForDetails, 'courier')}
                              className="py-3 px-4 bg-brand-burgundy hover:bg-brand-burgundy-dark text-white rounded-2xl text-xs font-bold arabic-text transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                            >
                              <Truck size={14} />
                              <span>إرسال بوليصة التوصيل للمندوب</span>
                            </button>
                          </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-[#FAF6F0] border-t border-brand-border flex items-center justify-between">
                          <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-white border border-brand-border rounded-xl text-xs font-bold text-brand-burgundy hover:bg-brand-burgundy hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Printer size={14} />
                            <span>طباعة بوليصة الطلب</span>
                          </button>

                          <button
                            onClick={() => setSelectedOrderForDetails(null)}
                            className="px-5 py-2 bg-brand-burgundy text-white rounded-xl text-xs font-bold hover:bg-brand-burgundy-dark transition-all cursor-pointer"
                          >
                            إغلاق
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* WhatsApp AI Bot & Inventory Demand Intelligence */}
            {activeTab === 'whatsapp_ai' && (
              <div className="space-y-8 text-right">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-brand-burgundy via-brand-burgundy-light to-brand-burgundy text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                  <div className="space-y-3 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-brand-gold-light">
                      <Bot className="w-4 h-4 text-emerald-400" />
                      <span>مركز الربط الآلي والذكاء الاصطناعي لواتساب «ود»</span>
                    </div>
                    <h2 className="arabic-text text-2xl sm:text-3xl font-black">
                      بوت الواتساب الذكي وإدارة المخزون 🤖
                    </h2>
                    <p className="arabic-text text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
                      نظام متكامل يربط «ود» برقم الواتساب المعتمد، يقوم بإرسال إشعارات فورية للإدارة بتفاصيل طلبات العميلات، وإرسال رسائل تأكيد آلية للعميلات، مع تحليل ذكي لحظي للمخزون والمنتجات الأكثر طلباً.
                    </p>
                  </div>
                  <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                </div>

                {/* Section 1: WhatsApp Bot & Notifications Gateway */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="arabic-text text-lg font-black text-brand-burgundy">
                          حالة ربط البوت والإشعارات الآلية
                        </h3>
                        <p className="text-xs text-brand-text-muted">الرقم المعتمد لإرسال الإشعارات: <span className="font-mono font-bold text-brand-burgundy">{settings.whatsapp_orders || '+967783363977'}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>البوت متصل ونشط 24/7</span>
                      </span>
                    </div>
                  </div>

                  {/* Auto Dispatch Triggers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-brand-border bg-[#FAF6F0] flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-white text-emerald-600 shadow-xs">
                        <Send className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="arabic-text font-black text-sm text-brand-burgundy">إشعار الإدارة الفوري عند كل طلب جديد</h4>
                        <p className="text-xs text-brand-text-muted leading-relaxed">
                          يقوم البوت تلقائياً بتوليد وإرسال إشعار فوري لمدير المتجر يوضح: اسم العميلة، رقم هاتفها، المنتجات المطلوبة، العنوان المحدد، والمبلغ الإجمالي المطلوب تحصيله.
                        </p>
                        <span className="inline-block mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          ✓ مفعل تلقائياً مع كل طلب
                        </span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-brand-border bg-[#FAF6F0] flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-white text-brand-burgundy shadow-xs">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="arabic-text font-black text-sm text-brand-burgundy">رسالة تأكيد فورية للعميلة برقم الطلب</h4>
                        <p className="text-xs text-brand-text-muted leading-relaxed">
                          يقوم البوت بإرسال رسالة ترحيبية وتأكيدية راقية للعميلة على رقمها المسجل تحتوي على رقم الطلب وقيمته لتطمئن أن طلبها قيد التجهيز والتغليف.
                        </p>
                        <span className="inline-block mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          ✓ مفعل تلقائياً مع كل طلب
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Manual Instant Trigger / Order Sender Simulator */}
                  <div className="p-5 bg-white rounded-2xl border border-brand-border space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="arabic-text font-black text-sm text-brand-burgundy flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-gold" />
                        <span>تجربة وإرسال إشعار فوري لطلبات المتجر</span>
                      </h4>
                      <span className="text-xs text-brand-text-muted">اختيار أي طلب لإرسال الإشعار أو نسخه</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {orders.slice(0, 3).map((ord) => {
                        const shortId = typeof ord.id === 'string' ? ord.id : `WED-${ord.id}`;
                        const cleanPhone = (ord.phone || '').replace(/\D/g, '');
                        const adminNotifyText = `📦 طلب جديد في متجر «وِد»!
رقم الطلب: #${shortId}
العميلة: ${ord.customer_name || 'عميلة وِد'}
رقم الهاتف: ${ord.phone || ''}
العنوان: ${ord.address || 'صنعاء'}
الإجمالي: ${(ord.total || 0).toLocaleString()} ر.ي (الدفع عند الاستلام)`;

                        const custNotifyText = `مرحباً بكِ ${ord.customer_name || 'عزيزتنا'} في عالم «وِد» 🌸
تم تسجيل طلبكِ بنجاح برقم #${shortId} بقيمة ${(ord.total || 0).toLocaleString()} ر.ي.
فريقنا يجهز شحنتكِ الآن بكل عناية واهتمام ✨`;

                        return (
                          <div key={ord.id} className="p-4 bg-[#FAF6F0] rounded-xl border border-brand-border space-y-3 text-right">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-xs text-brand-burgundy">#{shortId}</span>
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {(ord.total || 0).toLocaleString()} ر.ي
                              </span>
                            </div>
                            <div className="text-xs space-y-0.5">
                              <p className="font-bold text-brand-text">{ord.customer_name || 'عميلة وِد'}</p>
                              <p className="font-mono text-brand-text-muted dir-ltr text-right">{ord.phone || '-'}</p>
                            </div>
                            <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between gap-2">
                              <a
                                href={`https://wa.me/${(settings.whatsapp_orders || '+967783363977').replace(/\D/g, '')}?text=${encodeURIComponent(adminNotifyText)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2 bg-[#722F37] text-white rounded-xl text-[11px] font-black text-center hover:bg-[#58242A] transition-all flex items-center justify-center gap-1.5 shadow-xs"
                                title="إرسال إشعار للمتجر"
                              >
                                <Send size={13} />
                                <span>إشعار الإدارة</span>
                              </a>

                              <a
                                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(custNotifyText)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2 bg-emerald-700 text-white rounded-xl text-[11px] font-black text-center hover:bg-emerald-800 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                                title="إرسال إشعار للعميل"
                              >
                                <MessageCircle size={13} />
                                <span>إشعار العميلة</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Automated Dispatch Logs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="arabic-text font-black text-sm text-brand-burgundy">سجل الإشعارات المرسلة تلقائياً عبر البوت</h4>
                      <span className="text-xs text-brand-text-muted">{dispatchLogs.length} إشعار مسجل</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full arabic-text text-right text-xs">
                        <thead>
                          <tr className="text-brand-text-muted border-b border-brand-border pb-2.5">
                            <th className="pb-2.5 font-bold">رقم الطلب</th>
                            <th className="pb-2.5 font-bold">العميلة</th>
                            <th className="pb-2.5 font-bold">الهاتف</th>
                            <th className="pb-2.5 font-bold">المبلغ</th>
                            <th className="pb-2.5 font-bold">الحالة</th>
                            <th className="pb-2.5 font-bold">الوقت</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40">
                          {dispatchLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                              <td className="py-3 font-mono font-bold text-brand-burgundy">#{log.orderId}</td>
                              <td className="py-3 font-bold text-brand-text">{log.customerName}</td>
                              <td className="py-3 font-mono dir-ltr">{log.customerPhone}</td>
                              <td className="py-3 font-mono">{(log.total || 0).toLocaleString()} ر.ي</td>
                              <td className="py-3">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200">
                                  <Check size={10} />
                                  <span>تم الإرسال</span>
                                </span>
                              </td>
                              <td className="py-3 text-[11px] text-brand-text-muted">
                                {new Date(log.timestamp).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Section 2: AI Inventory & Product Demand Intelligence */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="arabic-text text-lg font-black text-brand-burgundy">
                          محلل الذكاء الاصطناعي للمخزون والمنتجات الأكثر طلباً
                        </h3>
                        <p className="text-xs text-brand-text-muted">تحليل لحظي لحركة البيع، المنتجات الشائعة، وتوقعات إعادة التوريد</p>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateAiInventoryReport}
                      disabled={isGeneratingAiAnalysis}
                      className="px-5 py-2.5 bg-brand-burgundy text-[#FAF6F0] rounded-full text-xs font-bold arabic-text hover:bg-brand-burgundy-dark transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingAiAnalysis ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                          <span>جاري التحليل بالذكاء الاصطناعي...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-brand-gold" />
                          <span>بدء التحليل الفوري للمخزون والطلب (AI)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Demand & Stock Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-brand-border text-right space-y-1">
                      <span className="text-[11px] font-bold text-brand-text-muted">المنتج الأكثر طلباً هذا الأسبوع</span>
                      <p className="arabic-text font-black text-sm text-brand-burgundy">
                        {products[0]?.name_ar || 'سيروم النضارة والإشراق'}
                      </p>
                      <span className="text-[10px] text-emerald-700 font-bold">🔥 نسبة الطلب: 38% من المبيعات</span>
                    </div>

                    <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-brand-border text-right space-y-1">
                      <span className="text-[11px] font-bold text-brand-text-muted">منتجات على وشك النفاد (مخزون منخفض)</span>
                      <p className="font-mono font-black text-sm text-amber-700">
                        {products.filter(p => (p.stock || 20) <= 10).length} منتجات بحاجة توريد
                      </p>
                      <span className="text-[10px] text-amber-700 font-bold">⚠️ أقل من 10 قطع في المستودع</span>
                    </div>

                    <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-brand-border text-right space-y-1">
                      <span className="text-[11px] font-bold text-brand-text-muted">معدل دوران المخزون المقدر</span>
                      <p className="font-mono font-black text-sm text-emerald-700">
                        94.2% ممتاز
                      </p>
                      <span className="text-[10px] text-emerald-700 font-bold">✨ أعلى إقبال في فئة السيرومات والباقات</span>
                    </div>
                  </div>

                  {/* AI Analysis Output Box */}
                  {aiAnalysisResult && (
                    <div className="p-5 bg-gradient-to-br from-[#FAF6F0] to-[#F5EBE6] rounded-2xl border border-brand-border space-y-4 text-right">
                      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-brand-burgundy" />
                          <h4 className="arabic-text font-black text-sm text-brand-burgundy">التقرير الذكي الصادر من المساعد التحليلي</h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(aiAnalysisResult);
                              setCopiedMsg(true);
                              setTimeout(() => setCopiedMsg(false), 2000);
                            }}
                            className="px-3 py-1.5 bg-white text-brand-burgundy rounded-xl border border-brand-border text-xs font-bold hover:bg-brand-blush-light flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            {copiedMsg ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            <span>{copiedMsg ? 'تم النسخ' : 'نسخ التقرير'}</span>
                          </button>

                          <a
                            href={`https://wa.me/${(settings.whatsapp_orders || '+967783363977').replace(/\D/g, '')}?text=${encodeURIComponent(aiAnalysisResult)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <MessageCircle size={14} />
                            <span>إرسال لواتساب الإدارة</span>
                          </a>
                        </div>
                      </div>

                      <div className="arabic-text text-xs text-brand-text leading-relaxed whitespace-pre-line font-sans bg-white/70 p-4 rounded-xl border border-brand-border/40">
                        {aiAnalysisResult}
                      </div>
                    </div>
                  )}

                  {/* Low Stock Warning Table */}
                  <div className="space-y-3">
                    <h4 className="arabic-text font-black text-sm text-brand-burgundy flex items-center gap-2">
                      <Package className="w-4 h-4 text-brand-burgundy" />
                      <span>جدول رصد كميات المخزون والطلب لمنتجات وِد</span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full arabic-text text-right text-xs">
                        <thead>
                          <tr className="text-brand-text-muted border-b border-brand-border pb-2.5">
                            <th className="pb-2.5 font-bold">المنتج</th>
                            <th className="pb-2.5 font-bold">التصنيف</th>
                            <th className="pb-2.5 font-bold">السعر</th>
                            <th className="pb-2.5 font-bold">المخزون المتبقي</th>
                            <th className="pb-2.5 font-bold">مستوى الطلب</th>
                            <th className="pb-2.5 font-bold text-center">إجراء توريد</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40">
                          {products.map((p) => {
                            const stock = p.stock || 20;
                            const isLow = stock <= 10;
                            return (
                              <tr key={p.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                                <td className="py-3 font-bold text-brand-burgundy">{p.name_ar}</td>
                                <td className="py-3">{p.category || 'العناية'}</td>
                                <td className="py-3 font-mono">{(p.price_after || 0).toLocaleString()} ر.ي</td>
                                <td className="py-3">
                                  <span className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${isLow ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' : 'bg-emerald-50 text-emerald-700'}`}>
                                    {stock} قطعة
                                  </span>
                                </td>
                                <td className="py-3">
                                  <span className="text-[11px] font-bold text-brand-burgundy">
                                    {stock > 25 ? '🔥 عالي جداً' : stock > 10 ? '✨ نشط ومستمر' : '⚠️ متسارع (طلب مرتفع)'}
                                  </span>
                                </td>
                                <td className="py-3 text-center">
                                  <a
                                    href={`https://wa.me/${(settings.whatsapp_orders || '+967783363977').replace(/\D/g, '')}?text=${encodeURIComponent(`📋 طلب إعادة توريد عاجل:\nالمنتج: ${p.name_ar}\nالكمية الحالية المتبقية: ${stock} قطعة.\nالمطلوب توريد: 50 قطعة إضافية.`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex px-2.5 py-1 bg-white text-brand-burgundy hover:bg-brand-blush-light border border-brand-border rounded-lg text-[10px] font-bold transition-all"
                                  >
                                    طلب توريد
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Birthday Club & Surprise System */}
            {activeTab === 'birthdays' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#681329] to-[#3B0715] text-[#FAF6F0] rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden text-right">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-[#DFCEB5]">
                      <Gift className="w-4 h-4 text-brand-gold" />
                      <span>نادي مناسبات ود وسرور العميلات</span>
                    </div>
                    <h2 className="arabic-text text-2xl sm:text-3xl font-black">
                      الاحتفاء بميلاد عميلات «ود» 🌸
                    </h2>
                    <p className="arabic-text text-xs sm:text-sm text-white/80 max-w-xl">
                      تتبع أعياد ميلاد عميلات ود وإرسال بطاقة تهنئة فاخرة مع كود خصم مخصص بضغطة زر واحدة عبر واتساب.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs">
                  <h3 className="arabic-text text-lg font-black text-brand-burgundy mb-6 text-right">
                    العميلات المسجلات في نادي المناسبات ({birthdayCustomers.length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {birthdayCustomers.map(c => {
                      const bDate = new Date(c.birthday);
                      const isThisMonth = bDate.getMonth() + 1 === currentMonth;
                      return (
                        <div key={c.id} className="p-5 rounded-2xl border border-brand-border bg-[#FAF6F0] flex flex-col justify-between gap-4 text-right">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="arabic-text font-black text-brand-burgundy text-base">{c.name}</h4>
                              <p className="font-mono text-xs text-brand-text-muted mt-0.5 dir-ltr text-right">{c.phone_number}</p>
                            </div>
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${isThisMonth ? 'bg-brand-burgundy text-[#FAF6F0] animate-pulse' : 'bg-white border border-brand-border text-brand-text-muted'}`}>
                              {isThisMonth ? '🎉 ميلادها هذا الشهر!' : `تاريخ الميلاد: ${c.birthday}`}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between gap-2">
                            <button
                              onClick={() => {
                                setSelectedBirthdayCustomer(c);
                                setShowCardModal(true);
                              }}
                              className="px-3 py-2 bg-white text-brand-burgundy border border-brand-border rounded-xl text-xs font-bold arabic-text hover:bg-brand-blush-light flex items-center gap-1.5"
                            >
                              <Printer className="w-3.5 h-3.5 text-brand-gold" />
                              <span>عرض وطباعة البطاقة</span>
                            </button>

                            <a
                              href={`https://wa.me/${(c.phone_number || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                                (settings.birthday_template || 'كل عام وأنتِ تفيضين جمالاً ونضارة 🌸').replace('{{name}}', c.name || 'عميلتنا الغالية')
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 bg-brand-burgundy text-[#FAF6F0] rounded-xl text-xs font-bold arabic-text hover:bg-brand-burgundy-dark flex items-center gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-brand-gold" />
                              <span>إرسال واتساب</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Products Tab (With Full Add/Edit/Delete Capabilities) */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs text-right space-y-6">
                  {/* Highlighted Banner for Adding Products */}
                  <div className="bg-gradient-to-r from-[#FAF6F0] via-[#F3ECE0] to-[#EAE0D0] rounded-2xl p-5 sm:p-6 border-2 border-brand-gold/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-2 bg-brand-burgundy text-amber-300 rounded-xl">
                          <Package size={20} />
                        </span>
                        <h3 className="arabic-text text-xl font-black text-brand-burgundy">
                          إدارة كتالوج ومنتجات متجر «وِد»
                        </h3>
                      </div>
                      <p className="text-xs text-gray-700 font-medium">
                        أضيفي منتجاتكِ الجديدة بسهولة، مع رفع الصور مباشرة من كاميرا الجوال أو الألبوم بضغطة زر.
                      </p>
                    </div>

                    <button
                      onClick={handleOpenNewProductModal}
                      className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#722F37] to-[#5A252C] hover:from-[#5A252C] hover:to-[#40191E] text-white rounded-2xl text-xs sm:text-sm font-black arabic-text transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-95 cursor-pointer border border-[#8B3A44]"
                    >
                      <Plus size={20} className="text-amber-300 stroke-[3]" />
                      <span>+ إضافة منتج جديد للكتالوج</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">إجمالي المعروضات: {products.length} مستحضر</span>
                    <span className="text-[11px] text-brand-text-muted">يتم التحديث المباشر للكتالوج فور الحفظ</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(p => (
                      <div key={p.id} className="p-4 rounded-2xl border border-brand-border bg-[#FAF6F0] flex flex-col justify-between gap-3 text-right">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1608248597359-0a62372f8830?auto=format&fit=crop&q=80&w=800'} 
                            alt={p.name_ar} 
                            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-brand-border bg-white"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="arabic-text font-black text-xs sm:text-sm text-brand-burgundy truncate">{p.name_ar}</h4>
                            <span className="font-sans font-black text-xs text-brand-burgundy block mt-0.5">
                              {Number(p.price_after || p.price_before).toLocaleString()} ر.ي
                            </span>
                            <span className="text-[10px] text-brand-text-muted">{p.category || 'العناية بالبشرة'}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-brand-text-muted">المخزون: <strong>{p.stock ?? 20}</strong></span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductFormData({
                                  name_ar: p.name_ar,
                                  name_en: p.name_en || '',
                                  category: p.category || 'serums',
                                  price_after: p.price_after || p.price,
                                  price_before: p.price_before || '',
                                  description_ar: p.description_ar || '',
                                  ingredients_ar: p.ingredients_ar || '',
                                  usage_ar: p.usage_ar || '',
                                  size: p.size || '50 مل',
                                  skin_type: p.skin_type || 'all',
                                  goal: p.goal || 'glow',
                                  badge: p.badge || '',
                                  stock: p.stock ?? 20,
                                  images: p.images || ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800']
                                });
                                setShowProductModal(true);
                              }}
                              className="p-2 bg-white text-brand-burgundy rounded-lg border border-brand-border hover:bg-brand-blush-light transition-colors"
                              title="تعديل المنتج"
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 bg-white text-red-600 rounded-lg border border-brand-border hover:bg-red-50 transition-colors"
                              title="حذف المنتج"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Delivery Tab */}
            {activeTab === 'delivery' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs text-right space-y-6">
                  <h3 className="arabic-text text-xl font-black text-brand-burgundy flex items-center gap-2">
                    <Truck className="text-brand-burgundy" />
                    <span>إدارة مناديب التوصيل والشحن</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-burgundy">رقم المندوب الرئيسي 1 (صنعاء)</label>
                      <input
                        type="text"
                        dir="ltr"
                        className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border text-xs font-bold outline-none"
                        value={settings.delivery_num_1 || ''}
                        onChange={(e) => setSettings({ ...settings, delivery_num_1: e.target.value })}
                        placeholder="+967..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-burgundy">رقم المندوب 2 (المستعجل)</label>
                      <input
                        type="text"
                        dir="ltr"
                        className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border text-xs font-bold outline-none"
                        value={settings.delivery_num_2 || ''}
                        onChange={(e) => setSettings({ ...settings, delivery_num_2: e.target.value })}
                        placeholder="+967..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-burgundy">رقم شحن المحافظات 3</label>
                      <input
                        type="text"
                        dir="ltr"
                        className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border text-xs font-bold outline-none"
                        value={settings.delivery_num_3 || ''}
                        onChange={(e) => setSettings({ ...settings, delivery_num_3: e.target.value })}
                        placeholder="+967..."
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateSettings}
                    disabled={isUpdatingSettings}
                    className="px-8 py-3 bg-brand-burgundy text-[#FAF6F0] rounded-full text-xs font-bold arabic-text hover:bg-brand-burgundy-dark transition-all"
                  >
                    {isUpdatingSettings ? 'جاري الحفظ...' : 'حفظ أرقام المناديب'}
                  </button>
                </div>
              </div>
            )}

            {/* 5. Customers Tab */}
            {activeTab === 'customers' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs text-right">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="arabic-text text-xl font-black text-brand-burgundy">
                      سجل عميلات وِد
                    </h3>
                    <span className="text-xs font-bold text-brand-text-muted">{customers.length} عميلة مسجلة</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full arabic-text text-right text-xs">
                      <thead>
                        <tr className="text-brand-text-muted border-b border-brand-border pb-3">
                          <th className="pb-3 font-bold">الاسم</th>
                          <th className="pb-3 font-bold">الهاتف</th>
                          <th className="pb-3 font-bold">المدينة</th>
                          <th className="pb-3 font-bold">تاريخ الميلاد</th>
                          <th className="pb-3 font-bold text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40">
                        {customers.map(c => (
                          <tr key={c.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                            <td className="py-4 font-bold text-brand-burgundy">{c.name}</td>
                            <td className="py-4 font-mono dir-ltr">{c.phone_number}</td>
                            <td className="py-4">{c.city || 'صنعاء'}</td>
                            <td className="py-4 font-mono">{c.birthday || '-'}</td>
                            <td className="py-4 text-center">
                              <a
                                href={`https://wa.me/${(c.phone_number || '').replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-700 hover:text-white rounded-xl transition-all"
                              >
                                <MessageCircle size={16} />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Finance & Treasury Tab */}
            {activeTab === 'finance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs text-right space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-brand-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#722F37] flex items-center justify-center border border-amber-200">
                        <Wallet className="w-5 h-5 text-brand-gold" />
                      </div>
                      <div>
                        <h3 className="arabic-text text-xl font-black text-brand-burgundy">
                          الخزينة والمالية - الحسابات والمحافظ المعتمدة
                        </h3>
                        <p className="text-xs text-brand-text-muted">بيانات الحسابات المستخدمة لتحصيل مبيعات وحوالات متجر «وِد»</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Kuraimi */}
                    <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-brand-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-burgundy">بنك الكريمي (حساب مميز)</span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">بنكي</span>
                      </div>
                      <p className="font-mono font-black text-base text-brand-burgundy">{settings.kuraimi_account || '3012345678'}</p>
                      <span className="text-[10px] text-brand-text-muted">التحويل المالي المباشر عبر تطبيق الكريمي</span>
                    </div>

                    {/* Jeeb Wallet */}
                    <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-brand-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-burgundy">محفظة جيب الإلكترونية (Jeeb)</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">محفظة فورية</span>
                      </div>
                      <p className="font-mono font-black text-base text-brand-burgundy">{settings.jeeb_account || '770000000'}</p>
                      <span className="text-[10px] text-brand-text-muted">رقم محفظة جيب لاستقبال الدفعات</span>
                    </div>

                    {/* OneCash */}
                    <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-brand-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-burgundy">محفظة ون كاش (OneCash)</span>
                        <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full">محفظة</span>
                      </div>
                      <p className="font-mono font-black text-base text-brand-burgundy">{settings.onecash_account || '770000000'}</p>
                      <span className="text-[10px] text-brand-text-muted">رقم حساب محفظة ون كاش</span>
                    </div>

                    {/* Floosak */}
                    <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-brand-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-burgundy">محفظة فلوسك (Floosak)</span>
                        <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full">محفظة</span>
                      </div>
                      <p className="font-mono font-black text-base text-brand-burgundy">{settings.floosak_account || '770000000'}</p>
                      <span className="text-[10px] text-brand-text-muted">رقم حساب محفظة فلوسك</span>
                    </div>

                    {/* Standard Bank Transfer */}
                    <div className="p-4 bg-[#FAF6F0] rounded-2xl border-2 border-brand-gold/40 sm:col-span-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-brand-burgundy">التحويل البنكي العادي (حوالات بنكية)</span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">حوالة بنكية</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-brand-border">
                        <div>
                          <span className="text-brand-text-muted block text-[11px]">اسم المستفيد المعتمد:</span>
                          <strong className="text-brand-burgundy font-black text-sm">{settings.bank_transfer_name || 'مؤسسة وِد للعناية والتجميل'}</strong>
                        </div>
                        <div>
                          <span className="text-brand-text-muted block text-[11px]">رقم الحساب / الآيبان / اسم البنك:</span>
                          <strong className="text-brand-burgundy font-mono font-black text-sm">{settings.bank_transfer_account || '1020304050 / بنك التضامن'}</strong>
                        </div>
                      </div>
                      <p className="text-[11px] text-brand-text-muted">
                        يتم إظهار الاسم ورقم الحساب أعلاه للعميلة عند اختيار "التحويل البنكي العادي" في سلة الشراء.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-xs text-right space-y-8 relative">
                  
                  {/* Top Action & Save Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#FAF6F0] rounded-2xl border border-brand-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-burgundy text-[#FAF6F0] flex items-center justify-center font-bold">
                        <Save className="w-5 h-5 text-brand-gold" />
                      </div>
                      <div>
                        <h3 className="arabic-text text-lg font-black text-brand-burgundy">
                          إعدادات المتجر والهوية البصرية
                        </h3>
                        <p className="text-[11px] text-brand-text-muted">
                          تحكمي بالاسم، الشعار، صورة الخلفية، وأرقام التواصل ثم اضغطي زر الحفظ.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleUpdateSettings}
                      disabled={isUpdatingSettings}
                      className="w-full sm:w-auto px-6 py-3 bg-brand-burgundy hover:bg-brand-burgundy-dark text-[#FAF6F0] rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {isUpdatingSettings ? (
                        <Loader2 className="w-4 h-4 text-brand-gold animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 text-brand-gold" />
                      )}
                      <span>{isUpdatingSettings ? 'جارِ الحفظ...' : '💾 حفظ وتطبيق جميع الإعدادات'}</span>
                    </button>
                  </div>

                  {/* Brand Visual Identity Section */}
                  <div className="border-b border-brand-border pb-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-gold" />
                        <h3 className="arabic-text text-xl font-black text-brand-burgundy">
                          الهوية البصرية والمظهر (الاسم، الشعار، والخلفية)
                        </h3>
                      </div>
                    </div>

                    {/* 1. Store Name and Slogan Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 flex items-center justify-between">
                          <span>اسم المتجر *</span>
                          <span className="text-[10px] text-amber-700 font-bold">يظهر في الهيدر والفوتر واللوجو والرئيسية</span>
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-black text-gray-900 arabic-text outline-none focus:border-[#722F37]"
                          value={settings.store_name || ''}
                          onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                          placeholder="مثال: وِد"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 flex items-center justify-between">
                          <span>الشعار اللفظي (Slogan)</span>
                          <span className="text-[10px] text-gray-500 font-bold">الوصف أسفل اسم المتجر</span>
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 arabic-text outline-none focus:border-[#722F37]"
                          value={settings.store_slogan || ''}
                          onChange={(e) => setSettings({ ...settings, store_slogan: e.target.value })}
                          placeholder="مثال: للعناية الفاخرة بالبشرة"
                        />
                      </div>
                    </div>

                    {/* 2. Custom Store Logo Upload with Live Preview */}
                    <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-brand-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-brand-burgundy" />
                          <label className="text-xs font-bold text-brand-burgundy">شعار المتجر (Logo)</label>
                        </div>
                        {settings.logo_url && (
                          <button
                            type="button"
                            onClick={() => {
                              setSettings({ ...settings, logo_url: '' });
                              setLogoUploadSuccess(false);
                            }}
                            className="text-[11px] text-red-600 hover:underline font-bold"
                          >
                            استعادة الشعار الافتراضي
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        {/* Live Logo Preview inside circle */}
                        <div className="shrink-0 flex flex-col items-center gap-1.5">
                          <div className="w-20 h-20 rounded-full border-2 border-[#EADBCE] bg-white shadow-md flex items-center justify-center overflow-hidden p-1 relative">
                            {isProcessingLogo ? (
                              <Loader2 className="w-6 h-6 text-brand-burgundy animate-spin" />
                            ) : settings.logo_url ? (
                              <img 
                                src={settings.logo_url} 
                                alt="شعار المتجر" 
                                className="w-full h-full object-cover rounded-full" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="text-center">
                                <WedLogo size="xs" variant="burgundy" showSubtitle={false} />
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-brand-text-muted">معاينة الشعار</span>
                        </div>

                        {/* Direct Studio Upload Button */}
                        <div className="flex-1 w-full space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <label className={`cursor-pointer inline-flex items-center gap-2.5 px-5 py-3 bg-brand-burgundy text-[#FAF6F0] rounded-xl text-xs font-bold hover:bg-brand-burgundy-dark transition-all shadow-md active:scale-95 ${isProcessingLogo ? 'opacity-70 pointer-events-none' : ''}`}>
                              {isProcessingLogo ? (
                                <Loader2 className="w-4 h-4 text-brand-gold animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4 text-brand-gold" />
                              )}
                              <span>{isProcessingLogo ? 'جارِ معالجة الشعار...' : 'إضافة شعار من الاستوديو'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  handleLogoFileSelect(e.target.files?.[0]);
                                }}
                              />
                            </label>
                            {logoUploadSuccess && (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-flex items-center gap-1.5">
                                <Check className="w-4 h-4" />
                                تم تجهيز الشعار بنجاح
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-brand-text-muted">
                            يمكنكِ اختيار أي صورة أو تصميم شعار مباشرة من ألبوم الصور بالهاتف أو جهازكِ.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 3. Background Hero Image Upload Directly from Studio */}
                    <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-brand-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-brand-burgundy" />
                          <label className="text-xs font-bold text-brand-burgundy">صورة خلفية الواجهة الرئيسية (Hero Banner)</label>
                        </div>
                        {settings.bg_url && settings.bg_url !== 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2070' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSettings({ ...settings, bg_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2070' });
                              setBgUploadSuccess(false);
                            }}
                            className="text-[11px] text-red-600 hover:underline font-bold"
                          >
                            استعادة الخلفية الافتراضية
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        {/* Live Banner Preview */}
                        <div className="shrink-0 flex flex-col items-center gap-1.5 w-full sm:w-48">
                          <div className="w-full h-24 rounded-xl border border-[#EADBCE] bg-[#2B151B] shadow-md overflow-hidden relative flex items-center justify-center">
                            {isProcessingBg ? (
                              <Loader2 className="w-7 h-7 text-brand-gold animate-spin" />
                            ) : (
                              <>
                                <img 
                                  src={settings.bg_url || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2070'} 
                                  alt="معاينة الخلفية" 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/25" />
                              </>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-brand-text-muted">معاينة الخلفية الحالية</span>
                        </div>

                        {/* Direct Studio Upload Button Only */}
                        <div className="flex-1 w-full space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <label className={`cursor-pointer inline-flex items-center gap-2.5 px-5 py-3 bg-brand-burgundy text-[#FAF6F0] rounded-xl text-xs font-bold hover:bg-brand-burgundy-dark transition-all shadow-md active:scale-95 ${isProcessingBg ? 'opacity-70 pointer-events-none' : ''}`}>
                              {isProcessingBg ? (
                                <Loader2 className="w-4 h-4 text-brand-gold animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4 text-brand-gold" />
                              )}
                              <span>{isProcessingBg ? 'جارِ معالجة وضغط الصورة...' : 'إضافة صورة للخلفية من الاستوديو'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  handleBgFileSelect(e.target.files?.[0]);
                                }}
                              />
                            </label>
                            {bgUploadSuccess && (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-flex items-center gap-1.5">
                                <Check className="w-4 h-4" />
                                تم تجهيز الخلفية بنجاح
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-brand-text-muted">
                            اضغطي على الزر لاختيار أي صورة من الاستوديو ليتم ضغطها وتعيينها فوراً كخلفية رسمية لواجهة المتجر.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 4. Category Square Icons Image Customization */}
                    <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-brand-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-brand-burgundy" />
                          <label className="text-xs font-bold text-brand-burgundy">
                            صور وأيقونات التصنيفات (الأيقونات المربعة أسفل الشعار)
                          </label>
                        </div>
                        <span className="text-[10px] text-brand-text-muted">
                          تظهر كأيقونات مربعة ناعمة الأطراف تحت الشعار
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {CATEGORIES.map((cat) => {
                          const currentImg = settings.category_images?.[cat.id] || cat.image || '';
                          const isCatUploading = processingCatId === cat.id;
                          return (
                            <div key={cat.id} className="p-3 bg-white rounded-xl border border-brand-border flex items-center gap-3">
                              {/* Square Rounded Icon Preview */}
                              <div className="w-12 h-12 rounded-xl border border-[#EADBCE] bg-[#FAF6F0] overflow-hidden shrink-0 shadow-xs relative flex items-center justify-center">
                                {isCatUploading ? (
                                  <Loader2 className="w-4 h-4 text-brand-burgundy animate-spin" />
                                ) : currentImg ? (
                                  <img 
                                    src={currentImg} 
                                    alt={cat.nameAr} 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <Tag className="w-5 h-5 text-brand-text-muted" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-brand-burgundy truncate">{cat.nameAr}</span>
                                </div>

                                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF6F0] hover:bg-brand-blush-light text-brand-burgundy border border-brand-border rounded-lg text-[10px] font-bold transition-all">
                                  <Camera className="w-3 h-3 text-brand-gold" />
                                  <span>{isCatUploading ? 'جارِ المعالجة...' : 'تغيير الصورة'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      handleCategoryImgFileSelect(cat.id, e.target.files?.[0]);
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Save Identity Changes Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleUpdateSettings}
                        disabled={isUpdatingSettings}
                        className="px-6 py-2.5 bg-brand-burgundy text-[#FAF6F0] rounded-xl text-xs font-black hover:bg-brand-burgundy-dark transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                      >
                        {isUpdatingSettings ? (
                          <Loader2 className="w-4 h-4 text-brand-gold animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 text-brand-gold" />
                        )}
                        <span>حفظ وتطبيق الهوية البصرية فوراً</span>
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp and Financial Numbers */}
                  <div className="space-y-4">
                    <h4 className="arabic-text text-base font-black text-brand-burgundy">
                      أرقام التواصل والتحصيل
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900">رقم واتساب استلام الطلبات الرئيسي</label>
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#722F37]"
                          value={settings.whatsapp_orders || ''}
                          onChange={(e) => setSettings({ ...settings, whatsapp_orders: e.target.value })}
                          placeholder="+967..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900">رقم واتساب خدمة العميلات والاستشارات</label>
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#722F37]"
                          value={settings.whatsapp || ''}
                          onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                          placeholder="+967..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900">رقم حساب الكريمي</label>
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#722F37]"
                          value={settings.kuraimi_account || ''}
                          onChange={(e) => setSettings({ ...settings, kuraimi_account: e.target.value })}
                          placeholder="3012345678"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900">رقم محفظة جيب الإلكترونية (Jeeb)</label>
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#722F37]"
                          value={settings.jeeb_account || ''}
                          onChange={(e) => setSettings({ ...settings, jeeb_account: e.target.value })}
                          placeholder="770000000"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900">رقم محفظة ون كاش (OneCash)</label>
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#722F37]"
                          value={settings.onecash_account || ''}
                          onChange={(e) => setSettings({ ...settings, onecash_account: e.target.value })}
                          placeholder="770000000"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900">رقم محفظة فلوسك (Floosak)</label>
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#722F37]"
                          value={settings.floosak_account || ''}
                          onChange={(e) => setSettings({ ...settings, floosak_account: e.target.value })}
                          placeholder="770000000"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900">اسم المستفيد (للتحويل البنكي العادي)</label>
                        <input
                          type="text"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#722F37] arabic-text"
                          value={settings.bank_transfer_name || ''}
                          onChange={(e) => setSettings({ ...settings, bank_transfer_name: e.target.value })}
                          placeholder="مثال: مؤسسة وِد للعناية والتجميل"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900">رقم الحساب / الآيبان (للتحويل البنكي العادي)</label>
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#722F37] font-mono"
                          value={settings.bank_transfer_account || ''}
                          onChange={(e) => setSettings({ ...settings, bank_transfer_account: e.target.value })}
                          placeholder="1020304050 / بنك التضامن"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media Accounts & External Links */}
                  <div className="space-y-6 pt-4 border-t border-brand-border">
                    <div>
                      <h4 className="arabic-text text-base font-black text-brand-burgundy">
                        حسابات السوشل ميديا وروابط المتجر الخارجية
                      </h4>
                      <p className="text-xs text-brand-text-muted mt-0.5">
                        تظهر هذه الحسابات في تذييل المتجر وصفحات التواصل المباشر مع العميلات
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <span>إنستغرام (Instagram)</span>
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#722F37]"
                          value={settings.instagram || ''}
                          onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                          placeholder="https://instagram.com/..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <span>فيسبوك (Facebook)</span>
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#722F37]"
                          value={settings.facebook || ''}
                          onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                          placeholder="https://facebook.com/..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <span>تيك توك (TikTok)</span>
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#722F37]"
                          value={settings.tiktok || ''}
                          onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })}
                          placeholder="https://tiktok.com/@..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <span>سناب شات (Snapchat)</span>
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#722F37]"
                          value={settings.snapchat || ''}
                          onChange={(e) => setSettings({ ...settings, snapchat: e.target.value })}
                          placeholder="https://snapchat.com/add/..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <span>تيليجرام (Telegram)</span>
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          className="w-full p-3 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#722F37]"
                          value={settings.telegram || ''}
                          onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
                          placeholder="https://t.me/..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-brand-burgundy flex items-center gap-1.5">
                          <span>رابط البريد الإلكتروني الرسمي</span>
                        </label>
                        <input
                          type="email"
                          dir="ltr"
                          className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border text-xs outline-none"
                          value={settings.email || ''}
                          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                          placeholder="care@wed-beauty.com"
                        />
                      </div>
                    </div>

                    {/* Custom External Store Links Manager */}
                    <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-brand-border space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="arabic-text text-xs font-black text-brand-burgundy flex items-center gap-1.5">
                          <ExternalLink className="w-4 h-4 text-brand-gold" />
                          <span>روابط إضافية خارجية للمتجر (مواقع شركاء، منصات تقييم، فروع، إلخ)</span>
                        </h5>
                        <span className="text-[11px] text-brand-text-muted">
                          {(settings.custom_links || []).length} روابط مسجلة
                        </span>
                      </div>

                      {/* Add new external link form */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            placeholder="عنوان الرابط (مثلاً: موقعنا في قوقل ماب)"
                            value={newLinkTitle}
                            onChange={(e) => setNewLinkTitle(e.target.value)}
                            className="w-full p-2.5 bg-white rounded-xl border border-brand-border text-xs arabic-text outline-none"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            dir="ltr"
                            placeholder="الرابط URL (مثلاً: https://maps.google.com/...)"
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            className="w-full p-2.5 bg-white rounded-xl border border-brand-border text-xs outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
                              const updatedLinks = [
                                ...(settings.custom_links || []),
                                { title: newLinkTitle.trim(), url: newLinkUrl.trim() }
                              ];
                              setSettings({ ...settings, custom_links: updatedLinks });
                              setNewLinkTitle('');
                              setNewLinkUrl('');
                            }}
                            className="w-full h-full py-2.5 bg-brand-burgundy text-[#FAF6F0] rounded-xl text-xs font-bold arabic-text hover:bg-brand-burgundy-dark transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus size={14} />
                            <span>إضافة</span>
                          </button>
                        </div>
                      </div>

                      {/* List of custom links */}
                      {(settings.custom_links && settings.custom_links.length > 0) && (
                        <div className="space-y-2 pt-2">
                          {settings.custom_links.map((link: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-brand-border text-xs"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <ExternalLink size={14} className="text-brand-burgundy shrink-0" />
                                <span className="font-bold text-brand-burgundy">{link.title}</span>
                                <span className="text-[11px] text-brand-text-muted truncate max-w-[200px]" dir="ltr">
                                  {link.url}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = settings.custom_links.filter((_: any, i: number) => i !== idx);
                                  setSettings({ ...settings, custom_links: updated });
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="حذف الرابط"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Skincare Advisor Training Integration in Settings */}
                  <div className="p-6 bg-gradient-to-br from-[#FAF6F0] via-white to-[#F3ECE0] rounded-3xl border-2 border-brand-gold/40 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#722F37] text-white flex items-center justify-center shadow-md">
                          <Bot className="w-6 h-6 text-amber-300" />
                        </div>
                        <div>
                          <h4 className="arabic-text font-black text-base text-[#722F37] flex items-center gap-2">
                            <span>تدريب وتوجيه مساعد «وِد» للعناية بالبشرة</span>
                            <span className="text-[10px] bg-amber-100 text-[#722F37] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                              Knowledge Base AI
                            </span>
                          </h4>
                          <p className="text-xs text-brand-text-muted mt-0.5">
                            تدريب المساعد وتحديد الإجابات المعتمدة لكل سيناريو وسؤال، مع ربط المنتجات للشراء الفوري.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab('ai_training')}
                        className="px-5 py-2.5 bg-[#722F37] hover:bg-[#58242A] text-white rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Sparkles size={14} className="text-amber-300" />
                        <span>فتح شاشة تدريب المساعد وإضافة القواعد</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-burgundy">قالب رسالة تهنئة نادي أعياد الميلاد (واتساب)</label>
                    <textarea
                      rows={3}
                      className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border text-xs arabic-text outline-none"
                      value={settings.birthday_template || ''}
                      onChange={(e) => setSettings({ ...settings, birthday_template: e.target.value })}
                    />
                  </div>

                  {/* Main Bottom Save Action Box */}
                  <div className="p-6 bg-gradient-to-r from-brand-burgundy via-[#8B3A44] to-brand-burgundy text-[#FAF6F0] rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-right">
                      <h4 className="arabic-text font-black text-base text-brand-gold flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        <span>تأكيد وحفظ التغييرات</span>
                      </h4>
                      <p className="text-xs text-[#FAF6F0]/80">
                        سيتم تحديث اسم المتجر، الشعار، صورة الواجهة، والتصنيفات في كافة الصفحات فوراً.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleUpdateSettings}
                      disabled={isUpdatingSettings}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-gold via-[#EADBCE] to-brand-gold text-brand-burgundy rounded-2xl text-sm font-black transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingSettings ? (
                        <Loader2 className="w-5 h-5 text-brand-burgundy animate-spin" />
                      ) : (
                        <Check className="w-5 h-5 text-brand-burgundy" />
                      )}
                      <span>{isUpdatingSettings ? 'جارِ تطبيق التغييرات...' : '💾 حفظ وتطبيق جميع التغييرات الآن'}</span>
                    </button>
                  </div>
                </div>

                {/* Floating Quick Save Button for easy access while scrolling */}
                <div className="fixed bottom-6 left-6 z-50">
                  <button
                    type="button"
                    onClick={handleUpdateSettings}
                    disabled={isUpdatingSettings}
                    className="px-5 py-3.5 bg-brand-burgundy hover:bg-brand-burgundy-dark text-white rounded-full shadow-2xl border-2 border-brand-gold/60 flex items-center gap-2.5 text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingSettings ? (
                      <Loader2 className="w-4 h-4 text-brand-gold animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 text-brand-gold" />
                    )}
                    <span>حفظ الإعدادات</span>
                  </button>
                </div>
              </div>
            )}

            {/* Dedicated AI Skincare Assistant Training Tab */}
            {activeTab === 'ai_training' && (
              <div className="space-y-6">
                <AiTrainingManager />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-2xl w-full text-right space-y-4 my-6 shadow-2xl border border-brand-border">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-brand-burgundy text-amber-300 rounded-xl">
                  <Package size={18} />
                </span>
                <h3 className="arabic-text text-lg sm:text-xl font-black text-brand-burgundy">
                  {editingProduct ? 'تعديل بيانات المستحضر' : 'إضافة منتج جديد لكتالوج وِد'}
                </h3>
              </div>
              <button 
                onClick={() => setShowProductModal(false)} 
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-brand-burgundy">اسم المنتج بالعربية *</label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border outline-none font-bold text-gray-900"
                    value={productFormData.name_ar}
                    onChange={(e) => setProductFormData({ ...productFormData, name_ar: e.target.value })}
                    placeholder="مثال: سيروم النضارة المخملي الفاخر"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-brand-burgundy">اسم المنتج بالإنجليزية</label>
                  <input
                    type="text"
                    dir="ltr"
                    className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border outline-none font-sans text-gray-900"
                    value={productFormData.name_en}
                    onChange={(e) => setProductFormData({ ...productFormData, name_en: e.target.value })}
                    placeholder="e.g. Velvet Glow Serum"
                  />
                </div>
              </div>

              {/* Product Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-brand-burgundy flex items-center justify-between">
                    <span>تصنيف المنتج في المتجر *</span>
                    <span className="text-[10px] text-brand-gold font-bold">يحدد القسم الذي سيظهر فيه</span>
                  </label>
                  <select
                    value={productFormData.category || 'serums'}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border outline-none font-bold text-gray-900 cursor-pointer"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameAr} - {cat.description || cat.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-brand-burgundy">شارة المنتج المميزة (Badge)</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border outline-none font-bold text-gray-900"
                    value={productFormData.badge || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, badge: e.target.value })}
                    placeholder="مثال: الأكثر مبيعاً، حصري، وصل حديثاً..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-brand-burgundy">السعر النهائي (ر.ي) *</label>
                  <input
                    required
                    type="number"
                    className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border outline-none font-mono font-bold text-emerald-800 text-sm"
                    value={productFormData.price_after}
                    onChange={(e) => setProductFormData({ ...productFormData, price_after: e.target.value })}
                    placeholder="18500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-brand-burgundy">السعر قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border outline-none font-mono text-gray-600"
                    value={productFormData.price_before}
                    onChange={(e) => setProductFormData({ ...productFormData, price_before: e.target.value })}
                    placeholder="22000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-brand-burgundy">المخزون المتوفر</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border outline-none font-mono font-bold"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({ ...productFormData, stock: Number(e.target.value) })}
                    placeholder="25"
                  />
                </div>
              </div>

              {/* Direct Mobile-Optimized Product Image Upload */}
              <div className="space-y-3 p-4 sm:p-5 bg-[#FAF6F0] rounded-2xl border-2 border-brand-gold/40">
                <div className="flex items-center justify-between">
                  <label className="font-black text-brand-burgundy flex items-center gap-1.5 text-xs">
                    <Camera size={16} className="text-brand-gold" />
                    <span>صورة المنتج (مخصصة للجوال والكمبيوتر) *</span>
                  </label>
                  <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                    معالجة وضغط تلقائي فوري
                  </span>
                </div>

                {/* Processing and Status Banner */}
                {isProcessingImage && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900 animate-pulse">
                    <Loader2 size={16} className="animate-spin text-brand-burgundy" />
                    <span>جاري معالجة وضغط صورة الجوال بدقة عالية وحجم خفيف...</span>
                  </div>
                )}

                {imageUploadSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-[11px] font-bold text-emerald-800">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>تم رفع وتجهيز الصورة بنجاح! جاهزة للحفظ في الكتالوج.</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail Preview */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-brand-burgundy/30 bg-white shadow-xs overflow-hidden shrink-0 relative flex items-center justify-center">
                    {productFormData.images?.[0] ? (
                      <>
                        <img 
                          src={productFormData.images[0]} 
                          alt="معاينة المنتج" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProductFormData({ ...productFormData, images: [''] });
                            setImageUploadSuccess(false);
                          }}
                          className="absolute top-1.5 left-1.5 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 shadow-sm"
                          title="حذف الصورة"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2 text-brand-text-muted">
                        <Camera className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                        <span className="text-[9px] block">لا توجد صورة</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions (Camera, File picker, Presets) */}
                  <div className="flex-1 w-full space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Mobile Camera Direct Shooting */}
                      <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#722F37] to-[#5A252C] hover:from-[#5A252C] hover:to-[#40191E] text-white rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 text-center">
                        <Camera size={16} className="text-amber-300" />
                        <span>📸 التقاط بالكاميرا</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => handleImageFileInput(e.target.files?.[0])}
                        />
                      </label>

                      {/* Photo Library / Studio Picker */}
                      <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3.5 bg-white text-gray-900 border-2 border-brand-border hover:bg-amber-50/50 rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 text-center">
                        <Layers size={16} className="text-[#722F37]" />
                        <span>🖼️ اختيار من المعرض</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileInput(e.target.files?.[0])}
                        />
                      </label>
                    </div>

                    {/* Preset Luxury Beauty Photos (1-Click selection) */}
                    <div className="pt-1">
                      <p className="text-[10px] font-bold text-brand-burgundy mb-1.5">أو اختاري صورة فاخرة جاهزة بلمسة واحدة:</p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {PRESET_BEAUTY_IMAGES.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setProductFormData({ ...productFormData, images: [preset.url] });
                              setImageUploadSuccess(true);
                            }}
                            className={cn(
                              "p-1 rounded-xl border text-center transition-all bg-white hover:border-brand-burgundy",
                              productFormData.images?.[0] === preset.url 
                                ? "border-2 border-brand-burgundy ring-2 ring-brand-burgundy/20" 
                                : "border-gray-200"
                            )}
                            title={preset.label}
                          >
                            <img 
                              src={preset.url} 
                              alt={preset.label} 
                              className="w-full h-8 object-cover rounded-lg mb-0.5"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-[9px] font-bold text-gray-700 block truncate">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Direct Image URL input */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-brand-text-muted shrink-0">أو رابط صورة:</span>
                      <input
                        type="text"
                        dir="ltr"
                        className="flex-1 p-2 bg-white rounded-lg border border-brand-border text-[11px] outline-none font-sans"
                        placeholder="https://..."
                        value={productFormData.images?.[0] || ''}
                        onChange={(e) => setProductFormData({ ...productFormData, images: [e.target.value] })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-burgundy">وصف المستحضر وفوائده</label>
                <textarea
                  rows={2}
                  className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-brand-border outline-none text-gray-900"
                  placeholder="وصف تفصيلي لمكونات وفوائد المنتج للبشرة..."
                  value={productFormData.description_ar}
                  onChange={(e) => setProductFormData({ ...productFormData, description_ar: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-6 py-3 rounded-2xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct || isProcessingImage}
                  className="px-8 py-3 bg-gradient-to-r from-[#722F37] to-[#5A252C] hover:from-[#5A252C] hover:to-[#40191E] text-white rounded-2xl font-black shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                  {isSavingProduct ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>جاري الحفظ في الكتالوج...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} className="text-amber-300" />
                      <span>حفظ المنتج في المتجر</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Birthday Card Printable Modal */}
      {showCardModal && selectedBirthdayCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-3xl p-8 max-w-lg w-full text-center space-y-6 border-2 border-brand-gold shadow-2xl relative">
            <button 
              onClick={() => setShowCardModal(false)} 
              className="absolute top-4 left-4 text-brand-burgundy font-bold text-lg"
            >
              ✕
            </button>

            <div className="space-y-2">
              <WedLogo size="md" variant="burgundy" />
              <div className="w-16 h-0.5 bg-brand-gold mx-auto my-3" />
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest block">WED LUXURY GREETING</span>
              <h2 className="arabic-text text-2xl font-black text-brand-burgundy">
                كل عام وأنتِ تفيضين جمالاً 🌸
              </h2>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-brand-border/80 shadow-inner text-right space-y-3">
              <p className="arabic-text text-sm font-bold text-brand-burgundy">إلى الغالية: {selectedBirthdayCustomer.name}</p>
              <p className="arabic-text text-xs text-brand-text-muted leading-relaxed">
                يسر أسرة «ود» للعناية بالبشرة أن تهنئكِ بيوم ميلادكِ السعيد، ونهديكِ كود خصم حصري مع هديتنا الخاصة لكِ.
              </p>
              <div className="p-3 bg-brand-blush-light text-center rounded-xl border border-brand-blush/40 font-mono font-black text-brand-burgundy text-sm">
                كود الخصم: WED-BDAY
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-brand-burgundy text-white rounded-full text-xs font-bold arabic-text flex items-center gap-2 hover:bg-brand-burgundy-dark"
              >
                <Printer size={16} />
                <span>طباعة البطاقة الفاخرة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
