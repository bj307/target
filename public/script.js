// gerenciamento simples de abas
document.addEventListener('DOMContentLoaded', () => {
  inicializarAbas();
  carregarComissoes();
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

// busca dados de comissao da api e renderiza na tela
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
