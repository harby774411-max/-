import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * DATABASE SCHEMA GUIDELINE FOR USER:
 * 
 * 1. products table:
 *    - id: uuid (primary key)
 *    - product_id: int4 (unique)
 *    - name_ar: text
 *    - name_en: text
 *    - description_ar: text
 *    - price_before: float8
 *    - price_after: float8
 *    - category: text
 *    - images: text[]
 *    - stock: text (default: 'available')
 *    - quantity: int4
 *    - created_at: timestamptz
 * 
 * 2. orders table:
 *    - id: uuid (primary key)
 *    - customer_name: text
 *    - phone: text
 *    - address: text
 *    - total: float8
 *    - status: text
 *    - items: jsonb
 *    - created_at: timestamptz
 * 
 * 3. customers table:
 *    - id: uuid (primary key)
 *    - phone_number: text (unique)
 *    - name: text
 *    - is_verified: boolean
 *    - created_at: timestamptz
 * 
 * 4. settings table:
 *    - id: int4 (primary key)
 *    - storeName: text
 *    - whatsapp: text
 *    - instagram: text
 *    - facebook: text
 *    - logo_url: text
 *    - bg_url: text
 *    - article_text: text
 * 
 * 4. transactions table:
 *    - id: uuid (primary key)
 *    - type: text ('income' | 'expense')
 *    - amount: float8
 *    - description: text
 *    - created_at: timestamptz
 * 
 * 5. Storage Bucket:
 *    - Create a public bucket named "products" in Supabase Storage.
 *    - Add a policy to allow public access.
 * 
 * NOTE: SEE /SUPABASE_SETUP.sql FOR THE FULL SQL CODE TO CREATE EVERYTHING.
 */
