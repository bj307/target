import { Router } from 'express';
import { estoqueService } from '../services/estoque.service.js';

const router = Router();

// lista os produtos e seus estoques atuais
router.get('/', (req, res) => {
  try {
    const produtos = estoqueService.listarProdutos();
    const historico = estoqueService.listarHistorico();
    return res.status(200).json({
      sucesso: true,
      dados: {
        produtos,
        historico
      }
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: 'erro ao consultar estoque',
      detalhes: error.message
    });
  }
});

// lanca movimentacao de entrada ou saida
router.post('/movimentar', (req, res) => {
  try {
    const { codigoProduto, tipo, quantidade, descricao } = req.body;
    const resultado = estoqueService.lancarMovimentacao({
      codigoProduto,
      tipo,
      quantidade,
      descricao
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: 'movimentaçao realizada com sucesso',
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
