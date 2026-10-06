// gerenciamento simples de abas
document.addEventListener('DOMContentLoaded', () => {
  inicializarAbas();
  carregarComissoes();
  configurarUploadComissoes();
  carregarEstoque();
  configurarFormularioEstoque();
  configurarFormularioFinanceiro();
});

function inicializarAbas() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // atualiza botoes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // atualiza conteudos
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetTab) {
          content.classList.add('active');
        }
      });
    });
  });
}

// formata valor para padrao de moeda brasileira (r$)
function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// renderiza dados de comissao na tela
function renderizarComissoes(dados) {
  const corpoTabela = document.getElementById('tabela-comissoes-corpo');
  const cardTotalVendas = document.getElementById('card-total-vendas');
  const cardTotalComissao = document.getElementById('card-total-comissao');
  const cardTotalPedidos = document.getElementById('card-total-pedidos');

  const { totalEquipe, vendedores } = dados;

  // atualiza cards de totais
  cardTotalVendas.textContent = formatarMoeda(totalEquipe.totalVendas);
  cardTotalComissao.textContent = formatarMoeda(totalEquipe.totalComissao);
  cardTotalPedidos.textContent = totalEquipe.totalVendasRealizadas;

  // monta as linhas da tabela
  corpoTabela.innerHTML = vendedores.map(item => `
    <tr>
      <td><strong>${item.vendedor}</strong></td>
      <td>${item.quantidadeVendas}</td>
      <td>${formatarMoeda(item.totalVendas)}</td>
      <td><strong>${formatarMoeda(item.totalComissao)}</strong></td>
    </tr>
  `).join('');
}

// busca dados de comissao padrao da api (desafio 1)
async function carregarComissoes() {
  const corpoTabela = document.getElementById('tabela-comissoes-corpo');
  const badgeOrigem = document.getElementById('badge-origem-vendas');
  const btnRestaurar = document.getElementById('btn-restaurar-vendas');
  const feedback = document.getElementById('feedback-upload-vendas');

  try {
    const resposta = await fetch('/api/comissoes');
    const resultado = await resposta.json();

    if (!resultado.sucesso) {
      corpoTabela.innerHTML = '<tr><td colspan="4" class="text-center">erro ao carregar dados.</td></tr>';
      return;
    }

    renderizarComissoes(resultado.dados);

    if (badgeOrigem) {
      badgeOrigem.textContent = 'origem: dados padrao (vendas.json)';
      badgeOrigem.classList.remove('customizado');
    }
    if (btnRestaurar) {
      btnRestaurar.style.display = 'none';
    }
    if (feedback) {
      feedback.style.display = 'none';
    }

  } catch (error) {
    corpoTabela.innerHTML = '<tr><td colspan="4" class="text-center">erro na comunicaçao com a api.</td></tr>';
  }
}

// configura o upload e leitura de um json diferente para recalcular comissoes
function configurarUploadComissoes() {
  const inputArquivo = document.getElementById('input-json-vendas');
  const btnRestaurar = document.getElementById('btn-restaurar-vendas');
  const badgeOrigem = document.getElementById('badge-origem-vendas');
  const feedback = document.getElementById('feedback-upload-vendas');

  if (!inputArquivo) return;

  // evento de selecao de arquivo
  inputArquivo.addEventListener('change', async (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    feedback.className = 'feedback-msg';
    feedback.style.display = 'none';

    try {
      // le o arquivo como texto
      const texto = await arquivo.text();
      let jsonParsed;

      try {
        jsonParsed = JSON.parse(texto);
      } catch (e) {
        throw new Error('o arquivo selecionado nao contem um json valido.');
      }

      // envia para a api processar e calcular comissoes
      const resposta = await fetch('/api/comissoes/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonParsed)
      });

      const resultado = await resposta.json();

      if (!resultado.sucesso) {
        feedback.className = 'feedback-msg erro';
        feedback.textContent = resultado.mensagem;
        feedback.style.display = 'block';
        return;
      }

      // renderiza o novo resultado na tela
      renderizarComissoes(resultado.dados);

      // atualiza badge e botao de restaurar
      badgeOrigem.textContent = `origem: ${arquivo.name} (${resultado.dados.totalEquipe.totalVendasRealizadas} vendas)`;
      badgeOrigem.classList.add('customizado');
      btnRestaurar.style.display = 'inline-flex';

      feedback.className = 'feedback-msg sucesso';
      feedback.textContent = `sucesso: arquivo '${arquivo.name}' carregado e comissoes recalculadas!`;
      feedback.style.display = 'block';

    } catch (erro) {
      feedback.className = 'feedback-msg erro';
      feedback.textContent = erro.message;
      feedback.style.display = 'block';
    } finally {
      inputArquivo.value = '';
    }
  });

  // evento de restaurar dados padrao
  if (btnRestaurar) {
    btnRestaurar.addEventListener('click', () => {
      carregarComissoes();
    });
  }
}

