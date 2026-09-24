import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { TablesConfig, RestaurantTable } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const DEFAULT_TABLES_CONFIG: TablesConfig = {
  total_tables: 12,
  default_capacity: 4,
  tables: Array.from({ length: 12 }, (_, i) => ({
    id: `table_${i + 1}`,
    number: String(i + 1),
    label: `Mesa ${i + 1}`,
    capacity: 4,
    zone: "Salón Principal",
    is_active: true,
  })),
};

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'restaurant_tables')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error reading restaurant_tables from site_settings:', error.message);
      return NextResponse.json(
        { success: true, data: DEFAULT_TABLES_CONFIG },
        { headers: NO_CACHE_HEADERS }
      );
    }

    let config = data?.value;
    if (typeof config === 'string') {
      try {
        config = JSON.parse(config);
      } catch {
        config = null;
      }
    }

    if (config && Array.isArray((config as TablesConfig).tables)) {
      return NextResponse.json(
        { success: true, data: config as TablesConfig },
        { headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data: DEFAULT_TABLES_CONFIG },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error('API /api/admin/tables GET error:', err);
    return NextResponse.json(
      { success: true, data: DEFAULT_TABLES_CONFIG },
      { headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: Request) {
  try {
    let body = await req.json();
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    const { total_tables, default_capacity = 4, tables } = body;

    if (!Array.isArray(tables)) {
      return NextResponse.json(
        { error: 'El listado de mesas debe ser un arreglo válido.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const payload: TablesConfig = {
      total_tables: Number(total_tables) || tables.length,
      default_capacity: Number(default_capacity) || 4,
      tables: tables.map((t: any, index: number) => ({
        id: String(t.id || `table_${index + 1}`),
        number: String(t.number || index + 1).trim(),
        label: t.label ? String(t.label).trim() : `Mesa ${t.number || index + 1}`,
        capacity: Number(t.capacity) > 0 ? Number(t.capacity) : 4,
        zone: t.zone ? String(t.zone).trim() : "Salón Principal",
        is_active: t.is_active !== false,
      })),
    };

    const supabase = createAdminClient();

    // Check if site_settings record exists first
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', 'restaurant_tables')
      .maybeSingle();

    let saveError;
    if (existing?.id) {
      const { error } = await supabase
        .from('site_settings')
        .update({
          value: payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      saveError = error;
    } else {
      const { error } = await supabase
        .from('site_settings')
        .insert({
          key: 'restaurant_tables',
          value: payload,
          updated_at: new Date().toISOString(),
        });
      saveError = error;
    }

    if (saveError) {
      console.error('Error saving restaurant_tables:', saveError.message);
      return NextResponse.json(
        { error: saveError.message },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data: payload },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error('API /api/admin/tables POST error:', err);
    return NextResponse.json(
      { error: err.message || 'Error al guardar mesas' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
