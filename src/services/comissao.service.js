import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// calcula a comissao de uma venda individual baseada nas faixas
export function calcularComissaoVenda(valor) {
  let percentual = 0;

  if (valor >= 500.0) {
    percentual = 0.05; // 5% a partir de 500
  } else if (valor >= 100.0) {
    percentual = 0.01; // 1% abaixo de 500 e a partir de 100
  } else {
    percentual = 0.0;  // abaixo de 100 nao gera comissao
  }

  const valorComissao = Number((valor * percentual).toFixed(2));

  return {
    percentual,
    valorComissao
  };
}

// valida a estrutura do array de vendas recebido
export function validarEstruturaVendas(vendas) {
  if (!Array.isArray(vendas)) {
    throw new Error("o conteudo deve conter uma lista (array) na propriedade 'vendas'.");
  }

  if (vendas.length === 0) {
    throw new Error('a lista de vendas informada esta vazia.');
  }

  for (const [indice, item] of vendas.entries()) {
    if (!item.vendedor || typeof item.vendedor !== 'string' || item.vendedor.trim() === '') {
      throw new Error(`venda #${indice + 1}: o campo 'vendedor' e obrigatorio e deve ser um texto valido.`);
    }

    const val = Number(item.valor);
    if (isNaN(val) || val < 0) {
      throw new Error(`venda #${indice + 1}: o campo 'valor' deve ser um numero maior ou igual a zero.`);
    }
  }
}

// processa uma lista de vendas (customizada por upload ou a padrao do arquivo)
export function processarComissoes(vendasCustomizadas = null) {
  let vendas = vendasCustomizadas;

  // se nao recebeu lista customizada via upload, le o arquivo padrao
  if (!vendas) {
    const caminhoArquivo = path.resolve(__dirname, '../data/vendas.json');
    const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
    const json = JSON.parse(conteudo);
    vendas = json.vendas;
  }

  // valida o conjunto de dados
  validarEstruturaVendas(vendas);

  // agrupa os totais por vendedor
  const relatorioPorVendedor = {};

  for (const venda of vendas) {
    const vendedor = String(venda.vendedor).trim();
    const valor = Number(venda.valor);
    const { valorComissao } = calcularComissaoVenda(valor);

    if (!relatorioPorVendedor[vendedor]) {
      relatorioPorVendedor[vendedor] = {
        vendedor,
        totalVendas: 0,
        totalComissao: 0,
        quantidadeVendas: 0
      };
    }

    relatorioPorVendedor[vendedor].totalVendas += valor;
    relatorioPorVendedor[vendedor].totalComissao += valorComissao;
    relatorioPorVendedor[vendedor].quantidadeVendas += 1;
  }

  // formata valores com duas casas decimais
  const listaVendedores = Object.values(relatorioPorVendedor).map(item => ({
    vendedor: item.vendedor,
    quantidadeVendas: item.quantidadeVendas,
    totalVendas: Number(item.totalVendas.toFixed(2)),
    totalComissao: Number(item.totalComissao.toFixed(2))
  }));

  // totais consolidados da equipe
  const totalEquipe = listaVendedores.reduce((acumulador, item) => ({
    totalVendas: Number((acumulador.totalVendas + item.totalVendas).toFixed(2)),
    totalComissao: Number((acumulador.totalComissao + item.totalComissao).toFixed(2)),
    totalVendasRealizadas: acumulador.totalVendasRealizadas + item.quantidadeVendas
  }), { totalVendas: 0, totalComissao: 0, totalVendasRealizadas: 0 });

  return {
    totalEquipe,
    vendedores: listaVendedores
  };
}

// mantem compatibilidade com chamadas existentes
export function obterRelatorioComissoes() {
  return processarComissoes();
}

//TODO: criar opcao de gerar venda usando um produto do json de estoque, criando movimentaçao automatica no estoque e recalculando comissao