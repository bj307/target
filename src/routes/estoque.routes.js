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

// carrega catalogo de estoque customizado via upload de json
router.post('/upload', (req, res) => {
  try {
    const produtos = req.body.estoque || req.body;
    const novosProdutos = estoqueService.carregarEstoqueCustomizado(produtos);
    return res.status(200).json({
      sucesso: true,
      origem: 'upload',
      mensagem: 'catalogo de estoque atualizado com sucesso a partir do json enviado',
      dados: {
        produtos: novosProdutos,
        historico: estoqueService.listarHistorico()
      }
    });
  } catch (error) {
    return res.status(400).json({
      sucesso: false,
      mensagem: error.message
    });
  }
});

// restaura o catalogo padrao do arquivo estoque.json
router.post('/restaurar', (req, res) => {
  try {
    const produtos = estoqueService.restaurarEstoquePadrao();
    return res.status(200).json({
      sucesso: true,
      origem: 'padrao',
      mensagem: 'estoque padrao restaurado com sucesso',
      dados: {
        produtos,
        historico: estoqueService.listarHistorico()
      }
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: 'erro ao restaurar estoque padrao',
      detalhes: error.message
    });
  }
});

export default router;
