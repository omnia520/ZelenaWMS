const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de conexiones PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'wms_db',
  max: 20, // Número máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false // Requerido para Azure PostgreSQL
  },
  // CONFIGURACIÓN DE ZONA HORARIA: Colombia (UTC-5)
  options: '-c timezone=America/Bogota'
});

// Evento de conexión exitosa - Configurar zona horaria de Colombia
pool.on('connect', async (client) => {
  try {
    await client.query("SET timezone = 'America/Bogota'");
    console.log('✓ Conectado a la base de datos PostgreSQL (Zona horaria: Colombia UTC-5)');
  } catch (error) {
    console.error('Error al configurar zona horaria:', error.message);
  }
});

// Evento de error
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

// Función para verificar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query("SET timezone = 'America/Bogota'");
    const result = await client.query('SELECT NOW()');
    console.log('✓ Prueba de conexión exitosa (Hora Colombia):', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('✗ Error al conectar con la base de datos:', error.message);
    return false;
  }
};

// Query helper con manejo de errores
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query ejecutado:', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Error en query:', { text, error: error.message });
    throw error;
  }
};

// Transacciones
const getClient = async () => {
  const client = await pool.connect();

  // Establecer zona horaria de Colombia para esta transacción
  await client.query("SET timezone = 'America/Bogota'");

  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // Timeout para evitar que la transacción quede colgada
  const timeout = setTimeout(() => {
    console.error('Cliente de transacción no liberado después de 5 segundos');
  }, 5000);

  client.release = () => {
    clearTimeout(timeout);
    return release();
  };

  return client;
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
};
