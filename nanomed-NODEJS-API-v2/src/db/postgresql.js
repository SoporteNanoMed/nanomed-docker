const { Pool } = require('pg');
const config = require('../../config').postgresql;

// Crear pool de conexiones
const pool = new Pool({
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  password: config.password,
  max: 20, // máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // tiempo máximo que una conexión puede estar inactiva
  connectionTimeoutMillis: 2000, // tiempo máximo para establecer una conexión
});

// Evento cuando se conecta un cliente
pool.on('connect', () => {
  console.log('✅ Cliente conectado a PostgreSQL');
});

// Evento cuando se libera un cliente
pool.on('remove', () => {
  console.log('🔌 Cliente desconectado de PostgreSQL');
});

// Evento de error
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

// Función para ejecutar consultas
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📊 Query ejecutada en ${duration}ms: ${text.substring(0, 50)}...`);
    return res;
  } catch (error) {
    console.error('❌ Error ejecutando query:', error);
    throw error;
  }
};

// Función para obtener un cliente del pool
const getClient = () => {
  return pool.connect();
};

// Función para cerrar el pool
const closePool = async () => {
  await pool.end();
  console.log('🔌 Pool de PostgreSQL cerrado');
};

module.exports = {
  query,
  getClient,
  closePool,
  pool
};
