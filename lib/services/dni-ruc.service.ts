import { createAdminClient } from '@/lib/supabase/server';

export type DocumentType = 'dni' | 'ruc';

export interface DocumentResult {
  type: DocumentType;
  number: string;
  name: string;
  address?: string;
  ubigeo?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  estado?: string;     // ej: "ACTIVO" (solo RUC)
  condicion?: string;  // ej: "HABIDO" (solo RUC)
  isMock?: boolean;
  cached?: boolean;
}

// In-memory cache de respaldo (30 días de TTL)
const inMemoryCache = new Map<string, { result: DocumentResult; cachedAt: number }>();
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Lista de nombres y empresas realistas para el Simulador Mock
const MOCK_DNI_FIRST_NAMES = ['CARLOS EDUARDO', 'MARIA ELENA', 'JORGE LUIS', 'ANA PATRICIA', 'LUIS ALBERTO', 'ROSA ISABEL', 'DIEGO ARMANDO', 'VALERIA SOFIA'];
const MOCK_DNI_LAST_NAMES = ['QUISPE MAMANI', 'RODRIGUEZ FLORES', 'GARCIA MENDOZA', 'FLORES HUAMAN', 'SANCHEZ ROJAS', 'CHAVEZ CASTILLO', 'TORRES SILVA'];

const MOCK_RUC_COMPANIES = [
  'INVERSIONES Y SERVICIOS GASTRONOMICOS S.A.C.',
  'CORPORACION ALIMENTARIA DEL PERU E.I.R.L.',
  'DISTRIBUIDORA DE BEBIDAS Y ABARROTES LIMA S.A.C.',
  'COMERCIALIZADORA EL BUEN SABOR S.R.L.',
  'GRUPO EMPRESARIAL ANDINO S.A.C.',
  'RESTAURANTES Y EVENTOS PREMIUM E.I.R.L.',
];

const MOCK_DISTRICTS = [
  { distrito: 'MIRAFLORES', provincia: 'LIMA', departamento: 'LIMA', ubigeo: '150122' },
  { distrito: 'SANTIAGO DE SURCO', provincia: 'LIMA', departamento: 'LIMA', ubigeo: '150140' },
  { distrito: 'SAN ISIDRO', provincia: 'LIMA', departamento: 'LIMA', ubigeo: '150131' },
  { distrito: 'MAGDALENA DEL MAR', provincia: 'LIMA', departamento: 'LIMA', ubigeo: '150120' },
  { distrito: 'LOS OLIVOS', provincia: 'LIMA', departamento: 'LIMA', ubigeo: '150117' },
];

/**
 * Genera datos simulados congruentes con el número ingresado
 */
function generateMockData(type: DocumentType, number: string): DocumentResult {
  const seed = number.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const loc = MOCK_DISTRICTS[seed % MOCK_DISTRICTS.length];

  if (type === 'dni') {
    const fn = MOCK_DNI_FIRST_NAMES[seed % MOCK_DNI_FIRST_NAMES.length];
    const ln = MOCK_DNI_LAST_NAMES[seed % MOCK_DNI_LAST_NAMES.length];
    return {
      type: 'dni',
      number,
      name: `${fn} ${ln}`,
      address: `AV. PRINCIPAL ${100 + (seed % 800)}, DPTO ${101 + (seed % 400)}`,
      ubigeo: loc.ubigeo,
      distrito: loc.distrito,
      provincia: loc.provincia,
      departamento: loc.departamento,
      isMock: true,
    };
  } else {
    const comp = MOCK_RUC_COMPANIES[seed % MOCK_RUC_COMPANIES.length];
    return {
      type: 'ruc',
      number,
      name: comp,
      address: `CALLE LOS COMERCIANTES ${200 + (seed % 700)}, PISO ${1 + (seed % 8)}`,
      ubigeo: loc.ubigeo,
      distrito: loc.distrito,
      provincia: loc.provincia,
      departamento: loc.departamento,
      estado: 'ACTIVO',
      condicion: 'HABIDO',
      isMock: true,
    };
  }
}

/**
 * Consulta un DNI (8 dígitos) o RUC (11 dígitos).
 * Soporta Caché en memoria + Supabase, Mock Simulator automático y Proveedor Real (APIsPerú / Decolecta).
 */
