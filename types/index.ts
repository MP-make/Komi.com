// types/index.ts

// Los 3 modos de operación de tu app
export type AppMode = 'delivery' | 'waiter' | 'menu';

export interface Product {
  id: string;
  sku?: string;        // Código SKU del producto (ej: 'HAMB-005')
  title: string;       // Nombre del plato o producto
  price: number;
  image: string;       // URL de la imagen del producto
  category: string;
  category_slug?: string; // Slug de la categoría local mapeada
  description?: string;
  stock: number;
  featured?: boolean;  // Producto destacado
  isMenuDelDia?: boolean; // Si es parte del menú del día
  minPrice?: number;   // Precio mínimo permitido para descuentos
  is_active?: boolean; // Si el producto está activo en el panel admin
}

export interface CartItem extends Product {
  quantity: number;
  notes?: string;      // Ej: "Sin mayonesa" (Importante para meseros/delivery)
}

// Estructura para registrar el pedido
export interface OrderPayload {
  customer: {
    name: string;
    email?: string;
    phone: string;
    address?: string;
  };
  tableNumber?: string; // Exclusivo para modo 'waiter'
  notes?: string;       // Notas generales + info de pago
  paymentMethod?: string; // 'Efectivo', 'Yape', 'Plin', etc.
  type?: 'DELIVERY' | 'DINE_IN';
  items: {
    id: string;
    title: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  total: number;
}

// Modelos Multi-Tenant SaaS
export type SaaSPlan = 'starter' | 'pro' | 'enterprise';

export interface RestaurantTenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo_url?: string;
  banner_url?: string;
  primary_color?: string;
  plan: SaaSPlan;
  status: 'active' | 'suspended' | 'trial';
  trial_ends_at?: string;
  settings?: {
    allow_delivery?: boolean;
    allow_dine_in?: boolean;
    currency?: string;
    currency_symbol?: string;
    tax_rate?: number;
    yape_number?: string;
    yape_holder?: string;
    tables_count?: number;
  };
  created_at?: string;
}

export interface RestaurantTable {
  id: string;
  number: string;
  label: string;
  capacity: number;
  zone: string;
  is_active: boolean;
}

export interface TablesConfig {
  total_tables: number;
  default_capacity: number;
  tables: RestaurantTable[];
}
