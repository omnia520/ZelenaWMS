-- Tabla de Proveedores
CREATE TABLE IF NOT EXISTS public.proveedores (
  proveedor_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre        VARCHAR(200) NOT NULL,
  nit           VARCHAR(50),
  contacto      VARCHAR(100),
  telefono      VARCHAR(50),
  email         VARCHAR(120),
  direccion     TEXT,
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  tolerancia_porcentaje NUMERIC(5,2) DEFAULT 0.00,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evita duplicados por nombre (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS ux_proveedores_nombre
  ON public.proveedores (lower(nombre));

-- Trigger para actualizar actualizado_en automáticamente
CREATE OR REPLACE FUNCTION update_proveedores_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_proveedores_actualizado_en
    BEFORE UPDATE ON public.proveedores
    FOR EACH ROW
    EXECUTE FUNCTION update_proveedores_actualizado_en();

-- Índice adicional para búsquedas por NIT
CREATE INDEX IF NOT EXISTS idx_proveedores_nit ON public.proveedores(nit);

-- Índice para filtrar proveedores activos
CREATE INDEX IF NOT EXISTS idx_proveedores_activo ON public.proveedores(activo);
