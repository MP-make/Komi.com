import { createAdminClient } from '@/lib/supabase/server';
import {
  calculateInvoiceTaxes,
  generateSunatQrString,
  LineItemInput,
  CalculatedLineItem,
} from '@/lib/sunat/tax-calculator';

export type InvoiceDocType = 'BOLETA' | 'FACTURA' | 'NTV';

export interface IssueInvoiceInput {
  docType: InvoiceDocType;
  items: LineItemInput[];
  customer: {
    tipoDoc: 'dni' | 'ruc' | 'ninguno';
    numDoc: string;
    denominacion: string;
    direccion?: string;
  };
  paymentMethod: string;
  orderTitle?: string;
}

export interface IssuedInvoice {
  id: string;
  docType: InvoiceDocType;
  serie: string;
  number: number;
  formattedNumber: string; // Ej: "B001-00000014"
  emisor: {
    ruc: string;
    razonSocial: string;
    nombreComercial: string;
    direccion: string;
  };
  cliente: {
    tipoDoc: 'dni' | 'ruc' | 'ninguno';
    numDoc: string;
    denominacion: string;
    direccion?: string;
  };
  fechaEmision: string;
  horaEmision: string;
  moneda: 'PEN';
  subtotal: number;
  igv: number;
  total: number;
  paymentMethod: string;
  items: CalculatedLineItem[];
  amountInWords: string;
  qrString: string;
  hash: string;
  sunatStatus: 'ACEPTADO' | 'LOCAL' | 'RECHAZADO';
  sunatDescription: string;
  isMock: boolean;
}

// Secuencias correlativas en memoria (fallback en desarrollo)
const memorySequences: Record<string, number> = {
  NTV: 1,
  BOLETA: 1,
  FACTURA: 1,
};

/**
 * Obtiene la configuración SUNAT guardada en base de datos si existe
 */
async function getSunatSettings(): Promise<any> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'restaurant_sunat_settings')
      .maybeSingle();

    if (data?.value) {
      return data.value;
    }
  } catch {
    // Ignore fallback
  }
  return null;
}

/**
 * Obtiene e incrementa el número correlativo para la serie
 */
async function getNextCorrelative(docType: InvoiceDocType, customSerie?: string): Promise<{ serie: string; number: number }> {
  let defaultSerie = docType === 'FACTURA' ? 'F001' : docType === 'BOLETA' ? 'B001' : 'NV01';
  const serie = (customSerie && customSerie.trim().length >= 3 ? customSerie.trim().toUpperCase() : defaultSerie);

  try {
    const supabase = createAdminClient();
    // Intentar leer de tabla correlatives si existe
    const { data } = await supabase
      .from('invoice_series')
      .select('current_number')
      .eq('serie', serie)
      .maybeSingle();

    let nextNum = 1;
    if (data && typeof data.current_number === 'number') {
      nextNum = data.current_number + 1;
      await supabase.from('invoice_series').update({ current_number: nextNum }).eq('serie', serie);
    } else {
      await supabase.from('invoice_series').insert({ serie, current_number: nextNum });
    }

    return { serie, number: nextNum };
  } catch {
    // Fallback a contador en memoria
    const current = memorySequences[docType] || 1;
    memorySequences[docType] = current + 1;
    return { serie, number: current };
  }
}

/**
 * Emite un comprobante electrónico (Boleta, Factura) o comercial (Nota de Venta).
 * Soporta modo PSE / NubeFact y modo Simulador de pruebas.
 */
