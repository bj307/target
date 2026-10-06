// gerenciamento simples de abas
document.addEventListener('DOMContentLoaded', () => {
  inicializarAbas();
  carregarComissoes();
  carregarEstoque();
  configurarFormularioEstoque();
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

// busca dados de comissao da api e renderiza na tela (desafio 1)
async function carregarComissoes() {
  const corpoTabela = document.getElementById('tabela-comissoes-corpo');
  const cardTotalVendas = document.getElementById('card-total-vendas');
  const cardTotalComissao = document.getElementById('card-total-comissao');
  const cardTotalPedidos = document.getElementById('card-total-pedidos');

  try {
    const resposta = await fetch('/api/comissoes');
    const resultado = await resposta.json();

    if (!resultado.sucesso) {
      corpoTabela.innerHTML = '<tr><td colspan="4" class="text-center">erro ao carregar dados.</td></tr>';
      return;
    }

    const { totalEquipe, vendedores } = resultado.dados;

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

  } catch (error) {
    corpoTabela.innerHTML = '<tr><td colspan="4" class="text-center">erro na comunicaçao com a api.</td></tr>';
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

// configura o formulario de lancamento de estoque
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
