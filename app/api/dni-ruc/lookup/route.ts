import { NextRequest, NextResponse } from 'next/server';
import { queryDocument, DocumentType } from '@/lib/services/dni-ruc.service';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  // Rate limiting por IP o identificador
  const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
  const { allowed, remaining } = rateLimit(`dni-ruc:${ip}`, 30, 60000); // 30 consultas por minuto
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Demasiadas consultas. Por favor espera un minuto.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') as DocumentType | null;
  const number = searchParams.get('number');

  if (!type || (type !== 'dni' && type !== 'ruc')) {
    return NextResponse.json(
      { success: false, error: 'El parámetro "type" es obligatorio y debe ser "dni" o "ruc".' },
      { status: 400 }
    );
  }

  if (!number) {
    return NextResponse.json(
      { success: false, error: 'El parámetro "number" es obligatorio.' },
      { status: 400 }
    );
  }

  try {
    const data = await queryDocument(type, number);
    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'X-RateLimit-Remaining': String(remaining),
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido al consultar el documento';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
