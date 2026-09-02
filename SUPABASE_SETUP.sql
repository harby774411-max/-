-- =========================================================================
-- WED (وِد) Luxury Skincare Store - Complete Supabase Database Schema
-- =========================================================================

-- 1. Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  city TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY, 
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'pending',
  items JSONB NOT NULL,
  subtotal NUMERIC CHECK (subtotal >= 0),
  shipping NUMERIC DEFAULT 0 CHECK (shipping >= 0),
  total NUMERIC NOT NULL CHECK (total >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'store-settings-id',
  store_name TEXT DEFAULT 'وِد',
  store_slogan TEXT DEFAULT 'للعناية الفاخرة بالبشرة',
  whatsapp TEXT DEFAULT '+967770000000',
  whatsapp_orders TEXT DEFAULT '+967770000000',
  whatsapp_courier TEXT DEFAULT '+967771111111',
  email TEXT DEFAULT 'care@wed-beauty.com',
  instagram TEXT DEFAULT 'https://instagram.com/wed_skincare',
  facebook TEXT DEFAULT 'https://facebook.com/wed_skincare',
  tiktok TEXT,
  snapchat TEXT,
  telegram TEXT,
  custom_links JSONB,
  whatsapp_bot_enabled BOOLEAN DEFAULT true,
  whatsapp_admin_alerts_enabled BOOLEAN DEFAULT true,
  whatsapp_customer_confirmation_enabled BOOLEAN DEFAULT true,
  whatsapp_ai_order_prompt_template TEXT,
  ai_inventory_analysis TEXT,
  ai_training_rules JSONB,
  logo_url TEXT,
  top_icon_url TEXT,
  middle_icon_url TEXT,
  bg_url TEXT,
  about_text TEXT DEFAULT 'مجموعات عناية منتقاة بعناية فائقة لتمنح بشرتك لمسة حريرية ونضارة تدوم.',
  express_delivery_fee NUMERIC DEFAULT 1500,
  free_shipping_threshold NUMERIC DEFAULT 30000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description_ar TEXT,
  ingredients_ar TEXT,
  usage_ar TEXT,
  size TEXT,
  skin_type TEXT DEFAULT 'all',
  goal TEXT DEFAULT 'glow',
  badge TEXT,
  category TEXT NOT NULL,
  price_after NUMERIC NOT NULL,
  price_before NUMERIC,
  stock INTEGER DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS) & Public Policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public update customers" ON public.customers FOR UPDATE USING (true);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public update settings" ON public.settings FOR UPDATE USING (true);
CREATE POLICY "Allow public insert settings" ON public.settings FOR INSERT WITH CHECK (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);
