const { query } = require('../src/config/db');

async function checkEstados() {
  console.log('🔍 Verificando estados actuales en la base de datos...\n');

  try {
    const result = await query('SELECT DISTINCT estado FROM ordenes_venta ORDER BY estado');

    if (result.rows.length === 0) {
      console.log('✓ No hay órdenes en la base de datos\n');
    } else {
      console.log('Estados actuales encontrados:');
      result.rows.forEach(row => {
        console.log(`  - ${row.estado}`);
      });
      console.log('');
    }

    // Contar órdenes por estado
    const count = await query('SELECT estado, COUNT(*) as cantidad FROM ordenes_venta GROUP BY estado ORDER BY estado');

    if (count.rows.length > 0) {
      console.log('Cantidad de órdenes por estado:');
      count.rows.forEach(row => {
        console.log(`  - ${row.estado}: ${row.cantidad} órdenes`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }

  process.exit(0);
}

checkEstados().catch(error => {
  console.error('❌ Error general:', error);
  process.exit(1);
});
