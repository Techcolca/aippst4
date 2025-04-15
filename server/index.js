import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5017;

// Serve static files from dist/client
app.use(express.static(path.join(__dirname, '../dist/client')));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serve the main app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/client/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});