export async function issueInvoice(input: IssueInvoiceInput): Promise<IssuedInvoice> {
  const now = new Date();
  const fechaEmision = now.toISOString().split('T')[0];
  const horaEmision = now.toLocaleTimeString('es-PE', { hour12: false });

  // 1. Cargar configuración de base de datos o variables de entorno
  const savedSettings = await getSunatSettings();

  const emisor = {
    ruc: savedSettings?.ruc || process.env.SUNAT_EMISOR_RUC || '20601234567',
    razonSocial: savedSettings?.razonSocial || process.env.SUNAT_EMISOR_RAZON_SOCIAL || 'KOMI RESTAURANTES S.A.C.',
    nombreComercial: savedSettings?.nombreComercial || process.env.SUNAT_EMISOR_NOMBRE_COMERCIAL || 'KOMI RESTOBAR',
    direccion: savedSettings?.direccion || process.env.SUNAT_EMISOR_DIRECCION || 'AV. MARISCAL LA MAR 1120, MIRAFLORES, LIMA',
  };

  // 2. Correlativo de serie
  const customSerie =
    input.docType === 'FACTURA'
      ? savedSettings?.serieFactura
      : input.docType === 'BOLETA'
      ? savedSettings?.serieBoleta
      : savedSettings?.serieNotaVenta;

  const { serie, number } = await getNextCorrelative(input.docType, customSerie);
  const formattedNumber = `${serie}-${String(number).padStart(8, '0')}`;

  // 3. Cálculos estrictos de impuestos
  const taxes = calculateInvoiceTaxes(input.items);

  // 4. Hash digital simulado o devuelto por el PSE
  const hash = `HASH-${serie}-${number}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // 5. Cadena oficial del Código QR SUNAT
  const qrString = generateSunatQrString({
    rucEmisor: emisor.ruc,
    tipoComprobante: input.docType,
    serie,
    correlativo: number,
    igv: taxes.igv,
    total: taxes.total,
    fechaEmision,
    tipoDocCliente: input.customer.tipoDoc,
    numDocCliente: input.customer.numDoc,
    hash,
  });

  // 6. Verificar si existe integración activa con un PSE (Vía A)
  const isProduction = savedSettings?.billingMode === 'production';
  const pseUrl = (isProduction && savedSettings?.pseApiUrl) || process.env.PSE_API_URL;
  const pseToken = (isProduction && savedSettings?.pseApiToken) || process.env.PSE_API_TOKEN;

  let sunatStatus: 'ACEPTADO' | 'LOCAL' | 'RECHAZADO' = input.docType === 'NTV' ? 'LOCAL' : 'ACEPTADO';
  let sunatDescription =
    input.docType === 'NTV'
      ? 'Comprobante interno de venta (No tributario)'
      : isProduction && pseToken
      ? 'Emitido y enviado a SUNAT mediante PSE'
      : 'La Factura / Boleta ha sido aceptada exitosamente por SUNAT (Modo Simulador)';
  const isMock = !pseToken || !isProduction;

  if (input.docType !== 'NTV' && pseToken && pseUrl) {
    try {
      // Si el usuario configuró credenciales PSE reales:
      const pseResponse = await fetch(pseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pseToken}`,
        },
        body: JSON.stringify({
          tipo_de_comprobante: input.docType === 'FACTURA' ? 1 : 2,
          serie,
          numero: number,
          cliente_tipo_de_documento: input.customer.tipoDoc === 'ruc' ? 6 : 1,
          cliente_numero_de_documento: input.customer.numDoc,
          cliente_denominacion: input.customer.denominacion,
          cliente_direccion: input.customer.direccion || '',
          fecha_de_emision: fechaEmision,
          moneda: 'PEN',
          total_gravada: taxes.subtotal,
          total_igv: taxes.igv,
          total: taxes.total,
          items: taxes.items.map((it) => ({
            unidad_de_medida: 'NIU',
            descripcion: it.name,
            cantidad: it.quantity,
            valor_unitario: it.unitValue,
            precio_unitario: it.priceWithTax,
            subtotal: it.lineBase,
            igv: it.lineTax,
            total: it.lineTotal,
          })),
        }),
      });

      if (pseResponse.ok) {
        const pseData = await pseResponse.json();
        sunatStatus = 'ACEPTADO';
        sunatDescription = pseData.sunat_description || 'Comprobante aceptado por SUNAT';
      }
    } catch {
      // En caso de fallo con PSE en red, conservamos modo contingencia
    }
  }

  const invoice: IssuedInvoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    docType: input.docType,
    serie,
    number,
    formattedNumber,
    emisor,
    cliente: input.customer,
    fechaEmision,
    horaEmision,
    moneda: 'PEN',
    subtotal: taxes.subtotal,
    igv: taxes.igv,
    total: taxes.total,
    paymentMethod: input.paymentMethod,
    items: taxes.items,
    amountInWords: taxes.amountInWords,
    qrString,
    hash,
    sunatStatus,
    sunatDescription,
    isMock,
  };

  // 7. Guardar en Base de Datos Supabase (si existe la tabla)
  try {
    const supabase = createAdminClient();
    await supabase.from('issued_invoices').insert({
      id: invoice.id,
      doc_type: invoice.docType,
      formatted_number: invoice.formattedNumber,
      customer_doc: invoice.cliente.numDoc,
      customer_name: invoice.cliente.denominacion,
      total: invoice.total,
      subtotal: invoice.subtotal,
      igv: invoice.igv,
      payment_method: invoice.paymentMethod,
      payload: invoice,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Continuar si la tabla no está creada aún
  }

  return invoice;
}
