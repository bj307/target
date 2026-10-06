// converte string de data para objeto date zerando horas
function normalizarData(dataString) {
  if (!dataString) {
    throw new Error('data de vencimento nao informada.');
  }

  // aceita aaaa-mm-dd ou dd/mm/aaaa
  let ano, mes, dia;
  if (dataString.includes('/')) {
    const partes = dataString.split('/');
    dia = Number(partes[0]);
    mes = Number(partes[1]);
    ano = Number(partes[2]);
  } else if (dataString.includes('-')) {
    const partes = dataString.split('-');
    ano = Number(partes[0]);
    mes = Number(partes[1]);
    dia = Number(partes[2]);
  } else {
    throw new Error('formato de data invalido. use aaaa-mm-dd.');
  }

  const data = new Date(ano, mes - 1, dia);
  data.setHours(0, 0, 0, 0);

  if (isNaN(data.getTime())) {
    throw new Error('data de vencimento invalida.');
  }

  return data;
}

// formata data para exibicao no padrao dd/mm/aaaa
function formatarData(data) {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// calcula os juros com base no valor e data de vencimento
export function calcularJurosAtraso({ valor, dataVencimento }) {
  const valorNumerico = Number(valor);

  // valida valor
  if (!valorNumerico || valorNumerico <= 0 || isNaN(valorNumerico)) {
    throw new Error('o valor deve ser um numero maior que zero.');
  }

  const dtVencimento = normalizarData(dataVencimento);

  // data de referencia atual (hoje com horas zeradas)
  const dtHoje = new Date();
  dtHoje.setHours(0, 0, 0, 0);

  // calcula diferenca em dias
  const umDiaEmMs = 1000 * 60 * 60 * 24;
  const diferencaMs = dtHoje.getTime() - dtVencimento.getTime();
  const diferencaDias = Math.floor(diferencaMs / umDiaEmMs);

  const diasAtraso = Math.max(0, diferencaDias);
  const estaAtrasado = diasAtraso > 0;

  // taxa de 2,5% ao dia com juros compostos (incide sobre o saldo acumulado a cada dia)
  const taxaDiaria = 0.025;
  const valorTotal = estaAtrasado
    ? Number((valorNumerico * Math.pow(1 + taxaDiaria, diasAtraso)).toFixed(2))
    : Number(valorNumerico.toFixed(2));

  const valorJuros = estaAtrasado
    ? Number((valorTotal - valorNumerico).toFixed(2))
    : 0.0;

  return {
    valorOriginal: Number(valorNumerico.toFixed(2)),
    dataVencimento: formatarData(dtVencimento),
    dataCalculo: formatarData(dtHoje),
    diasAtraso,
    taxaDiaria: '2,5% ao dia',
    valorJuros,
    valorTotal,
    status: estaAtrasado ? 'em atraso' : 'em dia'
  };
}

// valida a estrutura de uma lista de titulos enviada por upload
export function validarEstruturaTitulos(titulos) {
  if (!Array.isArray(titulos)) {
    throw new Error("o conteudo deve conter uma lista (array) na propriedade 'titulos'.");
  }

  if (titulos.length === 0) {
    throw new Error('a lista de titulos informada esta vazia.');
  }

  for (const [indice, item] of titulos.entries()) {
    const val = Number(item.valor);
    if (!val || val <= 0 || isNaN(val)) {
      throw new Error(`titulo #${indice + 1}: o campo 'valor' deve ser um numero maior que zero.`);
    }

    if (!item.dataVencimento) {
      throw new Error(`titulo #${indice + 1}: o campo 'dataVencimento' e obrigatorio.`);
    }
  }
}

// calcula juros em lote para uma lista de titulos
export function calcularJurosLote(titulos) {
  validarEstruturaTitulos(titulos);

  let totalOriginal = 0;
  let totalJuros = 0;
  let totalPagar = 0;
  let titulosEmAtraso = 0;
  let titulosEmDia = 0;

  const titulosProcessados = titulos.map((item, indice) => {
    const resultado = calcularJurosAtraso({
      valor: item.valor,
      dataVencimento: item.dataVencimento
    });

    totalOriginal += resultado.valorOriginal;
    totalJuros += resultado.valorJuros;
    totalPagar += resultado.valorTotal;

    if (resultado.status === 'em atraso') {
      titulosEmAtraso += 1;
    } else {
      titulosEmDia += 1;
    }

    return {
      id: item.id || `TIT-${String(indice + 1).padStart(3, '0')}`,
      descricao: item.descricao || `titulo #${indice + 1}`,
      ...resultado
    };
  });

  return {
    resumoGeral: {
      totalOriginal: Number(totalOriginal.toFixed(2)),
      totalJuros: Number(totalJuros.toFixed(2)),
      totalPagar: Number(totalPagar.toFixed(2)),
      totalTitulos: titulos.length,
      titulosEmAtraso,
      titulosEmDia
    },
    titulosProcessados
  };
}
