import { Router } from 'express';
import { calcularJurosAtraso } from '../services/financeiro.service.js';

const router = Router();

// calcula juros com base no valor e data de vencimento
router.post('/calcular-juros', (req, res) => {
  try {
    const { valor, dataVencimento } = req.body;
    const dados = calcularJurosAtraso({ valor, dataVencimento });

    return res.status(200).json({
      sucesso: true,
      dados
    });
  } catch (error) {
    return res.status(400).json({
      sucesso: false,
      mensagem: error.message
    });
  }
});

export default router;
