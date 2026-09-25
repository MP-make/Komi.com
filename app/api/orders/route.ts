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

      const customerName = payload.customer?.name || payload.customerName || defaultUserName;
      const customerPhone = payload.customer?.phone || payload.phone || '';
      const address = payload.customer?.address || payload.address || '';
      const customNotes = payload.notes || '';
      
      const fullNotes = [
        customerPhone ? `Tel: ${customerPhone}` : '',
        address ? `Dirección: ${address}` : '',
        customNotes ? `Notas: ${customNotes}` : ''
      ].filter(Boolean).join(' | ');

      const orderRecord = {
        waiter_id: defaultUserId,
        waiter_name: customerName,
        table_number: payload.tableNumber || (payload.type === 'DELIVERY' ? 'Delivery' : (payload.type === 'LLEVAR' ? 'Para Llevar' : 'Web')),
        order_type: payload.type === 'DELIVERY' ? 'delivery' : (payload.type === 'LLEVAR' ? 'llevar' : 'mesa'),
        items: payload.items || [],
        subtotal: payload.subtotal || payload.total || 0,
        takeaway_charge: payload.taperCost !== undefined ? payload.taperCost : (payload.takeaway_charge !== undefined ? payload.takeaway_charge : 0),
        total: payload.total || 0,
        status: 'pending',
        payment_method: (payload.paymentMethod || 'efectivo').toLowerCase().includes('yape')
          ? 'yape'
          : (payload.paymentMethod || '').toLowerCase().includes('plin')
          ? 'plin'
          : (payload.paymentMethod || 'efectivo'),
        payment_status: 'pending',
        notes: fullNotes,
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