// Função auxiliar para formatar números de acordo com o locale pt-BR
function formatarNumero(numero) {
  return new Intl.NumberFormat("pt-BR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);
}

// Função para buscar candidatos do arquivo JSON
async function buscarCandidatos() {
  try {
    const response = await fetch("CandidatosSegundoTurno.json"); // Carrega o JSON com os candidatos
    if (!response.ok) {
      throw new Error("Erro ao acessar o JSON dos candidatos");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return {}; // Retorna um objeto vazio em caso de erro
  }
}

// Função para buscar as despesas de cada candidato
async function buscarDespesas() {
  const candidatos = await buscarCandidatos(); // Busca os candidatos
  const resultadosPorCidade = {}; // Objeto para armazenar resultados por cidade
  const idCidades = await buscarIdCidades(); // Busca o JSON com os IDs das cidades

  for (const [chaveidCidade, listaCandidatos] of Object.entries(candidatos)) {
    resultadosPorCidade[chaveidCidade] = []; // Inicializa um array para a cidade

    for (const candidato of listaCandidatos) {
      const { id, numero } = candidato;
      const url = `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/prestador/consulta/2045202024/2024/${chaveidCidade}/11/${numero}/${numero}/${id}`;

      try {
        // Usando CORS Anywhere para evitar problemas de CORS
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Erro ao acessar o endpoint para o candidato ${candidato.nomeUrna}`
          );
        }

        const data = await response.json();

        // Extrair os dados de despesas
        const despesas = data.despesas;
        const dadosConsolidados = data.dadosConsolidados;
        const despesasInfo = {
          nomeUrna: candidato.nomeUrna,
          partido: candidato.partido,
          limiteDeGasto1T: formatarNumero(despesas.limiteDeGasto1T),
          limiteDeGasto2T: formatarNumero(despesas.limiteDeGasto2T),
          valorLimiteDeGastos: formatarNumero(despesas.valorLimiteDeGastos),
          totalDespesasContratadas: formatarNumero(
            despesas.totalDespesasContratadas
          ),
          totalDespesasPagas: formatarNumero(despesas.totalDespesasPagas),
          receitasPF: formatarNumero(dadosConsolidados.totalReceitaPF),
        };

        // Adiciona as informações de despesas ao array da cidade
        resultadosPorCidade[chaveidCidade].push(despesasInfo);
      } catch (error) {
        console.error(
          `Erro ao buscar despesas para o candidato ${candidato.nomeUrna} - ${url}:`,
          error
        );
      }
      sleepFor(20000);
    }
  }

  // Exibe os resultados agrupados por cidade
  console.log(resultadosPorCidade);
  exibirResultadosEmHTML(resultadosPorCidade, idCidades);
}

// Função para buscar o JSON com os IDs das cidades
async function buscarIdCidades() {
  try {
    const response = await fetch("idCidades.json");
    if (!response.ok) {
      throw new Error("Erro ao acessar o JSON das cidades");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return []; // Retorna um array vazio em caso de erro
  }
}

// Função para exibir resultados em HTML
function exibirResultadosEmHTML(resultados, idCidades) {
  const container = document.getElementById("resultados"); // Certifique-se de ter um elemento com id 'resultados' no seu HTML
  container.innerHTML = ""; // Limpa qualquer conteúdo existente

  for (const [chaveidCidade, despesas] of Object.entries(resultados)) {
    // Busca o nome e estado da cidade correspondente ao id
    const cidadeInfo = idCidades.find((cidade) => cidade.id === chaveidCidade);
    const cidadeNomeEstado = cidadeInfo
      ? `${cidadeInfo.cidade} (${cidadeInfo.estado})`
      : `Cidade Desconhecida`;

    const cidadeDiv = document.createElement("div");
    cidadeDiv.className = "cidade"; // Classe para estilo opcional
    cidadeDiv.innerHTML = `<h2>Cidade: ${cidadeNomeEstado}</h2>`; // Título da cidade

    const listaDespesas = document.createElement("ul"); // Lista para despesas
    despesas.forEach((d) => {
      const candidatoItem = document.createElement("li");
      candidatoItem.innerHTML = `<strong>${d.nomeUrna} (${d.partido})</strong>`; // Nome e partido do candidato

      const despesasList = document.createElement("ul"); // Lista interna para as despesas
      // Adiciona cada despesa como um item na lista interna
      for (const [key, value] of Object.entries(d)) {
        if (key !== "nomeUrna" && key !== "partido") {
          const despesaItem = document.createElement("li");
          despesaItem.innerHTML = `${key.replace(
            /([A-Z])/g,
            " $1"
          )}: R$ ${value}`; // Formata a chave
          despesasList.appendChild(despesaItem);
        }
      }

      candidatoItem.appendChild(despesasList); // Adiciona a lista de despesas ao item do candidato
      listaDespesas.appendChild(candidatoItem); // Adiciona o item do candidato à lista de despesas
    });

    cidadeDiv.appendChild(listaDespesas); // Adiciona a lista de despesas à div da cidade
    container.appendChild(cidadeDiv); // Adiciona a div da cidade ao container
  }
}

function sleepFor(sleepDuration) {
  const now = new Date().getTime();
  while (new Date().getTime() < now + sleepDuration) {
    /* Do nothing */
  }
}
// Chamada da função para buscar despesas
buscarDespesas();
