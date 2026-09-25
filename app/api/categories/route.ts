import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const menuType = searchParams.get('menu_type');

    const supabase = createAdminClient();
    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);

    if (menuType) {
      query = query.in('menu_type', [menuType, 'ambos']);
    }

    const [catRes, settingsRes] = await Promise.all([
      query.order('display_order', { ascending: true }).order('name', { ascending: true }),
      supabase.from('site_settings').select('value').eq('key', 'category_kitchen_settings').single(),
    ]);

    if (catRes.error) return NextResponse.json({ error: catRes.error.message }, { status: 500 });

    const savedOverrides = (settingsRes.data?.value as Record<string, { charges_taper?: boolean; send_to_kitchen?: boolean }>) || {};

    const enriched = (catRes.data || []).map((cat: any) => {
      const isBeverage = /bebida|gaseosa|refresco|cerveza|trago|coctel|jugo|agua|vino/i.test(
        `${cat.name || ''} ${cat.slug || ''}`
      );
      const override = savedOverrides[cat.id] || savedOverrides[cat.slug] || {};
      const charges_taper =
        cat.charges_taper !== undefined && cat.charges_taper !== null
          ? Boolean(cat.charges_taper)
          : override.charges_taper !== undefined
          ? Boolean(override.charges_taper)
          : !isBeverage;

      const send_to_kitchen =
        cat.send_to_kitchen !== undefined && cat.send_to_kitchen !== null
          ? Boolean(cat.send_to_kitchen)
          : override.send_to_kitchen !== undefined
          ? Boolean(override.send_to_kitchen)
          : !isBeverage;

      return {
        ...cat,
        charges_taper,
        send_to_kitchen,
      };
    });

    return NextResponse.json({ data: enriched }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