export async function queryDocument(type: DocumentType, number: string): Promise<DocumentResult> {
  const cleanNumber = number.trim().replace(/\D/g, '');

  // 1. Validaciones de formato
  if (type === 'dni' && cleanNumber.length !== 8) {
    throw new Error('El DNI debe tener exactamente 8 dígitos numéricos.');
  }
  if (type === 'ruc' && cleanNumber.length !== 11) {
    throw new Error('El RUC debe tener exactamente 11 dígitos numéricos.');
  }

  const cacheKey = `${type}:${cleanNumber}`;

  // 2. Verificar caché en memoria
  const memCached = inMemoryCache.get(cacheKey);
  if (memCached && Date.now() - memCached.cachedAt < CACHE_TTL_MS) {
    return { ...memCached.result, cached: true };
  }

  // 3. Verificar caché en Supabase (si está configurado)
  try {
    const supabase = createAdminClient();
    const { data: dbCached } = await supabase
      .from('document_lookups')
      .select('result, cached_at')
      .eq('key', cacheKey)
      .maybeSingle();

    if (dbCached && dbCached.result) {
      const age = Date.now() - new Date(dbCached.cached_at).getTime();
      if (age < CACHE_TTL_MS) {
        inMemoryCache.set(cacheKey, { result: dbCached.result, cachedAt: Date.now() });
        return { ...dbCached.result, cached: true };
      }
    }
  } catch {
    // Si la tabla no existe o falla Supabase, continuamos sin romper el flujo
  }

  // 4. ¿Hay Token de proveedor configurado?
  const apiToken = process.env.DNI_RUC_API_TOKEN;
  const apiBase = process.env.DNI_RUC_API_BASE || 'https://dniruc.apisperu.com/api/v1';

  if (!apiToken) {
    // MODO SIMULADOR ACTIVO
    const mockResult = generateMockData(type, cleanNumber);
    inMemoryCache.set(cacheKey, { result: mockResult, cachedAt: Date.now() });
    return mockResult;
  }

  // 5. Llamada al proveedor real con timeout de 8 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `${apiBase}/${type}/${cleanNumber}?token=${encodeURIComponent(apiToken)}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`El ${type.toUpperCase()} no fue encontrado en el padrón oficial.`);
      }
      throw new Error(`El proveedor de identidad respondió con error (${res.status}).`);
    }

    const raw = await res.json();
    let result: DocumentResult;

    if (type === 'dni') {
      const fullName =
        raw.nombre_completo ||
        raw.nombreCompleto ||
        [raw.nombres, raw.apellidoPaterno || raw.apellido_paterno, raw.apellidoMaterno || raw.apellido_materno]
          .filter(Boolean)
          .join(' ');

      if (!fullName) throw new Error('No se encontraron nombres asociados al DNI.');

      result = {
        type: 'dni',
        number: cleanNumber,
        name: fullName.trim(),
        address: raw.direccion || raw.domicilio || '',
        ubigeo: raw.ubigeo || '',
        distrito: raw.distrito || '',
        provincia: raw.provincia || '',
        departamento: raw.departamento || '',
        isMock: false,
      };
    } else {
      const razonSocial = raw.razonSocial || raw.razon_social || raw.nombre;
      if (!razonSocial) throw new Error('No se encontró razón social asociada al RUC.');

      result = {
        type: 'ruc',
        number: cleanNumber,
        name: razonSocial.trim(),
        address: raw.direccion || raw.domicilioFiscal || raw.direccion_completa || '',
        ubigeo: raw.ubigeo || raw.ubigeo_sunat || '',
        distrito: raw.distrito || '',
        provincia: raw.provincia || '',
        departamento: raw.departamento || '',
        estado: (raw.estado || 'ACTIVO').toUpperCase(),
        condicion: (raw.condicion || 'HABIDO').toUpperCase(),
        isMock: false,
      };
    }

    // 6. Guardar en caché
    inMemoryCache.set(cacheKey, { result, cachedAt: Date.now() });

    try {
      const supabase = createAdminClient();
      await supabase.from('document_lookups').upsert({
        key: cacheKey,
        type,
        number: cleanNumber,
        result,
        cached_at: new Date().toISOString(),
      });
    } catch {
      // Ignorar si falla la persistencia en tabla
    }

    return result;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado al consultar RENIEC/SUNAT (Timeout).');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
