// Script temporal para limpiar el cache de i18next
console.log('Limpiando cache de i18next...');
localStorage.removeItem('i18nextLng');
localStorage.removeItem('i18next');
localStorage.clear();
console.log('Cache limpiado. Recargando página...');
window.location.reload();