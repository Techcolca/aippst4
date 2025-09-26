const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const fs = require('fs');
const path = require('path');

// Configuración de estilos para PDFs profesionales
const styles = {
  title: { fontSize: 24, textColor: '#1f2937', fontStyle: 'bold' },
  subtitle: { fontSize: 18, textColor: '#374151', fontStyle: 'bold' },
  heading: { fontSize: 14, textColor: '#111827', fontStyle: 'bold' },
  text: { fontSize: 11, textColor: '#374151', fontStyle: 'normal' },
  warning: { fontSize: 12, textColor: '#dc2626', fontStyle: 'bold' },
  success: { fontSize: 11, textColor: '#059669', fontStyle: 'normal' }
};

// Función para crear PDF profesional para español
function createSpanishPDF() {
  const doc = new jsPDF();
  let yPosition = 30;

  // Encabezado
  doc.setFontSize(styles.title.fontSize);
  doc.setFont('helvetica', styles.title.fontStyle);
  doc.setTextColor(styles.title.textColor);
  doc.text('Requisitos Técnicos de Hosting - AIPI', 20, yPosition);
  yPosition += 15;

  doc.setFontSize(styles.subtitle.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(styles.subtitle.textColor);
  doc.text('Documentación Técnica para Clientes', 20, yPosition);
  yPosition += 20;

  // Advertencia crítica
  doc.setFillColor(254, 242, 242); // bg-red-50
  doc.rect(15, yPosition - 5, 180, 25, 'F');
  doc.setFontSize(styles.warning.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.warning.textColor);
  doc.text('⚠️ ADVERTENCIA CRÍTICA', 20, yPosition + 5);
  yPosition += 12;

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#7f1d1d');
  const warningText = 'Los widgets de IA de AIPI requieren recursos específicos de hosting para funcionar correctamente. No todos los planes de hosting son compatibles. El 85% de los problemas de rendimiento se deben a hosting inadecuado.';
  const warningLines = doc.splitTextToSize(warningText, 170);
  doc.text(warningLines, 20, yPosition + 5);
  yPosition += 30;

  // Resumen ejecutivo
  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('RESUMEN EJECUTIVO', 20, yPosition);
  yPosition += 10;

  const executiveSummary = [
    '🎯 Objetivo: Evitar problemas de congelamiento, timeouts y mal rendimiento de widgets',
    '⏱️ Tiempo de verificación: 5 minutos antes de implementar',
    '📊 Impacto: La elección correcta de hosting determina el 85% del éxito del widget',
    '🔧 Solución: Verificación de compatibilidad previa a la implementación'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(styles.text.textColor);
  
  executiveSummary.forEach(item => {
    const lines = doc.splitTextToSize(item, 170);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 6;
  });
  yPosition += 10;

  // Nueva página para casos de incompatibilidad
  doc.addPage();
  yPosition = 30;

  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('CASOS DOCUMENTADOS DE INCOMPATIBILIDAD', 20, yPosition);
  yPosition += 15;

  // HostGator
  doc.setFillColor(254, 249, 195); // bg-yellow-50
  doc.rect(15, yPosition - 5, 180, 35, 'F');
  
  doc.setFontSize(styles.subtitle.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#92400e');
  doc.text('HostGator - Planes Compartidos (INCOMPATIBLES)', 20, yPosition + 5);
  yPosition += 15;

  const hostgatorIssues = [
    '❌ Plan Personal: 25% CPU máximo, timeout 30s → CONGELAMIENTO CONFIRMADO',
    '❌ Plan Business: MISMAS limitaciones que Personal → NO mejora rendimiento',
    '❌ Plan Baby: Idénticas restricciones → PROBLEMAS GARANTIZADOS'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#92400e');
  
  hostgatorIssues.forEach(issue => {
    const lines = doc.splitTextToSize(issue, 170);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 6;
  });
  yPosition += 20;

  // Síntomas identificados
  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('Síntomas Identificados:', 20, yPosition);
  yPosition += 10;

  const symptoms = [
    '1. Congelamiento durante registro desde dispositivos móviles',
    '2. Timeouts en mensajería >30 segundos',
    '3. CPU throttling automático cuando opera el widget',
    '4. Respuestas lentas en operaciones de IA',
    '5. Fallas intermitentes en horarios de alta carga'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(styles.text.textColor);
  
  symptoms.forEach(symptom => {
    doc.text(symptom, 20, yPosition);
    yPosition += 7;
  });
  yPosition += 15;

  // Nueva página para requisitos técnicos
  doc.addPage();
  yPosition = 30;

  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('REQUISITOS TÉCNICOS MÍNIMOS', 20, yPosition);
  yPosition += 15;

  // Tabla de requisitos técnicos
  const tableData = [
    ['CPU', 'Sin límite del 25%', 'Acceso equivalente a 1 core'],
    ['RAM', '1GB disponible', 'Hosting que no exceda memoria'],
    ['PHP', '8.0+', 'Timeout 120s mínimo'],
    ['Base de Datos', 'MySQL 5.7+ o PostgreSQL 12+', 'Conexiones ilimitadas'],
    ['SSL', 'Certificado válido', 'Let\'s Encrypt aceptable'],
    ['Arquitectura', 'No Apache LAMP', 'LiteSpeed/NGINX preferido'],
    ['Storage', 'SSD recomendado', 'HDD aceptable'],
    ['Ancho de Banda', '10GB/mes mínimo', 'Para widgets embebidos']
  ];

  autoTable(doc, {
    head: [['Especificación', 'Valor Mínimo', 'Observaciones']],
    body: tableData,
    startY: yPosition,
    headStyles: { fillColor: [31, 41, 55], textColor: 255, fontSize: 11, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10, textColor: [55, 65, 81] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 20, right: 20 }
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // Nueva página para proveedores recomendados
  doc.addPage();
  yPosition = 30;

  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('PROVEEDORES RECOMENDADOS', 20, yPosition);
  yPosition += 15;

  // Presupuesto bajo
  doc.setFillColor(240, 253, 244); // bg-green-50
  doc.rect(15, yPosition - 5, 180, 25, 'F');
  doc.setFontSize(styles.subtitle.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#065f46');
  doc.text('💰 Presupuesto Bajo ($3-5/mes)', 20, yPosition + 5);
  yPosition += 15;

  const lowBudget = [
    '✅ ChemiCloud Starter - ~25k visitas/mes',
    '✅ SiteGround StartUp - ~10k visitas/mes',
    '✅ A2 Hosting Lite - Recursos compartidos'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#065f46');
  
  lowBudget.forEach(provider => {
    doc.text(provider, 20, yPosition);
    yPosition += 7;
  });
  yPosition += 15;

  // Presupuesto medio
  doc.setFillColor(239, 246, 255); // bg-blue-50
  doc.rect(15, yPosition - 5, 180, 25, 'F');
  doc.setFontSize(styles.subtitle.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#1e40af');
  doc.text('💼 Presupuesto Medio ($10-30/mes)', 20, yPosition + 5);
  yPosition += 15;

  const mediumBudget = [
    '✅ Cloudways Vultr - 1 core / 1GB dedicados',
    '✅ Kinsta Starter - Hasta 25k visitas/mes',
    '✅ WP Engine Personal - Hasta 25k visitas/mes'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#1e40af');
  
  mediumBudget.forEach(provider => {
    doc.text(provider, 20, yPosition);
    yPosition += 7;
  });

  return doc;
}

// Función para crear PDF profesional para inglés
function createEnglishPDF() {
  const doc = new jsPDF();
  let yPosition = 30;

  // Encabezado
  doc.setFontSize(styles.title.fontSize);
  doc.setFont('helvetica', styles.title.fontStyle);
  doc.setTextColor(styles.title.textColor);
  doc.text('Technical Hosting Requirements - AIPI', 20, yPosition);
  yPosition += 15;

  doc.setFontSize(styles.subtitle.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(styles.subtitle.textColor);
  doc.text('Technical Documentation for Clients', 20, yPosition);
  yPosition += 20;

  // Advertencia crítica
  doc.setFillColor(254, 242, 242); // bg-red-50
  doc.rect(15, yPosition - 5, 180, 25, 'F');
  doc.setFontSize(styles.warning.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.warning.textColor);
  doc.text('⚠️ CRITICAL WARNING', 20, yPosition + 5);
  yPosition += 12;

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#7f1d1d');
  const warningText = 'AIPI AI widgets require specific hosting resources to function properly. Not all hosting plans are compatible. 85% of performance issues are due to inadequate hosting.';
  const warningLines = doc.splitTextToSize(warningText, 170);
  doc.text(warningLines, 20, yPosition + 5);
  yPosition += 30;

  // Resumen ejecutivo
  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('EXECUTIVE SUMMARY', 20, yPosition);
  yPosition += 10;

  const executiveSummary = [
    '🎯 Objective: Prevent widget freezing, timeouts and poor performance',
    '⏱️ Verification time: 5 minutes before implementation',
    '📊 Impact: Correct hosting choice determines 85% of widget success',
    '🔧 Solution: Compatibility verification before implementation'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(styles.text.textColor);
  
  executiveSummary.forEach(item => {
    const lines = doc.splitTextToSize(item, 170);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 6;
  });
  yPosition += 10;

  // Nueva página para casos de incompatibilidad
  doc.addPage();
  yPosition = 30;

  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('DOCUMENTED INCOMPATIBILITY CASES', 20, yPosition);
  yPosition += 15;

  // HostGator
  doc.setFillColor(254, 249, 195); // bg-yellow-50
  doc.rect(15, yPosition - 5, 180, 35, 'F');
  
  doc.setFontSize(styles.subtitle.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#92400e');
  doc.text('HostGator - Shared Plans (INCOMPATIBLE)', 20, yPosition + 5);
  yPosition += 15;

  const hostgatorIssues = [
    '❌ Personal Plan: 25% CPU max, 30s timeout → CONFIRMED FREEZING',
    '❌ Business Plan: SAME limitations as Personal → NO performance improvement',
    '❌ Baby Plan: Identical restrictions → GUARANTEED PROBLEMS'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#92400e');
  
  hostgatorIssues.forEach(issue => {
    const lines = doc.splitTextToSize(issue, 170);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 6;
  });
  yPosition += 20;

  // Síntomas identificados
  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('Identified Symptoms:', 20, yPosition);
  yPosition += 10;

  const symptoms = [
    '1. Freezing during registration from mobile devices',
    '2. Messaging timeouts >30 seconds',
    '3. Automatic CPU throttling when widget operates',
    '4. Slow responses in AI operations',
    '5. Intermittent failures during high load periods'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(styles.text.textColor);
  
  symptoms.forEach(symptom => {
    doc.text(symptom, 20, yPosition);
    yPosition += 7;
  });
  yPosition += 15;

  // Nueva página para requisitos técnicos
  doc.addPage();
  yPosition = 30;

  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('MINIMUM TECHNICAL REQUIREMENTS', 20, yPosition);
  yPosition += 15;

  // Tabla de requisitos técnicos
  const tableData = [
    ['CPU', 'No 25% limit', 'Access equivalent to 1 core'],
    ['RAM', '1GB available', 'Hosting that doesn\'t exceed memory'],
    ['PHP', '8.0+', '120s timeout minimum'],
    ['Database', 'MySQL 5.7+ or PostgreSQL 12+', 'Unlimited connections'],
    ['SSL', 'Valid certificate', 'Let\'s Encrypt acceptable'],
    ['Architecture', 'Not Apache LAMP', 'LiteSpeed/NGINX preferred'],
    ['Storage', 'SSD recommended', 'HDD acceptable'],
    ['Bandwidth', '10GB/month minimum', 'For embedded widgets']
  ];

  autoTable(doc, {
    head: [['Specification', 'Minimum Value', 'Notes']],
    body: tableData,
    startY: yPosition,
    headStyles: { fillColor: [31, 41, 55], textColor: 255, fontSize: 11, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10, textColor: [55, 65, 81] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 20, right: 20 }
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // Nueva página para proveedores recomendados
  doc.addPage();
  yPosition = 30;

  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('RECOMMENDED PROVIDERS', 20, yPosition);
  yPosition += 15;

  // Presupuesto bajo
  doc.setFillColor(240, 253, 244); // bg-green-50
  doc.rect(15, yPosition - 5, 180, 25, 'F');
  doc.setFontSize(styles.subtitle.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#065f46');
  doc.text('💰 Low Budget ($3-5/month)', 20, yPosition + 5);
  yPosition += 15;

  const lowBudget = [
    '✅ ChemiCloud Starter - ~25k visits/month',
    '✅ SiteGround StartUp - ~10k visits/month',
    '✅ A2 Hosting Lite - Shared resources'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#065f46');
  
  lowBudget.forEach(provider => {
    doc.text(provider, 20, yPosition);
    yPosition += 7;
  });
  yPosition += 15;

  // Presupuesto medio
  doc.setFillColor(239, 246, 255); // bg-blue-50
  doc.rect(15, yPosition - 5, 180, 25, 'F');
  doc.setFontSize(styles.subtitle.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#1e40af');
  doc.text('💼 Medium Budget ($10-30/month)', 20, yPosition + 5);
  yPosition += 15;

  const mediumBudget = [
    '✅ Cloudways Vultr - 1 core / 1GB dedicated',
    '✅ Kinsta Starter - Up to 25k visits/month',
    '✅ WP Engine Personal - Up to 25k visits/month'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#1e40af');
  
  mediumBudget.forEach(provider => {
    doc.text(provider, 20, yPosition);
    yPosition += 7;
  });

  return doc;
}

// Función para crear PDF profesional para francés
function createFrenchPDF() {
  const doc = new jsPDF();
  let yPosition = 30;

  // Encabezado
  doc.setFontSize(styles.title.fontSize);
  doc.setFont('helvetica', styles.title.fontStyle);
  doc.setTextColor(styles.title.textColor);
  doc.text('Exigences Techniques d\'Hébergement - AIPI', 20, yPosition);
  yPosition += 15;

  doc.setFontSize(styles.subtitle.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(styles.subtitle.textColor);
  doc.text('Documentation Technique pour Clients', 20, yPosition);
  yPosition += 20;

  // Advertencia crítica
  doc.setFillColor(254, 242, 242); // bg-red-50
  doc.rect(15, yPosition - 5, 180, 25, 'F');
  doc.setFontSize(styles.warning.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.warning.textColor);
  doc.text('⚠️ AVERTISSEMENT CRITIQUE', 20, yPosition + 5);
  yPosition += 12;

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#7f1d1d');
  const warningText = 'Les widgets IA d\'AIPI nécessitent des ressources d\'hébergement spécifiques pour fonctionner correctement. Tous les plans d\'hébergement ne sont pas compatibles. 85% des problèmes de performance sont dus à un hébergement inadéquat.';
  const warningLines = doc.splitTextToSize(warningText, 170);
  doc.text(warningLines, 20, yPosition + 5);
  yPosition += 30;

  // Resumen ejecutivo
  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('RÉSUMÉ EXÉCUTIF', 20, yPosition);
  yPosition += 10;

  const executiveSummary = [
    '🎯 Objectif: Éviter le gel des widgets, les timeouts et les mauvaises performances',
    '⏱️ Temps de vérification: 5 minutes avant l\'implémentation',
    '📊 Impact: Le choix correct de l\'hébergement détermine 85% du succès du widget',
    '🔧 Solution: Vérification de compatibilité avant l\'implémentation'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(styles.text.textColor);
  
  executiveSummary.forEach(item => {
    const lines = doc.splitTextToSize(item, 170);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 6;
  });
  yPosition += 10;

  // Nueva página para casos de incompatibilidad
  doc.addPage();
  yPosition = 30;

  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('CAS D\'INCOMPATIBILITÉ DOCUMENTÉS', 20, yPosition);
  yPosition += 15;

  // HostGator
  doc.setFillColor(254, 249, 195); // bg-yellow-50
  doc.rect(15, yPosition - 5, 180, 35, 'F');
  
  doc.setFontSize(styles.subtitle.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#92400e');
  doc.text('HostGator - Plans Partagés (INCOMPATIBLES)', 20, yPosition + 5);
  yPosition += 15;

  const hostgatorIssues = [
    '❌ Plan Personal: 25% CPU maximum, timeout 30s → GEL CONFIRMÉ',
    '❌ Plan Business: MÊMES limitations que Personal → AUCUNE amélioration',
    '❌ Plan Baby: Restrictions identiques → PROBLÈMES GARANTIS'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#92400e');
  
  hostgatorIssues.forEach(issue => {
    const lines = doc.splitTextToSize(issue, 170);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 6;
  });
  yPosition += 20;

  // Síntomas identificados
  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('Symptômes Identifiés:', 20, yPosition);
  yPosition += 10;

  const symptoms = [
    '1. Gel pendant l\'inscription depuis les appareils mobiles',
    '2. Timeouts dans la messagerie >30 secondes',
    '3. Limitation automatique du CPU quand le widget fonctionne',
    '4. Réponses IA lentes dans les opérations',
    '5. Pannes intermittentes pendant les périodes de forte charge'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(styles.text.textColor);
  
  symptoms.forEach(symptom => {
    doc.text(symptom, 20, yPosition);
    yPosition += 7;
  });
  yPosition += 15;

  // Nueva página para requisitos técnicos
  doc.addPage();
  yPosition = 30;

  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('EXIGENCES TECHNIQUES MINIMALES', 20, yPosition);
  yPosition += 15;

  // Tabla de requisitos técnicos
  const tableData = [
    ['CPU', 'Sans limite de 25%', 'Accès équivalent à 1 core'],
    ['RAM', '1GB disponible', 'Hébergement qui ne dépasse pas mémoire'],
    ['PHP', '8.0+', 'Timeout 120s minimum'],
    ['Base de Données', 'MySQL 5.7+ ou PostgreSQL 12+', 'Connexions illimitées'],
    ['SSL', 'Certificat valide', 'Let\'s Encrypt acceptable'],
    ['Architecture', 'Pas Apache LAMP', 'LiteSpeed/NGINX préféré'],
    ['Stockage', 'SSD recommandé', 'HDD acceptable'],
    ['Bande Passante', '10GB/mois minimum', 'Pour widgets intégrés']
  ];

  autoTable(doc, {
    head: [['Spécification', 'Valeur Minimale', 'Observations']],
    body: tableData,
    startY: yPosition,
    headStyles: { fillColor: [31, 41, 55], textColor: 255, fontSize: 11, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10, textColor: [55, 65, 81] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 20, right: 20 }
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // Nueva página para proveedores recomendados
  doc.addPage();
  yPosition = 30;

  doc.setFontSize(styles.heading.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(styles.heading.textColor);
  doc.text('FOURNISSEURS RECOMMANDÉS', 20, yPosition);
  yPosition += 15;

  // Presupuesto bajo
  doc.setFillColor(240, 253, 244); // bg-green-50
  doc.rect(15, yPosition - 5, 180, 25, 'F');
  doc.setFontSize(styles.subtitle.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#065f46');
  doc.text('💰 Petit Budget (3-5€/mois)', 20, yPosition + 5);
  yPosition += 15;

  const lowBudget = [
    '✅ ChemiCloud Starter - ~25k visites/mois',
    '✅ SiteGround StartUp - ~10k visites/mois',
    '✅ A2 Hosting Lite - Ressources partagées'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#065f46');
  
  lowBudget.forEach(provider => {
    doc.text(provider, 20, yPosition);
    yPosition += 7;
  });
  yPosition += 15;

  // Presupuesto medio
  doc.setFillColor(239, 246, 255); // bg-blue-50
  doc.rect(15, yPosition - 5, 180, 25, 'F');
  doc.setFontSize(styles.subtitle.fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#1e40af');
  doc.text('💼 Budget Moyen (10-30€/mois)', 20, yPosition + 5);
  yPosition += 15;

  const mediumBudget = [
    '✅ Cloudways Vultr - 1 core / 1GB dédiés',
    '✅ Kinsta Starter - Jusqu\'à 25k visites/mois',
    '✅ WP Engine Personal - Jusqu\'à 25k visites/mois'
  ];

  doc.setFontSize(styles.text.fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#1e40af');
  
  mediumBudget.forEach(provider => {
    doc.text(provider, 20, yPosition);
    yPosition += 7;
  });

  return doc;
}

// Función principal para generar todos los PDFs
async function generateHostingDocsPDFs() {
  try {
    // Crear directorio public si no existe
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    console.log('🚀 Generando PDFs de documentación técnica...');

    // Generar PDF en español
    const spanishPDF = createSpanishPDF();
    const spanishBuffer = spanishPDF.output('arraybuffer');
    fs.writeFileSync(path.join(publicDir, 'REQUISITOS-TECNICOS-HOSTING-ES.pdf'), Buffer.from(spanishBuffer));
    console.log('✅ PDF Español generado: REQUISITOS-TECNICOS-HOSTING-ES.pdf');

    // Generar PDF en inglés
    const englishPDF = createEnglishPDF();
    const englishBuffer = englishPDF.output('arraybuffer');
    fs.writeFileSync(path.join(publicDir, 'TECHNICAL-HOSTING-REQUIREMENTS-EN.pdf'), Buffer.from(englishBuffer));
    console.log('✅ PDF Inglés generado: TECHNICAL-HOSTING-REQUIREMENTS-EN.pdf');

    // Generar PDF en francés
    const frenchPDF = createFrenchPDF();
    const frenchBuffer = frenchPDF.output('arraybuffer');
    fs.writeFileSync(path.join(publicDir, 'EXIGENCES-TECHNIQUES-HEBERGEMENT-FR.pdf'), Buffer.from(frenchBuffer));
    console.log('✅ PDF Francés generado: EXIGENCES-TECHNIQUES-HEBERGEMENT-FR.pdf');

    console.log('🎉 Todos los PDFs han sido generados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al generar PDFs:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  generateHostingDocsPDFs();
}

export { generateHostingDocsPDFs };