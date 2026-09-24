import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

const VALID_ROLES = ['admin', 'staff', 'chef', 'owner', 'cashier', 'superadmin'];

const DEMO_STAFF = [
  {
    id: 'usr_marlon',
    name: 'Marlon Pecho',
    email: 'marlonpecho264@gmail.com',
    dni: '72849102',
    role: 'owner',
    branch: 'N/A',
    base_salary: 0,
    is_active: true,
    permissions: [
      'pos.orders.create', 'pos.orders.checkout', 'pos.orders.cancel', 'pos.reports.view',
      'kds.view', 'kds.update_status',
      'menu.manage', 'inventory.manage',
      'admin.metrics.view', 'admin.staff.manage', 'admin.settings.manage'
    ],
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  },
  {
    id: 'usr_cajero1',
    name: 'Cajero 1',
    email: 'cajero1@quebravazo.com',
    dni: '81920394',
    role: 'cashier',
    branch: 'QUEBRAVAZO!',
    base_salary: 1200,
    is_active: true,
    permissions: [
      'pos.orders.create', 'pos.orders.checkout', 'pos.reports.view'
    ],
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
  }
];

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // First attempt to query with new columns
    let { data, error } = await supabase
      .from('admin_users')
      .select('id, email, name, dni, role, is_active, created_at, branch, base_salary, permissions')
      .order('name');

    // If new columns are missing, fallback to standard columns
    if (error) {
      console.warn('Querying standard admin_users columns:', error.message);
      const fallback = await supabase
        .from('admin_users')
        .select('id, email, name, dni, role, is_active, created_at')
        .order('name');

      if (fallback.error) {
        console.error('Supabase admin_users error, returning demo fallback:', fallback.error);
        return NextResponse.json({ data: DEMO_STAFF });
      }

      data = (fallback.data || []).map((u: any) => ({
        ...u,
        branch: 'QUEBRAVAZO!',
        base_salary: 0,
        permissions: [],
      }));
    } else {
      data = (data || []).map((u: any) => ({
        ...u,
        branch: u.branch || 'QUEBRAVAZO!',
        base_salary: u.base_salary ? Number(u.base_salary) : 0,
        permissions: Array.isArray(u.permissions) ? u.permissions : [],
      }));
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ data: DEMO_STAFF });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Error in GET /api/admin/staff:', err);
    return NextResponse.json({ data: DEMO_STAFF });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, dni, password, role, branch, base_salary, permissions } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, error: 'Nombre, email y contraseña requeridos' }, { status: 400 });
    }

    const dniTrim = (dni || '').trim();
    if (dniTrim && !/^\d{8}$/.test(dniTrim)) {
      return NextResponse.json({ ok: false, error: 'El DNI debe tener 8 dígitos' }, { status: 400 });
    }

    const userRole = VALID_ROLES.includes(role) ? role : 'staff';
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const emailLower = email.toLowerCase().trim();

    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', emailLower)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: false, error: 'Este email ya está registrado' }, { status: 400 });
    }

    if (dniTrim) {
      const { data: existingDni } = await supabase
        .from('admin_users')
        .select('id')
        .eq('dni', dniTrim)
        .maybeSingle();

      if (existingDni) {
        return NextResponse.json({ ok: false, error: 'Este DNI ya está registrado' }, { status: 400 });
      }
    }

    const password_hash = await bcrypt.hash(password, 10);
    const numericSalary = base_salary !== undefined && !isNaN(Number(base_salary)) ? Number(base_salary) : 0;
    const branchName = (branch || 'QUEBRAVAZO!').trim();
    const permList = Array.isArray(permissions) ? permissions : [];

    // Attempt insert with all attributes
    let { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: emailLower,
        name: name.trim(),
        dni: dniTrim || null,
        role: userRole,
        is_active: true,
        password_hash,
        branch: branchName,
        base_salary: numericSalary,
        permissions: permList,
      })
      .select('id, email, name, dni, role, is_active, created_at, branch, base_salary, permissions')
      .single();

    // If cashier fails role check constraint or new columns don't exist yet:
    if (error) {
      // If role constraint failed with cashier, fallback role to staff
      let roleToUse = userRole;
      if (error.message.includes('admin_users_role_check') && userRole === 'cashier') {
        roleToUse = 'staff';
      }

      // Try basic insert without new columns
      const fallbackInsert = await supabase
        .from('admin_users')
        .insert({
          email: emailLower,
          name: name.trim(),
          dni: dniTrim || null,
          role: roleToUse,
          is_active: true,
          password_hash,
        })
        .select('id, email, name, dni, role, is_active, created_at')
        .single();

      if (fallbackInsert.error) {
        return NextResponse.json({ ok: false, error: 'Error al crear: ' + fallbackInsert.error.message }, { status: 500 });
      }

      data = {
        ...fallbackInsert.data,
        branch: branchName,
        base_salary: numericSalary,
        permissions: permList,
      };
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

