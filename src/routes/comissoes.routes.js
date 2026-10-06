import { Router } from 'express';
import { obterRelatorioComissoes } from '../services/comissao.service.js';

const router = Router();

// rota para listar as comissoes calculadas
router.get('/', (req, res) => {
  try {
    const dados = obterRelatorioComissoes();
    return res.status(200).json({
      sucesso: true,
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

export default router;
