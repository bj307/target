import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// enum para os tipos de movimentacao de estoque permitidos
export const TipoMovimentacao = Object.freeze({
  ENTRADA: 'ENTRADA',
  SAIDA: 'SAIDA'
});

// gerencia os produtos e historico de movimentacoes em memoria
class EstoqueService {
  constructor() {
    this.produtos = [];
    this.historico = [];
    this.proximoId = 1;
    this.carregarDados();
  }

  // carrega o json inicial de produtos
  carregarDados() {
    const caminho = path.resolve(__dirname, '../data/estoque.json');
    const conteudo = fs.readFileSync(caminho, 'utf-8');
    const { estoque } = JSON.parse(conteudo);
    this.produtos = JSON.parse(JSON.stringify(estoque));
  }

  // lista todos os produtos e seus estoques atuais
  listarProdutos() {
    return this.produtos;
  }

  // lanca movimentacao de entrada ou saida
  lancarMovimentacao({ codigoProduto, tipo, quantidade, descricao }) {
    const cod = Number(codigoProduto);
    const qtd = Number(quantidade);

    // valida se o produto existe
    const produto = this.produtos.find(p => p.codigoProduto === cod);
    if (!produto) {
      throw new Error(`produto com codigo ${codigoProduto} nao encontrado.`);
    }

    // valida quantidade
    if (!qtd || qtd <= 0 || !Number.isInteger(qtd)) {
      throw new Error('a quantidade deve ser um numero inteiro maior que zero.');
    }

    // valida tipo de movimentacao utilizando o enum
    const tipoNormalizado = String(tipo || '').trim().toUpperCase();
    const tiposPermitidos = Object.values(TipoMovimentacao);

    if (!tiposPermitidos.includes(tipoNormalizado)) {
      throw new Error(`tipo de movimentaçao invalido. tipos permitidos: ${tiposPermitidos.join(', ')}.`);
    }

    // valida descricao
    if (!descricao || String(descricao).trim().length === 0) {
      throw new Error('a descriçao da movimentaçao e obrigatoria.');
    }

    // valida saldo disponivel em caso de saida
    if (tipoNormalizado === TipoMovimentacao.SAIDA && qtd > produto.estoque) {
      throw new Error(`saldo insuficiente. estoque atual: ${produto.estoque}, solicitado: ${qtd}.`);
    }

    // atualiza o saldo com base no enum
    const estoqueAnterior = produto.estoque;
    produto.estoque = tipoNormalizado === TipoMovimentacao.ENTRADA
      ? produto.estoque + qtd
      : produto.estoque - qtd;

    // gera registro com identificador unico
    const registro = {
      idMovimentacao: this.proximoId++,
      codigoProduto: produto.codigoProduto,
      descricaoProduto: produto.descricaoProduto,
      tipo: tipoNormalizado,
      quantidade: qtd,
      descricao: String(descricao).trim(),
      estoqueAnterior,
      estoqueFinal: produto.estoque,
      dataHora: new Date().toLocaleString('pt-BR')
    };

    this.historico.unshift(registro);

    return {
      movimentacao: registro,
      estoqueFinal: produto.estoque
    };
  }

  // lista o historico de movimentacoes realizadas
  listarHistorico() {
    return this.historico;
  }
}

export const estoqueService = new EstoqueService();
