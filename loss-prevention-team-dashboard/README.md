# Central Prevenção de Perdas

Painel de gestão da equipe de Prevenção de Perdas (Loss Prevention) em um único
arquivo HTML autocontido — sem servidor, sem dependências.

## O que tem

Para cada colaborador:

- **Identificação e contato** — matrícula (gerada automaticamente), nome, cargo,
  função, unidade/loja, gestor direto, telefone, contato de emergência
  (nome, parentesco e telefone), data de admissão e status (Ativo / Afastado / Inativo).
- **Documentos & vencimentos** — CNH (número, categoria e validade), ASO
  (Atestado de Saúde Ocupacional), treinamento/reciclagem técnica e
  antecedentes/certidão, cada um com data de validade.
- **Férias** — período aquisitivo, dias de direito, dias já gozados, próximas
  férias agendadas e cálculo automático do saldo e do **prazo legal de
  concessão** (fim do período aquisitivo + 11 meses, conforme CLT).
- **Equipamentos** — notebook, celular corporativo, monitor, mouse, teclado,
  veículo, crachá de acesso, rádio/HT e uniforme/colete, mais campo livre de
  identificação/patrimônio e outros equipamentos.
- **Pendências & observações** — sinalizador de pendência aberta com descrição
  e campo de observações livres.

O painel calcula automaticamente:

- 4 indicadores (efetivo ativo, documentos em atenção/vencidos, férias com
  prazo próximo, pendências abertas);
- um gráfico de distribuição de status dos documentos;
- selos de status por colaborador (Em dia / Atenção / Crítico / Vencido),
  usando os limites: crítico = vencido ou até 7 dias; atenção = até 30 dias.

Busca por nome, matrícula, cargo, função ou gestor, além de filtros por status
e por situação de documentos.

## Como usar

Basta abrir `index.html` em qualquer navegador. Não precisa de build, servidor
ou instalação — é uma página HTML/CSS/JS única.

Se aberto como Artifact do Claude (via o link compartilhado), o painel é um
**documento vivo**: adicionar, editar ou remover colaboradores fica salvo
automaticamente para quem tiver o link. Aberto localmente como arquivo, ele
funciona como um formulário comum — as edições existem apenas naquela sessão
do navegador.

## Dados de exemplo

O arquivo já vem com 6 colaboradores fictícios cobrindo os principais cargos
de uma equipe de Prevenção de Perdas (gerente, supervisor, analistas e
agentes), com datas variadas para ilustrar os três status de vencimento e um
caso de colaboradora afastada — use "+ Novo colaborador" para substituir pelos
dados reais da sua equipe.
