import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../public')));

// rotas da api
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
