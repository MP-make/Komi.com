"use client";

import { useState, useCallback } from 'react';
import type { DocumentResult, DocumentType } from '@/lib/services/dni-ruc.service';

export function useDniRucLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DocumentResult | null>(null);

  const lookup = useCallback(async (type: DocumentType, number: string): Promise<DocumentResult | null> => {
    const cleanNumber = number.trim().replace(/\D/g, '');

    if (type === 'dni' && cleanNumber.length !== 8) {
      const err = 'El DNI debe tener 8 dígitos';
      setError(err);
      return null;
    }
    if (type === 'ruc' && cleanNumber.length !== 11) {
      const err = 'El RUC debe tener 11 dígitos';
      setError(err);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/dni-ruc/lookup?type=${type}&number=${cleanNumber}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Error al consultar documento');
      }

      setData(json.data);
      return json.data as DocumentResult;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar documento';
      setError(msg);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { lookup, loading, error, data, clear };
}
