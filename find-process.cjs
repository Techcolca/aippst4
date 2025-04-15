const findProcess = require('find-process');

console.log('🔍 Buscando procesos en puerto 5017...');

findProcess('port', 5017)
  .then((list) => {
    if (list.length === 0) {
      console.log('❌ No se encontró ningún proceso usando el puerto 5017');
    } else {
      console.log(`✅ Procesos encontrados: ${list.length}`);
      list.forEach((process) => {
        console.log(`🔹 PID: ${process.pid}`);
        console.log(`🔹 Nombre: ${process.name}`);
        console.log(`🔹 Comando: ${process.cmd}`);
      });
    }
  })
  .catch((err) => {
    console.error(`❌ Error buscando proceso: ${err.message}`);
  });