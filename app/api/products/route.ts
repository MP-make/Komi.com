import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from('product_mappings')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true),
    ]);

    if (productsRes.error) {
      console.error('Error fetching products from DB:', productsRes.error);
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const categoriesMap = new Map((categoriesRes.data || []).map((c: any) => [c.id, c]));

    const products = (productsRes.data || []).map((item: any) => {
      const cat = item.category_id ? categoriesMap.get(item.category_id) : null;
      return {
        id: item.ventify_id || item.id,
        sku: item.sku || item.ventify_id || item.id,
        title: item.title,
        price: Number(item.price || 0),
        image: item.image || '/logo-que-bravazo.png',
        category: cat?.name || 'Otros',
        category_slug: cat?.slug || null,
        description: item.description || '',
        stock: item.stock !== undefined && item.stock !== null ? Number(item.stock) : 50,
        featured: Boolean(item.is_featured),
        isMenuDelDia: Boolean(item.is_featured),
        minPrice: Number(item.price || 0) * 0.5,
        is_active: true,
        menu_types: item.menu_types || ['criollo', 'rapida'],
      };
    });

    return NextResponse.json(
      { data: products },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in /api/products:', error);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}
