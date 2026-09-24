import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createAdminClient();

  const [mappingsRes, categoriesRes] = await Promise.all([
    supabase
      .from('product_mappings')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
  ]);

  if (mappingsRes.error) {
    return NextResponse.json({ error: mappingsRes.error.message }, { status: 500 });
  }

  const categories = categoriesRes.data || [];
  const categoriesMap = new Map(categories.map((c: any) => [c.id, c]));

  let rawProducts = mappingsRes.data || [];

  // Si la tabla estuviera vacía, sembrar productos iniciales de muestra
  if (rawProducts.length === 0 && categories.length > 0) {
    const firstCatId = categories[0].id;
    const defaultSample = [
      {
        ventify_id: 'prod-001',
        sku: 'Bebidas-008',
        title: 'Agua Cielo 2.5 lt',
        price: 4.0,
        cost_price: 2.2,
        suggested_price: 4.5,
        stock: 14,
        barcode: '775012345678',
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
        description: 'Agua mineral sin gas presentación familiar 2.5 Litros.',
        category_id: firstCatId,
        menu_types: ['criollo', 'rapida'],
        is_active: true,
        is_featured: false,
      },
      {
        ventify_id: 'prod-002',
        sku: 'Bebidas-003',
        title: 'Agua Cielo 625 ml',
        price: 1.7,
        cost_price: 0.9,
        suggested_price: 2.0,
        stock: 999,
        barcode: '775012345679',
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
        description: 'Agua mineral personal 625 ml.',
        category_id: firstCatId,
        menu_types: ['criollo', 'rapida'],
        is_active: true,
        is_featured: false,
      },
      {
        ventify_id: 'prod-003',
        sku: 'Fri-001',
        title: 'Alitas BBQ con papas fritas',
        price: 15.0,
        cost_price: 7.5,
        suggested_price: 16.0,
        stock: 0,
        barcode: '775098765432',
        image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80',
        description: 'Alitas crujientes bañadas en salsa BBQ con papas fritas doradas.',
        category_id: firstCatId,
        menu_types: ['rapida'],
        is_active: true,
        is_featured: true,
      },
      {
        ventify_id: 'prod-004',
        sku: 'Ham-007',
        title: 'Alitas Buffalo con papas fritas',
        price: 15.0,
        cost_price: 7.8,
        suggested_price: 16.5,
        stock: 29,
        barcode: '775098765433',
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
        description: 'Alitas picantes estilo buffalo con papas fritas y cremas.',
        category_id: firstCatId,
        menu_types: ['rapida'],
        is_active: true,
        is_featured: true,
      },
      {
        ventify_id: 'prod-005',
        sku: 'Fri-11',
        title: 'Salchipapa BRAVAZO',
        price: 15.0,
        cost_price: 6.5,
        suggested_price: 16.0,
        stock: 18,
        barcode: '775098765434',
        image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop&q=80',
        description: 'Generosa porción de papas amarillas crocantes con salchicha ahumada y huevo frito.',
        category_id: firstCatId,
        menu_types: ['rapida'],
        is_active: true,
        is_featured: true,
      },
      {
        ventify_id: 'prod-006',
        sku: 'Snack-002',
        title: 'Trident Chicle fresa',
        price: 2.0,
        cost_price: 1.1,
        suggested_price: 2.5,
        stock: 50,
        barcode: '775098765435',
        image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&auto=format&fit=crop&q=80',
        description: 'Goma de mascar sabor fresa sin azúcar.',
        category_id: firstCatId,
        menu_types: ['rapida'],
        is_active: true,
        is_featured: false,
      }
    ];

    try {
      const { data: seeded } = await supabase
        .from('product_mappings')
        .insert(defaultSample)
        .select();
      if (seeded) rawProducts = seeded;
    } catch {}
  }

  const products = rawProducts.map((p: any) => {
    const cat = p.category_id ? categoriesMap.get(p.category_id) : null;
    const extra = p.extra_data || {};
    return {
      id: p.id,
      ventify_id: p.ventify_id || p.id,
      sku: p.sku || '',
      title: p.title || '',
      price: Number(p.price || 0),
      cost_price: Number(p.cost_price ?? extra.cost_price ?? 0),
      suggested_price: Number(p.suggested_price ?? extra.suggested_price ?? 0),
      stock: Number(p.stock ?? extra.stock ?? 25),
      barcode: p.barcode || extra.barcode || '',
      barcode_extras: extra.barcode_extras || [],
      supplier: extra.supplier || 'General',
      presentations: extra.presentations || [],
      volume_pricing: extra.volume_pricing || [],
      image: p.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      description: p.description || '',
      category_id: p.category_id || null,
      category_name: cat?.name || 'Sin categoría',
      category_slug: cat?.slug || null,
      original_category: cat?.name || 'General',
      display_order: p.display_order ?? 0,
      menu_types: p.menu_types || ['criollo', 'rapida'],
      is_active: p.is_active ?? true,
      is_featured: p.is_featured ?? false,
      is_mapped: !!p.category_id,
    };
  });

  return NextResponse.json({
    products,
    total: products.length,
    categories,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const items = Array.isArray(body) ? body : [body];

    const records = items.map((item: any, index: number) => {
      const generatedId = crypto.randomUUID();
      const sku = item.sku?.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
      const price = item.price !== undefined ? Number(item.price) : 0;
      const cost_price = item.cost_price !== undefined ? Number(item.cost_price) : 0;
      const suggested_price = item.suggested_price !== undefined ? Number(item.suggested_price) : 0;
      const stock = item.stock !== undefined ? Number(item.stock) : 25;
      const barcode = item.barcode?.trim() || '';

      const extra_data = {
        cost_price,
        suggested_price,
        stock,
        barcode,
        barcode_extras: item.barcode_extras || [],
        supplier: item.supplier || 'General',
        volume_pricing: item.volume_pricing || [],
        presentations: item.presentations || [],
      };

      return {
        ventify_id: item.ventify_id || generatedId,
        sku,
        title: item.title?.trim() || 'Nuevo Producto',
        price,
        image: item.image?.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        description: item.description?.trim() || '',
        category_id: item.category_id || null,
        display_order: item.display_order !== undefined ? Number(item.display_order) : index,
        menu_types: item.menu_types && item.menu_types.length > 0 ? item.menu_types : ['criollo', 'rapida'],
        is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
        is_featured: item.is_featured !== undefined ? Boolean(item.is_featured) : false,
        cost_price,
        suggested_price,
        stock,
        barcode,
        extra_data,
      };
    });

    const { data, error } = await supabase
      .from('product_mappings')
      .insert(records)
      .select();

    if (error) {
      // Si falla por columnas que no existen todavía, reintentar sin las columnas nuevas
      const fallbackRecords = records.map((r: any) => ({
        ventify_id: r.ventify_id,
        sku: r.sku,
        title: r.title,
        price: r.price,
        image: r.image,
        description: r.description,
        category_id: r.category_id,
        display_order: r.display_order,
        menu_types: r.menu_types,
        is_active: r.is_active,
        is_featured: r.is_featured,
      }));

      const { data: fbData, error: fbError } = await supabase
        .from('product_mappings')
        .insert(fallbackRecords)
        .select();

      if (fbError) {
        return NextResponse.json({ error: fbError.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, data: Array.isArray(body) ? fbData : fbData[0] }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      data: Array.isArray(body) ? data : data[0],
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
