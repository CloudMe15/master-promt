import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import generatePromptHandler from './api/generate-prompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Route to the shared handler for /api/generate-prompt
app.all('/api/generate-prompt', (req, res) => {
  return generatePromptHandler(req, res);
});

// Root and SPA fallback
app.get('*', (req, res) => {
  const publicIndex = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(publicIndex)) {
    return res.sendFile(publicIndex);
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// In local dev and AI Studio, listen on port 3000
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Master Prompt Generator running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
