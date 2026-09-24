-- Migración para soportar todos los campos del formulario avanzado de productos
ALTER TABLE product_mappings
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS suggested_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS barcode TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;
