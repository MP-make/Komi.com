/**
 * Utilidades matemáticas y tributarias reglamentarias de SUNAT para emisión de comprobantes.
 */

export interface LineItemInput {
  id?: string;
  name: string;
  price: number; // Precio unitario con IGV incluido
  quantity: number;
}

export interface CalculatedLineItem {
  id?: string;
  name: string;
  quantity: number;
  priceWithTax: number;
  unitValue: number; // Valor unitario sin IGV
  lineBase: number;  // Subtotal sin IGV (Base Imponible de la línea)
  lineTax: number;   // Monto de IGV de la línea
  lineTotal: number; // Importe Total de la línea
}

export interface InvoiceTotals {
  subtotal: number; // Total Base Imponible (Op. Gravada)
  igv: number;      // Total IGV (18%)
  total: number;    // Importe Total a Pagar
  items: CalculatedLineItem[];
  amountInWords: string;
}

/**
 * Redondeo aritmético a 2 decimales estándar SUNAT
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula los importes tributarios de un pedido según la regla SUNAT:
 * Base = Total / 1.18, IGV = Total - Base
 */
export function calculateInvoiceTaxes(items: LineItemInput[]): InvoiceTotals {
  const calculatedItems: CalculatedLineItem[] = items.map((item) => {
    const lineTotal = round2(item.price * item.quantity);
    const lineBase = round2(lineTotal / 1.18);
    const lineTax = round2(lineTotal - lineBase);
    const unitValue = item.quantity > 0 ? Number((lineBase / item.quantity).toFixed(4)) : 0;

    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      priceWithTax: item.price,
      unitValue,
      lineBase,
      lineTax,
      lineTotal,
    };
  });

  const subtotal = round2(calculatedItems.reduce((acc, item) => acc + item.lineBase, 0));
  const igv = round2(calculatedItems.reduce((acc, item) => acc + item.lineTax, 0));
  const total = round2(subtotal + igv);

  return {
    subtotal,
    igv,
    total,
    items: calculatedItems,
    amountInWords: numberToSolesWords(total),
  };
}

/**
 * Genera la cadena oficial reglamentaria exigida por SUNAT para el Código QR
 * Formato: RUC_EMISOR|TIPO_DOC|SERIE|NUMERO|IGV|TOTAL|FECHA|TIPO_DOC_CLI|NUM_DOC_CLI|HASH
 */
export function generateSunatQrString(params: {
  rucEmisor: string;
  tipoComprobante: 'BOLETA' | 'FACTURA' | 'NTV';
  serie: string;
  correlativo: number | string;
  igv: number;
  total: number;
  fechaEmision: string; // YYYY-MM-DD
  tipoDocCliente: 'dni' | 'ruc' | 'ninguno';
  numDocCliente: string;
  hash?: string;
}): string {
  const tipoDocCode =
    params.tipoComprobante === 'FACTURA' ? '01' : params.tipoComprobante === 'BOLETA' ? '03' : 'NV';

  const tipoClienteCode =
    params.tipoDocCliente === 'ruc' ? '6' : params.tipoDocCliente === 'dni' ? '1' : '0';

  const padCorrelativo = String(params.correlativo).padStart(8, '0');
  const digest = params.hash || 'MOCK-HASH-SUNAT-V1';

  return [
    params.rucEmisor,
    tipoDocCode,
    params.serie,
    padCorrelativo,
    params.igv.toFixed(2),
    params.total.toFixed(2),
    params.fechaEmision,
    tipoClienteCode,
    params.numDocCliente || '-',
    digest,
  ].join('|');
}

/**
 * Convierte un número a texto en Soles (Requisito legal en tickets de venta)
 * Ej: 118.50 -> "SON: CIENTO DIECIOCHO CON 50/100 SOLES"
 */
export function numberToSolesWords(amount: number): string {
  const cents = Math.round((amount % 1) * 100);
  const integer = Math.floor(amount);
  const words = integerToWords(integer);
  const centsStr = String(cents).padStart(2, '0');
  return `SON: ${words} CON ${centsStr}/100 SOLES`;
}

function integerToWords(num: number): string {
  if (num === 0) return 'CERO';
  if (num < 0) return `MENOS ${integerToWords(Math.abs(num))}`;

  const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const tens = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  if (num === 100) return 'CIEN';
  if (num < 10) return units[num];
  if (num < 20) return teens[num - 10];
  if (num < 30) {
    return num === 20 ? 'VEINTE' : `VEINTI${units[num - 20]}`;
  }
  if (num < 100) {
    const unit = num % 10;
    return `${tens[Math.floor(num / 10)]}${unit > 0 ? ` Y ${units[unit]}` : ''}`;
  }
  if (num < 1000) {
    const remainder = num % 100;
    return `${hundreds[Math.floor(num / 100)]}${remainder > 0 ? ` ${integerToWords(remainder)}` : ''}`;
  }
  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    const prefix = thousands === 1 ? 'MIL' : `${integerToWords(thousands)} MIL`;
    return `${prefix}${remainder > 0 ? ` ${integerToWords(remainder)}` : ''}`;
  }

  const millions = Math.floor(num / 1000000);
  const remainder = num % 1000000;
  const prefix = millions === 1 ? 'UN MILLON' : `${integerToWords(millions)} MILLONES`;
  return `${prefix}${remainder > 0 ? ` ${integerToWords(remainder)}` : ''}`;
}
