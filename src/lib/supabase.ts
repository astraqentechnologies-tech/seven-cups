import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  role: 'customer' | 'admin';
  avatar_url: string;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  banner_url: string;
  seo_title: string;
  seo_description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  ingredients: string;
  benefits: string;
  brewing_instructions: string;
  flavor_profile: string;
  weight_grams: number;
  price: number;
  compare_price: number;
  stock_quantity: number;
  sku: string;
  tags: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  cover_image_url: string;
  seo_title: string;
  seo_description: string;
  sort_order: number;
  created_at: string;
  categories?: Category;
  product_images?: ProductImage[];
  reviews?: Review[];
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  sort_order: number;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  products?: Product;
};

export type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_zip: string;
  notes: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  reviewer_name: string;
  rating: number;
  title: string;
  body: string;
  is_approved: boolean;
  created_at: string;
};

export type Testimonial = {
  id: string;
  author_name: string;
  author_title: string;
  author_image: string;
  body: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};
