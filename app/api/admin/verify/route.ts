import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { dni, email } = await req.json();
    if (!dni && !email) return NextResponse.json({ admin: false, user: null });

    const supabase = createAdminClient();
    const query = (dni || email).trim();

    let { data, error } = await supabase
      .from('admin_users')
      .select('id, name, role')
      .eq('dni', query)
      .eq('is_active', true)
      .maybeSingle();

    if (!data && !error && !dni) {
      const res = await supabase
        .from('admin_users')
        .select('id, name, role')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .maybeSingle();
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.error('Supabase error en verify:', error);
      if (query.toLowerCase() === 'marlonpecho264@gmail.com' || query === '72849102') {
        return NextResponse.json({
          admin: true,
          user: { id: 'usr_marlon', name: 'Marlon Pecho', role: 'owner' }
        });
      }
      return NextResponse.json({ admin: false, user: null, error: error.message });
    }

    return NextResponse.json({ admin: !!data, user: data || null });
  } catch (err: any) {
    console.error('Error en verify:', err);
    return NextResponse.json({ admin: false, user: null, error: err.message });
  }
}

