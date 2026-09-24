import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function PUT(req: Request, { params }: { params: Promise<{ ventifyId: string }> }) {
  try {
    const { ventifyId } = await params;
    const body = await req.json();
    const supabase = createAdminClient();

    const price = body.price !== undefined ? Number(body.price) : 0;
    const cost_price = body.cost_price !== undefined ? Number(body.cost_price) : 0;
    const suggested_price = body.suggested_price !== undefined ? Number(body.suggested_price) : 0;
    const stock = body.stock !== undefined ? Number(body.stock) : 25;
    const barcode = body.barcode !== undefined ? String(body.barcode).trim() : '';

    const extra_data = {
      cost_price,
      suggested_price,
      stock,
      barcode,
      barcode_extras: body.barcode_extras || [],
      supplier: body.supplier || 'General',
      volume_pricing: body.volume_pricing || [],
      presentations: body.presentations || [],
    };

    const updateData: Record<string, any> = {
      sku: body.sku ?? '',
      title: body.title ?? '',
      price,
      image: body.image ?? '',
      description: body.description ?? '',
      display_order: body.display_order ?? 0,
      category_id: body.category_id || null,
      menu_types: body.menu_types || ['criollo', 'rapida'],
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      is_featured: body.is_featured !== undefined ? Boolean(body.is_featured) : false,
      cost_price,
      suggested_price,
      stock,
      barcode,
      extra_data,
      updated_at: new Date().toISOString(),
    };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ventifyId);

    // Intentar actualizar con todas las columnas
    let query = supabase.from('product_mappings').update(updateData);
    if (isUUID) {
      query = query.or(`ventify_id.eq.${ventifyId},id.eq.${ventifyId}`);
    } else {
      query = query.eq('ventify_id', ventifyId);
    }

    let { data, error } = await query.select().maybeSingle();

    if (error) {
      // Reintentar sin las columnas opcionales en caso de no estar migradas
      delete updateData.cost_price;
      delete updateData.suggested_price;
      delete updateData.stock;
      delete updateData.barcode;
      delete updateData.extra_data;

      let fallbackQuery = supabase.from('product_mappings').update(updateData);
      if (isUUID) {
        fallbackQuery = fallbackQuery.or(`ventify_id.eq.${ventifyId},id.eq.${ventifyId}`);
      } else {
        fallbackQuery = fallbackQuery.eq('ventify_id', ventifyId);
      }

      const fallback = await fallbackQuery.select().maybeSingle();

      if (fallback.error) {
        console.error('Error updating product_mapping:', fallback.error);
        return NextResponse.json({ error: fallback.error.message }, { status: 500 });
      }
      data = fallback.data;
    }

    // Si no existió registro para actualizar, hacer upsert
    if (!data) {
      const upsertPayload = {
        ventify_id: ventifyId,
        ...updateData,
      };
      const { data: inserted, error: insertError } = await supabase
        .from('product_mappings')
        .upsert(upsertPayload, { onConflict: 'ventify_id' })
        .select()
        .single();

      if (insertError) {
        console.error('Error upserting product_mapping:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      return NextResponse.json({ data: inserted });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Server error in PUT product-mappings:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ ventifyId: string }> }) {
  try {
    const { ventifyId } = await params;
    const supabase = createAdminClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ventifyId);

    let deleteQuery = supabase.from('product_mappings').delete();
    if (isUUID) {
      deleteQuery = deleteQuery.or(`ventify_id.eq.${ventifyId},id.eq.${ventifyId}`);
    } else {
      deleteQuery = deleteQuery.eq('ventify_id', ventifyId);
    }

    const { error } = await deleteQuery;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
