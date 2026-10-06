import { Router } from 'express';

const router = Router();

// rota base de status/healthcheck
router.get('/status', (req, res) => {
  res.json({ status: 'API online' });
});

// placeholders para as rotas dos desafios
// router.use('/comissoes', comissoesRouter);
// router.use('/estoque', estoqueRouter);
// router.use('/financeiro', financeiroRouter);

export default router;
