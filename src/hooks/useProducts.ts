import { useEffect, useState } from 'react';
import { supabase, Product, Category } from '../lib/supabase';

export function useProducts(filters?: {
  categorySlug?: string;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  limit?: number;
  search?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = supabase
      .from('products')
      .select('*, categories(*), product_images(*)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (filters?.featured) q = q.eq('is_featured', true);
    if (filters?.newArrival) q = q.eq('is_new_arrival', true);
    if (filters?.bestSeller) q = q.eq('is_best_seller', true);
    if (filters?.search) q = q.ilike('name', `%${filters.search}%`);
    if (filters?.limit) q = q.limit(filters.limit);

    if (filters?.categorySlug) {
      q = (q as ReturnType<typeof q.eq>).eq('categories.slug', filters.categorySlug);
    }

    q.then(({ data }) => {
      let results = (data as Product[]) || [];
      if (filters?.categorySlug) {
        results = results.filter(p => (p.categories as unknown as Category)?.slug === filters.categorySlug);
      }
      setProducts(results);
      setLoading(false);
    });
  }, [filters?.categorySlug, filters?.featured, filters?.newArrival, filters?.bestSeller, filters?.limit, filters?.search]);

  return { products, loading };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*, categories(*), product_images(*), reviews(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data as Product | null);
        setLoading(false);
      });
  }, [slug]);

  return { product, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setCategories((data as Category[]) || []);
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}
