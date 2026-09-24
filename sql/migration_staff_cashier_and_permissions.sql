-- Migración para soporte de Cajeros, Sucursales, Sueldo Base y Permisos Granulares
ALTER TABLE IF EXISTS admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE IF EXISTS admin_users ADD CONSTRAINT admin_users_role_check CHECK (role IN ('admin', 'superadmin', 'staff', 'chef', 'owner', 'cashier'));

ALTER TABLE IF EXISTS admin_users ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'QUEBRAVAZO!';
ALTER TABLE IF EXISTS admin_users ADD COLUMN IF NOT EXISTS base_salary NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE IF EXISTS admin_users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;
