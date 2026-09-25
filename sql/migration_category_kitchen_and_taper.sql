-- =====================================================================
-- MIGRACIÓN: Táper para llevar (+S/1.00) y Enrutamiento a Cocina (KDS)
-- Permite configurar por categoría:
-- 1. charges_taper: Si los platos de la categoría cobran táper (+S/1.00)
-- 2. send_to_kitchen: Si se envían a KDS cocina o son venta directa en barra
-- =====================================================================

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS charges_taper BOOLEAN DEFAULT true;

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS send_to_kitchen BOOLEAN DEFAULT true;

-- Por defecto las bebidas y refrescos no cobran táper ni van a cocina
UPDATE categories 
SET charges_taper = false, send_to_kitchen = false 
WHERE LOWER(name) LIKE '%bebida%' 
   OR LOWER(name) LIKE '%gaseosa%' 
   OR LOWER(name) LIKE '%cerveza%' 
   OR LOWER(name) LIKE '%trago%' 
   OR LOWER(name) LIKE '%coctel%' 
   OR LOWER(name) LIKE '%jugo%' 
   OR LOWER(name) LIKE '%agua%' 
   OR LOWER(name) LIKE '%vino%';
