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

  // valida a estrutura de uma lista de produtos de estoque
  validarEstruturaEstoque(produtos) {
    if (!Array.isArray(produtos)) {
      throw new Error("o conteudo deve conter uma lista (array) na propriedade 'estoque'.");
    }

    if (produtos.length === 0) {
      throw new Error('a lista de produtos informada esta vazia.');
    }

    const codigosVistos = new Set();

    for (const [indice, item] of produtos.entries()) {
      const cod = Number(item.codigoProduto);
      if (!cod || !Number.isInteger(cod) || cod <= 0) {
        throw new Error(`produto #${indice + 1}: o campo 'codigoProduto' deve ser um numero inteiro positivo.`);
      }

      if (codigosVistos.has(cod)) {
        throw new Error(`o codigo de produto ${cod} esta duplicado na lista enviada.`);
      }
      codigosVistos.add(cod);

      if (!item.descricaoProduto || typeof item.descricaoProduto !== 'string' || item.descricaoProduto.trim() === '') {
        throw new Error(`produto #${indice + 1}: o campo 'descricaoProduto' e obrigatorio.`);
      }

      const est = Number(item.estoque);
      if (isNaN(est) || !Number.isInteger(est) || est < 0) {
        throw new Error(`produto #${indice + 1}: o campo 'estoque' deve ser um numero inteiro maior ou igual a zero.`);
      }
    }
  }

  // carrega um novo catalogo de estoque customizado a partir de upload
  carregarEstoqueCustomizado(produtosCustomizados) {
    this.validarEstruturaEstoque(produtosCustomizados);

    this.produtos = produtosCustomizados.map(p => ({
      codigoProduto: Number(p.codigoProduto),
      descricaoProduto: String(p.descricaoProduto).trim(),
      estoque: Number(p.estoque)
    }));

    // reinicia o historico de movimentacoes para o novo catalogo
    this.historico = [];
    this.proximoId = 1;

    return this.produtos;
  }

  // restaura o estoque padrao a partir do arquivo json
  restaurarEstoquePadrao() {
    this.carregarDados();
    this.historico = [];
    this.proximoId = 1;
    return this.produtos;
  }
}

export const estoqueService = new EstoqueService();
