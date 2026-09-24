-- =====================================================
-- MIGRACIÓN MULTI-TENANT SAAS PARA RESTAURANTES
-- Permite que la plataforma soporte N restaurantes independientes
-- =====================================================

-- 1. TABLA PRINCIPAL DE RESTAURANTES (TENANTS)
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,                       -- Subdominio o identificador único (ej: 'quebravazo', 'lapiccanteria')
  domain TEXT UNIQUE,                              -- Dominio personalizado opcional (ej: 'pedidos.micomidafavorita.com')
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#ea580c',
  plan TEXT DEFAULT 'pro' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  settings JSONB DEFAULT '{
    "allow_delivery": true,
    "allow_dine_in": true,
    "currency": "PEN",
    "currency_symbol": "S/",
    "tax_rate": 0.18,
    "yape_number": "",
    "yape_holder": "",
    "tables_count": 20
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para updated_at en restaurants
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_restaurants_updated_at ON restaurants;
CREATE TRIGGER set_restaurants_updated_at
  BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- 2. REGISTRO DEL PRIMER TENANT POR DEFECTO (RESTAURANTE BANDERA)
INSERT INTO restaurants (name, slug, phone, email, plan, settings)
VALUES (
  '¡Qué Bravazo! Restobar',
  'quebravazo',
  '987654321',
  'contacto@quebravazo.pe',
  'pro',
  '{
    "allow_delivery": true,
    "allow_dine_in": true,
    "currency": "PEN",
    "currency_symbol": "S/",
    "tax_rate": 0.18,
    "tables_count": 20
  }'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- 3. ASOCIAR TABLAS EXISTENTES AL TENANT CORRESPONDIENTE
DO $$
DECLARE
  v_default_restaurant_id UUID;
BEGIN
  SELECT id INTO v_default_restaurant_id FROM restaurants WHERE slug = 'quebravazo' LIMIT 1;

  -- Categorías
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='restaurant_id') THEN
    ALTER TABLE categories ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    UPDATE categories SET restaurant_id = v_default_restaurant_id WHERE restaurant_id IS NULL;
  END IF;

  -- Productos / Mapeos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_mappings' AND column_name='restaurant_id') THEN
    ALTER TABLE product_mappings ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    UPDATE product_mappings SET restaurant_id = v_default_restaurant_id WHERE restaurant_id IS NULL;
  END IF;

  -- Horarios de Menú
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_schedules' AND column_name='restaurant_id') THEN
    ALTER TABLE menu_schedules ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    UPDATE menu_schedules SET restaurant_id = v_default_restaurant_id WHERE restaurant_id IS NULL;
  END IF;

  -- Media / Banners
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='media' AND column_name='restaurant_id') THEN
    ALTER TABLE media ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    UPDATE media SET restaurant_id = v_default_restaurant_id WHERE restaurant_id IS NULL;
  END IF;

  -- Usuarios Administrativos / Personal
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admin_users' AND column_name='restaurant_id') THEN
    ALTER TABLE admin_users ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    UPDATE admin_users SET restaurant_id = v_default_restaurant_id WHERE restaurant_id IS NULL;
  END IF;

  -- Configuraciones locales
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='restaurant_id') THEN
    ALTER TABLE site_settings ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
    UPDATE site_settings SET restaurant_id = v_default_restaurant_id WHERE restaurant_id IS NULL;
  END IF;
END $$;

-- 4. ÍNDICES DE RENDIMIENTO MULTI-TENANT
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_product_mappings_restaurant ON product_mappings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_schedules_restaurant ON menu_schedules(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_restaurant ON admin_users(restaurant_id);