// busca dados de estoque da api e preenche dropdown e tabela (desafio 2)
async function carregarEstoque() {
  const selectProduto = document.getElementById('select-produto');
  const corpoEstoque = document.getElementById('tabela-estoque-corpo');
  const corpoHistorico = document.getElementById('tabela-historico-corpo');

  try {
    const resposta = await fetch('/api/estoque');
    const resultado = await resposta.json();

    if (!resultado.sucesso) {
      corpoEstoque.innerHTML = '<tr><td colspan="3" class="text-center">erro ao consultar estoque.</td></tr>';
      return;
    }

    const { produtos, historico } = resultado.dados;

    // preenche select de produtos
    selectProduto.innerHTML = '<option value="">selecione um produto...</option>' +
      produtos.map(p => `
        <option value="${p.codigoProduto}">${p.codigoProduto} - ${p.descricaoProduto} (saldo: ${p.estoque})</option>
      `).join('');

    // preenche tabela de saldos atuais
    corpoEstoque.innerHTML = produtos.map(p => `
      <tr>
        <td>${p.codigoProduto}</td>
        <td><strong>${p.descricaoProduto}</strong></td>
        <td><strong>${p.estoque}</strong> un.</td>
      </tr>
    `).join('');

    // preenche tabela de historico
    if (!historico || historico.length === 0) {
      corpoHistorico.innerHTML = '<tr><td colspan="7" class="text-center">nenhuma movimentaçao realizada ainda.</td></tr>';
    } else {
      corpoHistorico.innerHTML = historico.map(h => `
        <tr>
          <td>#${h.idMovimentacao}</td>
          <td>${h.dataHora}</td>
          <td>${h.descricaoProduto}</td>
          <td>
            <span class="${h.tipo === 'ENTRADA' ? 'badge-entrada' : 'badge-saida'}">
              ${h.tipo}
            </span>
          </td>
          <td>${h.quantidade}</td>
          <td><strong>${h.estoqueFinal}</strong></td>
          <td>${h.descricao}</td>
        </tr>
      `).join('');
    }

  } catch (error) {
    corpoEstoque.innerHTML = '<tr><td colspan="3" class="text-center">erro ao comunicar com o servidor.</td></tr>';
  }
}

// configura o formulario de lancamento de estoque (desafio 2)
function configurarFormularioEstoque() {
  const form = document.getElementById('form-movimentacao');
  const feedback = document.getElementById('feedback-movimentacao');

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const codigoProduto = Number(document.getElementById('select-produto').value);
    const tipo = document.getElementById('select-tipo').value;
    const quantidade = Number(document.getElementById('input-quantidade').value);
    const descricao = document.getElementById('input-descricao').value;

    feedback.className = 'feedback-msg';
    feedback.style.display = 'none';

    try {
      const resposta = await fetch('/api/estoque/movimentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoProduto, tipo, quantidade, descricao })
      });

      const resultado = await resposta.json();

      if (!resultado.sucesso) {
        feedback.className = 'feedback-msg erro';
        feedback.textContent = resultado.mensagem;
        feedback.style.display = 'block';
        return;
      }

      const { movimentacao, estoqueFinal } = resultado.dados;

      feedback.className = 'feedback-msg sucesso';
      feedback.textContent = `sucesso: movimentaçao #${movimentacao.idMovimentacao} registrada! estoque final: ${estoqueFinal} un.`;
      feedback.style.display = 'block';

      // limpa campos e atualiza dados em tela
      document.getElementById('input-quantidade').value = '';
      document.getElementById('input-descricao').value = '';
      carregarEstoque();

    } catch (error) {
      feedback.className = 'feedback-msg erro';
      feedback.textContent = 'erro ao enviar movimentaçao ao servidor.';
      feedback.style.display = 'block';
    }
  });
}

// configura o formulario de calculo de juros (desafio 3)
function configurarFormularioFinanceiro() {
  const form = document.getElementById('form-financeiro');
  const feedback = document.getElementById('feedback-financeiro');
  const placeholder = document.getElementById('placeholder-financeiro');
  const detalhes = document.getElementById('detalhes-financeiro');

  // elementos de resultado
  const badgeStatus = document.getElementById('res-status-badge');
  const resValorOriginal = document.getElementById('res-valor-original');
  const resDataVencimento = document.getElementById('res-data-vencimento');
  const resDataCalculo = document.getElementById('res-data-calculo');
  const resDiasAtraso = document.getElementById('res-dias-atraso');
  const resValorJuros = document.getElementById('res-valor-juros');
  const resValorTotal = document.getElementById('res-valor-total');

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const valor = Number(document.getElementById('input-valor').value);
    const dataVencimento = document.getElementById('input-vencimento').value;

    feedback.className = 'feedback-msg';
    feedback.style.display = 'none';

    try {
      const resposta = await fetch('/api/financeiro/calcular-juros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor, dataVencimento })
      });

      const resultado = await resposta.json();

      if (!resultado.sucesso) {
        feedback.className = 'feedback-msg erro';
        feedback.textContent = resultado.mensagem;
        feedback.style.display = 'block';
        return;
      }

      const dados = resultado.dados;

      // preenche os dados calculados na tela
      resValorOriginal.textContent = formatarMoeda(dados.valorOriginal);
      resDataVencimento.textContent = dados.dataVencimento;
      resDataCalculo.textContent = dados.dataCalculo;
      resDiasAtraso.textContent = `${dados.diasAtraso} ${dados.diasAtraso === 1 ? 'dia' : 'dias'}`;
      resValorJuros.textContent = formatarMoeda(dados.valorJuros);
      resValorTotal.textContent = formatarMoeda(dados.valorTotal);

      // atualiza badge de status
      if (dados.status === 'em atraso') {
        badgeStatus.className = 'badge-status em-atraso';
        badgeStatus.textContent = 'em atraso';
      } else {
        badgeStatus.className = 'badge-status em-dia';
        badgeStatus.textContent = 'em dia';
      }

      // exibe os detalhes
      placeholder.style.display = 'none';
      detalhes.style.display = 'block';

    } catch (error) {
      feedback.className = 'feedback-msg erro';
      feedback.textContent = 'erro ao calcular juros no servidor.';
      feedback.style.display = 'block';
    }
  });
}
