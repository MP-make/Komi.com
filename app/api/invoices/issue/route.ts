import { NextRequest, NextResponse } from 'next/server';
import { issueInvoice, IssueInvoiceInput } from '@/lib/services/billing.service';

export async function POST(req: NextRequest) {
  try {
    const body: IssueInvoiceInput = await req.json();

    // 1. Validaciones básicas
    if (!body.docType || !['BOLETA', 'FACTURA', 'NTV'].includes(body.docType)) {
      return NextResponse.json(
        { success: false, error: 'El tipo de comprobante debe ser "BOLETA", "FACTURA" o "NTV".' },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'El comprobante debe contener al menos un producto o ítem.' },
        { status: 400 }
      );
    }

    // 2. Validaciones tributarias según el tipo
    if (body.docType === 'FACTURA') {
      const cleanRuc = (body.customer?.numDoc || '').trim().replace(/\D/g, '');
      if (cleanRuc.length !== 11) {
        return NextResponse.json(
          { success: false, error: 'Para emitir Factura Electrónica es obligatorio un RUC válido de 11 dígitos.' },
          { status: 400 }
        );
      }
      if (!body.customer?.denominacion || body.customer.denominacion.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: 'La Razón Social del cliente es obligatoria para emitir Factura.' },
          { status: 400 }
        );
      }
    }

    const invoice = await issueInvoice(body);

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al emitir el comprobante';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
