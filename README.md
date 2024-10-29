# Eleições 2024 - Dados do TSE

Códigos simples em JavaScript, com apoio do ChatGPT, para visualizar dados das Eleições do Brasil disponíveis no portal DivulgaCand, do TSE.

## Busca por Candidatos
- Busca por cidade (com sugestões), usando dados reais fornecidos pelo TSE (Tribunal Superior Eleitoral)
- Capacidade de filtrar os candidatos pelo cargo (prefeito, vice-prefeito, vereador)
- Perfil resumido dos candidatos
- Perfil completo dos candidatos -- precisa ser refatorado --

To-Do
- Dados financeiros (receitas e despesas) dos candidatos
- Trocar o código fixo de anos pelo requisitado direto ao endpoint do TSE - e atualizar o json com essas informações
- Associar o tipo de eleição ao seletor de ano
- Exibir os cargos de forma dinâmica, a partir do tipo de eleção

## Estatísticas do DivulgaCand
- Checa a última atualização do portal
- Lista a quantidade de candidatos na eleição de 2024, por cargo (prefeito, vice-prefeito e vereador)
- Mostra detalhadamente a quantidade de candidatos, por cargo, em cada Estado do Brasil

## Candidatos por Cidade
- Permite checar a quantidade de candidatos a Prefeito em todas as cidades do Brasil, filtradas por estado
- Lista o nome e o partido de todos os candidatos em todas as cidades
- Mostra, também, os respectivos candidatos a vice-prefeito
- Permite visualizar apenas as cidades com 1 único candidato a prefeito

## Resultados TSE
- Permite filtrar por Estado e Cidade para exibir os resultados do 1º turno
- Lista todos os candidatos por ordem de votos 
- Exibe dados de quando uma cidade não tem resultado por candidato Sob Judice