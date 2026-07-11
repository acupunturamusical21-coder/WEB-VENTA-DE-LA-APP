// Auto-extraído del monolito index.html — módulo de funcionalidad
// (sin cambios de contenido; solo separado en archivo)

window.onload = function() {
  // Set today's date
  document.getElementById('mvCurrentDate').value = new Date().toISOString().split('T')[0];
  
  buildCorrespondencias();
  buildOrganos();
  buildEscalas();
  buildLector();
  buildLibro();
  buildTriadasIndex();
  buildTriadasMenu();
  buildTriadasGrid();
  performSearch('');
  buildHexagramas();
  initOraculo();
  // El dodecaedro se inicializa en showSection('organos') para que
  // el contenedor sea visible y tenga dimensiones reales.
};