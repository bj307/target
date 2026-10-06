import { Router } from 'express';
import comissoesRouter from './comissoes.routes.js';
import estoqueRouter from './estoque.routes.js';
import financeiroRouter from './financeiro.routes.js';

const router = Router();

// rota base de status/healthcheck
router.get('/status', (req, res) => {
  res.json({ status: 'API online' });
});

// rotas dos modulos
router.use('/comissoes', comissoesRouter);
router.use('/estoque', estoqueRouter);
router.use('/financeiro', financeiroRouter);

export default router;
