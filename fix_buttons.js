const fs = require('fs');
const path = require('path');

const filePath = path.join('client', 'src', 'pages', 'get-started-new.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// Reemplazar todas las referencias a rutas del dashboard
content = content.replace(/setLocation\("\/dashboard\/integrations"\)/g, 'setLocation("/dashboard?tab=integrations")');
content = content.replace(/setLocation\("\/dashboard\/content"\)/g, 'setLocation("/dashboard?tab=content")');
content = content.replace(/setLocation\("\/dashboard\/automations"\)/g, 'setLocation("/dashboard?tab=automation")');

fs.writeFileSync(filePath, content, 'utf8');

console.log('Botones corregidos con éxito!');
