@echo off
echo ================================================
echo Insertando datos de prueba en la base de datos
echo ================================================
echo.

REM Ajusta la ruta de PostgreSQL según tu instalación
REM Rutas comunes:
REM - "C:\Program Files\PostgreSQL\15\bin\psql.exe"
REM - "C:\Program Files\PostgreSQL\14\bin\psql.exe"
REM - "C:\Program Files\PostgreSQL\13\bin\psql.exe"

SET PSQL_PATH="C:\Program Files\PostgreSQL\15\bin\psql.exe"

REM Si tienes PostgreSQL en otra ruta, modifica la línea anterior

echo Conectando a la base de datos wms_db...
echo Usuario: postgres
echo.

%PSQL_PATH% -U postgres -d wms_db -f seed_actividades.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo Datos insertados correctamente!
    echo ================================================
    echo.
    echo Usuarios creados con contraseña: password123
    echo - alistador1@wms.com
    echo - alistador2@wms.com
    echo - empacador1@wms.com
    echo - empacador2@wms.com
    echo - vendedor1@wms.com
    echo - jefe@wms.com
    echo.
    echo Consulta README_SEED.md para más información
    echo.
) else (
    echo.
    echo ERROR: No se pudieron insertar los datos
    echo Verifica tu conexión a PostgreSQL
    echo.
)

pause
