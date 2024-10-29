const candidatosSegundoTurno = {};

// Função para adicionar atraso
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function buscarCandidatosSegundoTurno() {
  // Carrega o arquivo JSON
  const response = await fetch("idCidades.json");
  const idCidades = await response.json();

  for (const cidade of idCidades) {
    try {
      const endpoint = `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/2024/${cidade.id}/2045202024/11/candidatos`;
      console.log(
        `Buscando dados para (${cidade.id}) ${cidade.cidade} (${cidade.estado}): ${endpoint}`
      );

      //   const response = await fetch(endpoint);
      const response = await fetch(
        `https://cors-anywhere.herokuapp.com/${endpoint}`
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.candidatos && Array.isArray(data.candidatos)) {
        const candidatosNoSegundoTurno = data.candidatos
          .filter((candidato) => candidato.descricaoTotalizacao === "2º turno")
          .map((candidato) => ({
            id: candidato.id,
            nomeUrna: candidato.nomeUrna,
            numero: candidato.numero,
            partido: candidato.partido.sigla,
          }));

        if (candidatosNoSegundoTurno.length > 0) {
          candidatosSegundoTurno[cidade.id] = candidatosNoSegundoTurno;
        }
      }
    } catch (error) {
      console.error(
        `Erro ao buscar candidatos para a cidade ${cidade.cidade} (${cidade.estado}):`,
        error.message || error
      );
    }

    // Atraso de 100 ms entre cada requisição
    // await delay(100);
  }

  console.log("Candidatos no segundo turno:", candidatosSegundoTurno);
}

// Executa a função
buscarCandidatosSegundoTurno();
