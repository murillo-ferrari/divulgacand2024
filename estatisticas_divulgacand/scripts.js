function formatNumber(number) {
    return number.toLocaleString('pt-BR');
}

document.addEventListener('DOMContentLoaded', () => {
    const url = "https://divulgacandcontas.tse.jus.br/divulga/rest/v1/eleicao/eleicao-atual?idEleicao=2045202024";

    function fetchElectionData() {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Atualiza dataBaseUpdate
                const dataBaseUpdateElement = document.querySelector('.dataBaseUpdate p');
                if (dataBaseUpdateElement) {
                    dataBaseUpdateElement.textContent = data.dataBaseUpdate;
                } else {
                    console.error('Elemento dataBaseUpdate não encontrado');
                }

                const divisors = { 11: 5569, 12: 5569, 13: 58464 };

                // Atualiza resumoCandidaturas
                const resumoCandidaturasElement = document.querySelector('.resumoCandidaturas');
                if (resumoCandidaturasElement) {
                    resumoCandidaturasElement.innerHTML = '<h2>Candidaturas</h2>';

                    const totalContagem = data.resumoCandidaturas.map((candidatura, index) => {
                        const candidaturaDiv = document.createElement('div');

                        const divisor = divisors[candidatura.codigo] || 1;
                        const candidatePerSpot = candidatura.contagem / divisor;

                        candidaturaDiv.innerHTML = `
                            <div class="cargo"><b>${candidatura.nome}: </b>
                                <span>${formatNumber(candidatura.contagem)}</span>
                                <span>(${formatNumber(candidatePerSpot)} cand/vaga)</span>
                            </div>
                        `;
                        resumoCandidaturasElement.appendChild(candidaturaDiv);

                        // Retorna o valor da contagem para ser somado
                        return candidatura.contagem;
                    }).reduce((total, contagem) => total + contagem, 0);

                    // Exibe o total
                    const totalDiv = document.createElement('div');
                    totalDiv.innerHTML = `<div class="total">Total: ${formatNumber(totalContagem)}</div>`;
                    resumoCandidaturasElement.appendChild(totalDiv);
                } else {
                    console.error('Elemento resumoCandidaturas não encontrado');
                }

                // Verifica se ues é um array e possui elementos
                if (Array.isArray(data.ues) && data.ues.length > 0) {
                    const cargosPorSigla = {};

                    // Utiliza map para iterar sobre cada ue em data.ues
                    data.ues.map(ue => {
                        if (ue.cargos && Array.isArray(ue.cargos)) {
                            ue.cargos.map(cargo => {
                                if (!cargosPorSigla[cargo.sigla]) {
                                    cargosPorSigla[cargo.sigla] = {
                                        Prefeito: 0,
                                        "Vice-prefeito": 0,
                                        Vereador: 0
                                    };
                                }
                                if (cargo.nome === "Prefeito" || cargo.nome === "Vice-prefeito" || cargo.nome === "Vereador") {
                                    cargosPorSigla[cargo.sigla][cargo.nome] += cargo.contagem;
                                }
                            });
                        }
                    });

                    // Exibir os resultados no console ou no DOM
                    // for (const sigla in cargosPorSigla) {
                    //     console.log(`UF: ${sigla}`);
                    //     console.log(`  Prefeito: ${cargosPorSigla[sigla].Prefeito}`);
                    //     console.log(`  Vice-prefeito: ${cargosPorSigla[sigla]["Vice-prefeito"]}`);
                    //     console.log(`  Vereador: ${cargosPorSigla[sigla].Vereador}`);
                    // }

                    // Exibir os resultados no DOM
                    const resumoCargosElement = document.querySelector('.candidaturasPorEstado');
                    if (resumoCargosElement) {
                        resumoCargosElement.innerHTML = '<h2>Candidatos por UF</h2>';
                        for (const sigla in cargosPorSigla) {
                            const cargoDiv = document.createElement('div');
                            cargoDiv.className = 'UFsWrapper';
                            cargoDiv.innerHTML = `
                                <div class="UFsData">
                                    <div><strong>UF:</strong> ${sigla}</div>
                                    <div><strong>Prefeito:</strong> ${formatNumber(cargosPorSigla[sigla].Prefeito)}</div>
                                    <div><strong>Vice-prefeito:</strong> ${formatNumber(cargosPorSigla[sigla]["Vice-prefeito"])}</div>
                                    <div><strong>Vereador:</strong> ${formatNumber(cargosPorSigla[sigla].Vereador)}</div>
                                </div>
                            `;
                            resumoCargosElement.appendChild(cargoDiv);
                        }
                    } else {
                        console.error('Elemento resumoCargos não encontrado');
                    }
                } else {
                    console.error('O array ues está vazio ou não foi encontrado.');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar os dados:', error);
            });
    }

    fetchElectionData();
});
