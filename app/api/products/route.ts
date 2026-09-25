import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [productsRes, categoriesRes, settingsRes] = await Promise.all([
      supabase
        .from('product_mappings')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .eq('is_active', true),
      supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'category_kitchen_settings')
        .single(),
    ]);

    if (productsRes.error) {
      console.error('Error fetching products from DB:', productsRes.error);
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const savedOverrides = (settingsRes.data?.value as Record<string, { charges_taper?: boolean; send_to_kitchen?: boolean }>) || {};

    const categoriesMap = new Map((categoriesRes.data || []).map((c: any) => {
      const isBeverage = /bebida|gaseosa|refresco|cerveza|trago|coctel|jugo|agua|vino/i.test(
        `${c.name || ''} ${c.slug || ''}`
      );
      const override = savedOverrides[c.id] || savedOverrides[c.slug] || {};
      const charges_taper =
        c.charges_taper !== undefined && c.charges_taper !== null
          ? Boolean(c.charges_taper)
          : override.charges_taper !== undefined
          ? Boolean(override.charges_taper)
          : !isBeverage;

      const send_to_kitchen =
        c.send_to_kitchen !== undefined && c.send_to_kitchen !== null
          ? Boolean(c.send_to_kitchen)
          : override.send_to_kitchen !== undefined
          ? Boolean(override.send_to_kitchen)
          : !isBeverage;

      return [c.id, { ...c, charges_taper, send_to_kitchen }];
    }));

    const products = (productsRes.data || []).map((item: any) => {
      const cat = item.category_id ? categoriesMap.get(item.category_id) : null;
      const catName = cat?.name || 'Otros';
      const catSlug = cat?.slug || null;

      const titleOrCatBeverage = /bebida|gaseosa|refresco|cerveza|trago|coctel|jugo|agua|vino/i.test(
        `${catName} ${catSlug || ''} ${item.title || ''}`
      );

      const charges_taper =
        cat?.charges_taper !== undefined
          ? Boolean(cat.charges_taper)
          : !titleOrCatBeverage;

      const send_to_kitchen =
        cat?.send_to_kitchen !== undefined
          ? Boolean(cat.send_to_kitchen)
          : !titleOrCatBeverage;

      return {
        id: item.ventify_id || item.id,
        sku: item.sku || item.ventify_id || item.id,
        title: item.title,
        price: Number(item.price || 0),
        image: item.image || '/logo-que-bravazo.png',
        category: catName,
        category_id: item.category_id || null,
        category_slug: catSlug,
        charges_taper,
        send_to_kitchen,
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
