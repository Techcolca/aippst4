import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'client', 'src', 'pages', 'get-started-new.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// Reemplazar todas las referencias a rutas del dashboard
content = content.replace(/setLocation\("\/dashboard\/integrations"\)/g, 'setLocation("/dashboard?tab=integrations")');
content = content.replace(/setLocation\("\/dashboard\/content"\)/g, 'setLocation("/dashboard?tab=content")');
content = content.replace(/setLocation\("\/dashboard\/automations"\)/g, 'setLocation("/dashboard?tab=automation")');

fs.writeFileSync(filePath, content, 'utf8');

console.log('Botones corregidos con éxito!');
