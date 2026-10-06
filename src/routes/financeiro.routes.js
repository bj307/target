import { Router } from 'express';
import { calcularJurosAtraso, calcularJurosLote } from '../services/financeiro.service.js';

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

// calcula juros em lote a partir de um json de titulos enviado por upload
router.post('/upload', (req, res) => {
  try {
    const titulos = req.body.titulos || req.body;
    const resultado = calcularJurosLote(titulos);

    return res.status(200).json({
      sucesso: true,
      origem: 'upload',
      mensagem: 'juros dos titulos calculados com sucesso em lote',
      dados: resultado
    });
  } catch (error) {
    return res.status(400).json({
      sucesso: false,
      mensagem: error.message
    });
  }
});

export default router;
