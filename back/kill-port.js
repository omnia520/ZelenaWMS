const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function killPort(port) {
  try {
    console.log(`🔍 Buscando procesos en el puerto ${port}...`);

    // Obtener PIDs usando el puerto
    const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);

    if (!stdout) {
      console.log(`✅ Puerto ${port} está libre`);
      return;
    }

    // Extraer PIDs únicos
    const lines = stdout.split('\n');
    const pids = new Set();

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && !isNaN(pid)) {
        pids.add(pid);
      }
    }

    if (pids.size === 0) {
      console.log(`✅ Puerto ${port} está libre`);
      return;
    }

    console.log(`⚠️  Encontrados ${pids.size} procesos usando el puerto ${port}`);

    // Matar cada proceso
    for (const pid of pids) {
      try {
        await execPromise(`taskkill /F /PID ${pid}`);
        console.log(`✅ Proceso ${pid} terminado`);
      } catch (error) {
        // Ignorar errores si el proceso ya no existe
      }
    }

    console.log(`✅ Puerto ${port} liberado`);
  } catch (error) {
    // Si netstat no encuentra nada, el puerto está libre
    console.log(`✅ Puerto ${port} está libre`);
  }
}

// Ejecutar
killPort(3000).then(() => process.exit(0));
