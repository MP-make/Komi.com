// lib/api/products.ts
import { Product, OrderPayload } from '@/types';

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch('/api/products', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const createProduct = async (productData: Partial<Product> & { category_id?: string; menu_types?: string[] }) => {
  const response = await fetch('/api/admin/product-mappings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Error al crear el producto');
  }

  return response.json();
};

export const updateProduct = async (id: string, productData: Record<string, any>) => {
  const response = await fetch(`/api/admin/product-mappings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Error al actualizar el producto');
  }

  return response.json();
};

export const deleteProduct = async (id: string) => {
  const response = await fetch(`/api/admin/product-mappings/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Error al eliminar el producto');
  }

  return response.json();
};

export const createOrder = async (payload: OrderPayload): Promise<any> => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'No se pudo registrar el pedido');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
