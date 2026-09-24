// lib/tenant.ts
import { RestaurantTenant } from '@/types';

// Tenant por defecto para demostración y retrocompatibilidad
export const DEFAULT_TENANT: RestaurantTenant = {
  id: '00000000-0000-0000-0000-000000000001',
  name: '¡Qué Bravazo! Restobar',
  slug: 'quebravazo',
  phone: '987654321',
  email: 'contacto@quebravazo.pe',
  address: 'Av. Las Brisas 450, Lima',
  logo_url: '/icon.jpg',
  primary_color: '#ea580c',
  plan: 'pro',
  status: 'active',
  settings: {
    allow_delivery: true,
    allow_dine_in: true,
    currency: 'PEN',
    currency_symbol: 'S/',
    tax_rate: 0.18,
    tables_count: 20,
  },
};

// Lista de restaurantes demo para el ecosistema multi-tenant
export const DEMO_TENANTS: RestaurantTenant[] = [
  DEFAULT_TENANT,
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'La Picantería Criolla',
    slug: 'lapicanteria',
    phone: '912345678',
    email: 'hola@lapicanteria.pe',
    address: 'Calle Tradición 120, Arequipa',
    logo_url: '',
    primary_color: '#b91c1c',
    plan: 'enterprise',
    status: 'active',
    settings: {
      allow_delivery: true,
      allow_dine_in: true,
      currency: 'PEN',
      currency_symbol: 'S/',
      tax_rate: 0.18,
      tables_count: 35,
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Fuego & Smash Burgers',
    slug: 'fuegosmash',
    phone: '998877665',
    email: 'burger@fuegosmash.com',
    address: 'Av. Larco 820, Miraflores',
    logo_url: '',
    primary_color: '#eab308',
    plan: 'starter',
    status: 'active',
    settings: {
      allow_delivery: true,
      allow_dine_in: false,
      currency: 'PEN',
      currency_symbol: 'S/',
      tax_rate: 0.18,
      tables_count: 8,
    },
  },
];

export function getTenantBySlug(slug: string): RestaurantTenant {
  return DEMO_TENANTS.find((t) => t.slug === slug) || DEFAULT_TENANT;
}
