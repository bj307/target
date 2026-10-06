# Desafio Técnico - Target Sistemas

Projeto desenvolvido para o desafio técnico da Target Sistemas, contemplando as três funcionalidades solicitadas em uma aplicação web integrada.

---

## 💻 Tecnologias Utilizadas

- **Backend:** Node.js com Express
- **Frontend:** HTML5, CSS3 e JavaScript (Vanilla)
- **Persistência / Dados:** Arquivos JSON

---

## 🎯 Decisão Técnica

A opção pela stack adotada foi utilizar as tecnologias listadas como diferenciais da vaga por já possuir experiência profissional clara nos requisitos e qualificações principais.

A experiência prática nos conhecimentos diferenciais pode ser comprovada tanto pela implementação deste desafio quanto pelos projetos públicos desenvolvidos de forma autônoma, apresentados no currículo.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado no computador (versão 18 ou superior)

### Instalação e execução

1. Clone o repositório ou acesse a pasta do projeto:
```bash
cd "Desafio target"
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```
*(ou `npm run dev` para rodar com recarregamento automático)*

4. Abra no navegador:
```
http://localhost:3000
```

---

## 📌 Funcionalidades

A aplicação possui 3 abas principais para navegar entre os desafios:

### 1. Comissões de Vendas (Desafio 1)
- Calcula o total de vendas e comissões da equipe e de cada vendedor individualmente.
- Aplica as regras de comissão por venda:
  - Menor que R$ 100,00: sem comissão (0%)
  - De R$ 100,00 até R$ 499,99: 1% de comissão
  - A partir de R$ 500,00: 5% de comissão
- Possui botão para upload de arquivo JSON com vendas personalizadas e botão para restaurar os dados padrão.

### 2. Controle de Estoque (Desafio 2)
- Gerenciamento de entradas e saídas de mercadorias.
- Não permite registrar saídas maiores que o saldo disponível (evita estoque negativo).
- Registra histórico de cada movimentação realizada com data, tipo e saldo resultante.
- Permite carregar um JSON customizado de estoque e restaurar a lista original.

### 3. Cálculo de Juros por Atraso (Desafio 3)
- Calcula os juros de títulos vencidos com a taxa de 2,5% ao dia sobre o saldo acumulado (juros compostos).
- Títulos em dia ou com vencimento futuro não recebem cobrança de juros.
- Permite fazer o cálculo individual preenchendo o formulário ou fazer o cálculo em lote enviando um arquivo JSON com vários títulos.

---

## 📂 Arquivos de Teste

Na pasta `src/data/` estão disponíveis arquivos JSON de exemplo que podem ser utilizados para testar a funcionalidade de upload em cada tela:

- `src/data/vendas.json` - lista de vendas para o Desafio 1
- `src/data/estoque.json` - lista de produtos para o Desafio 2
- `src/data/titulos.json` - lista de títulos com vencimentos variados para o Desafio 3
