import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const DEFAULT_NON_FOOD_PATTERNS = [
  'bebida', 'gaseosa', 'refresco', 'cerveza', 'trago', 'coctel', 'jugo', 'agua', 'vino', 'snack', 'postre', 'empaquetado'
];

export async function GET() {
  const supabase = createAdminClient();

  const [catRes, settingsRes] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'category_kitchen_settings')
      .single(),
  ]);

  if (catRes.error) return NextResponse.json({ error: catRes.error.message }, { status: 500 });

  const savedOverrides = (settingsRes.data?.value as Record<string, { charges_taper?: boolean; send_to_kitchen?: boolean }>) || {};

  const enrichedData = (catRes.data || []).map((cat: any) => {
    const isBeverage = DEFAULT_NON_FOOD_PATTERNS.some(
      (pat) => cat.name?.toLowerCase().includes(pat) || cat.slug?.toLowerCase().includes(pat)
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

  return NextResponse.json({ data: enrichedData });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const insertPayload: Record<string, any> = {
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: body.description || '',
      display_order: body.display_order ?? 0,
      is_active: body.is_active ?? true,
      menu_type: body.menu_type || 'ambos',
      image: body.image || '',
    };

    // Intentar con columnas dedicadas
    let hasColumnSupport = true;
    let { data, error } = await supabase
      .from('categories')
      .insert({
        ...insertPayload,
        charges_taper: body.charges_taper ?? true,
        send_to_kitchen: body.send_to_kitchen ?? true,
      })
      .select()
      .single();

    if (error && (error.message.includes('column') || error.code === '42703')) {
      hasColumnSupport = false;
      // Reintentar sin las columnas nuevas
      const retry = await supabase
        .from('categories')
        .insert(insertPayload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Si la tabla no tiene las columnas directamente, persistir en site_settings
    if (!hasColumnSupport && data) {
      try {
        const { data: currentSettings } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'category_kitchen_settings')
          .single();

        const currentMap = (currentSettings?.value as Record<string, any>) || {};
        currentMap[data.id] = {
          charges_taper: body.charges_taper ?? true,
          send_to_kitchen: body.send_to_kitchen ?? true,
        };

        await supabase
          .from('site_settings')
          .upsert({ key: 'category_kitchen_settings', value: currentMap }, { onConflict: 'key' });
      } catch (saveErr) {
        console.warn('Error saving category override settings', saveErr);
      }
    }

    return NextResponse.json(
      {
        data: {
          ...data,
          charges_taper: body.charges_taper ?? true,
          send_to_kitchen: body.send_to_kitchen ?? true,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
