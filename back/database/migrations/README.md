# Migraciones de Base de Datos

Este directorio contiene scripts de migración SQL para actualizar bases de datos existentes del sistema WMS.

## Cómo Ejecutar Migraciones

### Para Windows (PowerShell o CMD)

```bash
psql -U postgres -d wms_db -f migrations\001_add_colombia_timezone.sql
```

### Para Linux/Mac

```bash
psql -U postgres -d wms_db -f migrations/001_add_colombia_timezone.sql
```

## Migraciones Disponibles

### 001_add_colombia_timezone.sql
**Fecha:** 2025-12-20
**Descripción:** Configura la zona horaria de Colombia (UTC-5) y agrega función helper `now_colombia()`

**Características:**
- Establece la zona horaria a 'America/Bogota'
- Crea función `now_colombia()` para obtener la hora actual de Colombia
- Compatible con bases de datos existentes

**Importante:** Esta migración NO modifica datos existentes. Solo agrega funciones helper y establece la zona horaria para nuevas conexiones.

## Orden de Ejecución

Las migraciones deben ejecutarse en orden numérico ascendente (001, 002, 003, etc.)

## Notas Importantes

- **Zona Horaria:** Todas las fechas y horas se registran en hora de Colombia (UTC-5)
- **Configuración del Backend:** El archivo `src/config/db.js` ya está configurado para establecer automáticamente la zona horaria en cada conexión
- **Sin Cambio de Datos:** Estas migraciones no modifican registros existentes, solo configuran el comportamiento futuro
