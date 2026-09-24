import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    try {
      const supabase = createAdminClient();

      // Verificar si hay usuario staff/admin disponible para asociar
      const { data: users } = await supabase
        .from('admin_users')
        .select('id, name')
        .limit(1);

      const defaultUserId = users?.[0]?.id || '00000000-0000-0000-0000-000000000001';
      const defaultUserName = users?.[0]?.name || 'Sistema Web';

      const orderRecord = {
        waiter_id: defaultUserId,
        waiter_name: payload.customer?.name || defaultUserName,
        table_number: payload.tableNumber || (payload.type === 'DELIVERY' ? 'Delivery' : 'Web'),
        order_type: payload.type === 'DELIVERY' ? 'llevar' : 'mesa',
        items: payload.items || [],
        subtotal: payload.total || 0,
        takeaway_charge: 0,
        total: payload.total || 0,
        status: 'pending',
        payment_method: (payload.paymentMethod || 'efectivo').toLowerCase().includes('yape') ? 'yape' : 'efectivo',
        payment_status: 'pending',
      };

      await supabase.from('waiter_orders').insert([orderRecord]);
    } catch (dbErr) {
      console.warn('Note: Could not insert to waiter_orders, continuing with memory orderId:', dbErr);
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Pedido registrado con éxito',
      total: payload.total,
    }, { status: 200 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Error interno del servidor al procesar pedido' }, { status: 500 });
  }
}