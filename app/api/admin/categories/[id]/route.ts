import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = createAdminClient();

    const update: Record<string, any> = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.slug !== undefined) update.slug = body.slug;
    if (body.description !== undefined) update.description = body.description;
    if (body.display_order !== undefined) update.display_order = body.display_order;
    if (body.is_active !== undefined) update.is_active = body.is_active;
    if (body.menu_type !== undefined) update.menu_type = body.menu_type;
    if (body.image !== undefined) update.image = body.image;

    let hasColumnSupport = true;
    const fullUpdate = { ...update };
    if (body.charges_taper !== undefined) fullUpdate.charges_taper = body.charges_taper;
    if (body.send_to_kitchen !== undefined) fullUpdate.send_to_kitchen = body.send_to_kitchen;

    let { data, error } = await supabase
      .from('categories')
      .update(fullUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error && (error.message.includes('column') || error.code === '42703')) {
      hasColumnSupport = false;
      // Reintentar sin las columnas nuevas
      const retry = await supabase
        .from('categories')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Si la tabla no tiene las columnas directamente o hubo fallback, persistir en site_settings
    if (body.charges_taper !== undefined || body.send_to_kitchen !== undefined) {
      try {
        const { data: currentSettings } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'category_kitchen_settings')
          .single();

        const currentMap = (currentSettings?.value as Record<string, any>) || {};
        currentMap[id] = {
          ...(currentMap[id] || {}),
          ...(body.charges_taper !== undefined ? { charges_taper: body.charges_taper } : {}),
          ...(body.send_to_kitchen !== undefined ? { send_to_kitchen: body.send_to_kitchen } : {}),
        };

        await supabase
          .from('site_settings')
          .upsert({ key: 'category_kitchen_settings', value: currentMap }, { onConflict: 'key' });
      } catch (saveErr) {
        console.warn('Error saving category override settings', saveErr);
      }
    }

    return NextResponse.json({
      data: {
        ...data,
        ...(body.charges_taper !== undefined ? { charges_taper: body.charges_taper } : {}),
        ...(body.send_to_kitchen !== undefined ? { send_to_kitchen: body.send_to_kitchen } : {}),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
