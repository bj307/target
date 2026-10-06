import { Router } from 'express';
import { obterRelatorioComissoes, processarComissoes } from '../services/comissao.service.js';

const router = Router();

// rota para listar as comissoes calculadas com o arquivo padrao
router.get('/', (req, res) => {
  try {
    const dados = obterRelatorioComissoes();
    return res.status(200).json({
      sucesso: true,
      origem: 'padrao',
      dados
    });
  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      mensagem: 'erro ao calcular comissoes',
      detalhes: error.message
    });
  }
});

// rota para processar comissoes a partir de um json de vendas enviado
router.post('/upload', (req, res) => {
  try {
    // aceita tanto { vendas: [...] } quanto [...] direto
    const vendas = req.body.vendas || req.body;
    const dados = processarComissoes(vendas);

    return res.status(200).json({
      sucesso: true,
      origem: 'upload',
      mensagem: 'comissoes recalculadas com sucesso a partir do json enviado',
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
