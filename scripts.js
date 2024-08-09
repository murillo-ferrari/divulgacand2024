document.addEventListener("DOMContentLoaded", () => {
    const candidatesContainer = document.getElementById("candidates-container");
    const totalCandidates     = document.getElementById('totalCandidates');
    const printButton         = document.getElementById("print-button");
    const searchBox           = document.getElementById('searchBox');
    const suggestions         = document.getElementById('suggestions');
    const clearButton         = document.getElementById('clearButton');
    const electionYearList    = document.getElementById('electionYearList')
    const searchResult        = [];
    const electionYearData    = [];
    const tseElectionData     = [
        {id:2045202024,ano:2024,nomeEleicao:"Eleições Municipais 2024",tipoEleicao:"O",tipoAbrangencia:"M",dataEleicao:2024-10-06,},
        {id:2040602022,ano:2022,nomeEleicao:"Eleição Geral Federal 2022",tipoEleicao:"O",tipoAbrangencia:"F",dataEleicao:2022-10-02,},
        //{id:2032002020,ano:2020,nomeEleicao:"Eleições Municipais 2020 - AP",tipoEleicao:"O",tipoAbrangencia:"M",dataEleicao:2020-11-14,},
        {id:2030402020,ano:2020,nomeEleicao:"Eleições Municipais 2020",tipoEleicao:"O",tipoAbrangencia:"M",dataEleicao:2020-11-15,},
        {id:2022802018,ano:2018,nomeEleicao:"Eleição Geral Federal 2018",tipoEleicao:"O",tipoAbrangencia:"F",dataEleicao:2018-10-07,},
        {id:2,ano:2016,nomeEleicao:"Eleições Municipais 2016",tipoEleicao:"O",tipoAbrangencia:"M",dataEleicao:2016-10-02,},
        {id:680,ano:2014,nomeEleicao:"Eleições Gerais 2014",tipoEleicao:"O",tipoAbrangencia:"F",dataEleicao:2014-10-05,},
        {id:1699,ano:2012,nomeEleicao:"Eleição Municipal 2012",tipoEleicao:"O",tipoAbrangencia:"M",dataEleicao:2012-10-07,},
        {id:14417,ano:2010,nomeEleicao:"Eleições 2010",tipoEleicao:"O",tipoAbrangencia:"F",dataEleicao:null,},
        {id:14422,ano:2008,nomeEleicao:"Eleições 2008",tipoEleicao:"O",tipoAbrangencia:"M",dataEleicao:2008-10-05,},
        {id:14423,ano:2006,nomeEleicao:"Eleições 2006",tipoEleicao:"O",tipoAbrangencia:"F",dataEleicao:null,},
        {id:14431,ano:2004,nomeEleicao:"Eleições 2004",tipoEleicao:"O",tipoAbrangencia:"M",dataEleicao:null,}
    ]

    let selectedCandidates    = [];
    let candidatesData        = [];
    let partido               = [];
    let officeId              = null;
    let locationCode          = null;
    let electionYear          = null;
    let electionCode          = null;

    /**
     * Fetches and displays candidates based on the selected location and office.
     * 
     * @param {string} locationCode - The code of the selected location.
     * @param {string} officeId - The id of the selected office.
     */
    function fetchCandidates() {
        if (locationCode && officeId) {
            const endpoint = `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/${electionYear}/${locationCode}/${electionCode}/${officeId}/candidatos`;

            fetch(endpoint)
                .then(response => response.json())
                .then(data => {
                    candidatesData = data.candidatos;
                    candidatesContainer.innerHTML = '';
                    totalCandidates.innerHTML = candidatesData.length;
                    candidatesData.forEach(candidate => {
                        const card = document.createElement("div");
                        card.className = "divulga-Cand__candidate-card";
                        card.innerHTML = `
                            <div class="divulga-Cand__candidate-card--name">
                                <h2>${candidate.nomeUrna}</h2>
                            </div>
                            <div class="divulga-Cand__candidate-card--wrapper">                            
                                <div class="divulga-Cand__candidate-card--personalPicture">
                                    <img src="https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/${electionCode}/${candidate.id}/${locationCode}" alt="${candidate.nomeUrna}" class="candidate-photo">
                                </div>
                                <div class="divulga-Cand__candidate-card--minData">
                                    <p><strong>Partido:</strong> ${candidate.partido.sigla}</p>
                                    <p><strong>Número:</strong> ${candidate.numero}</p>
                                    <label class="print-label">
                                        <input type="checkbox" class="print-checkbox" data-id="${candidate.id}">
                                        Perfil Completo
                                    </label>
                                </div>
                            </div>
                        `;
                        candidatesContainer.appendChild(card);
                    });

                    document.querySelectorAll(".print-checkbox").forEach(checkbox => {
                        checkbox.addEventListener("change", handleCheckboxChange);
                    });
                })
                .catch(error => {
                    console.error("Erro ao buscar candidatos:", error);
                    alert("Ocorreu um erro ao buscar candidatos. Por favor, tente novamente.");
                });
        }
    }

    /**
     * Handles candidate checkbox changes.
     * 
     * @param {Event} event - The event object.
     */
    function handleCheckboxChange(event) {
        const candidateId = event.target.dataset.id;

        if (event.target.checked) {
            if (selectedCandidates.length <= 20) {
                selectedCandidates.push(candidateId);
            } else {
                event.target.checked = false;
                alert("Você pode visualizar no máximo 20 candidatos.");
            }
        } else {
            selectedCandidates = selectedCandidates.filter(id => id !== candidateId);
        }

        printButton.style.display = (selectedCandidates.length >= 1 && selectedCandidates.length <= 20) ? "block" : "none";
    }

    /**
     * Displays location suggestions.
     * 
     * @param {Object} locations - The unique locations.
     * @param {string} query - The search query.
     */
    function displaySuggestions(locations, query) {
        suggestions.innerHTML = '';
        if (query.length >= 2) {
            const filteredLocations = Object.keys(locations).filter(location =>
                removeDiacritics(location.toLowerCase()).includes(removeDiacritics(query.toLowerCase())));

            filteredLocations.forEach(location => {
                const li = document.createElement('li');
                li.textContent = location;
                li.addEventListener('click', () => {
                    searchBox.value = location;
                    locationCode = locations[location];
                    suggestions.innerHTML = '';
                    fetchCandidates();
                    if (officeId) {
                        updateSearchResult();
                    }
                });
                suggestions.appendChild(li);
            });
        }
    }

    /**
     * Removes diacritics from a string.
     * 
     * @param {string} str - The input string.
     * @returns {string} - The string without diacritics.
     */
    function removeDiacritics(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
 
    /**
     * Convert a date string to brazilian format
     * 
     * @param {string} dateString - The input string.
     * @returns {string} - The string in brazilian format.
     */
    function formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    /**
     * Convert a numeral string to brazilian currency format
     * 
     * @param {string} value - The input string.
     * @returns {string} - The string in brazilian currency format.
     */
    function formatCurrency(value) {
        return typeof value === 'number' ? value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }) : '';
    }

    // Print selected candidates
    window.printSelected = function () {
        if (locationCode && officeId) {
            const detailedEndpoints = selectedCandidates.map(id => `
                https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/buscar/${electionYear}/${locationCode}/${electionCode}/candidato/${id}`);

            // const detailedIncomeAndExpenses = selectedCandidates.map(numero, id => `
            //     https://divulgacandcontas.tse.jus.br/divulga/rest/v1/prestador/consulta/2045202024/20024/
            //         ${locationCode}/${officeId}/50/${numero}/${id}`);

            Promise.all(detailedEndpoints.map(url => fetch(url).then(response => response.json())))
                .then(detailedDataArray => {
                    console.log(detailedDataArray);
                    console.log(detailedDataArray.map(node => `${partido.sigla}`));

                    // console.log(detailedIncomeAndExpenses);
                    const printContent = document.createElement("div");
                    printContent.className = "container-card__completeData";
                    detailedDataArray.forEach(candidate => {
                        const formattedDate = formatDate(candidate.dataDeNascimento);
                        // const formattedTotalExpense = formatCurrency(candidate.gastoCampanha);
                        // const formatted1TExpense    = formatCurrency(candidate.gastoCampanha1T);
                        // const formatted2TExpense    = formatCurrency(candidate.gastoCampanha2T);
                        const formattedTotalAssets  = formatCurrency(candidate.totalDeBens);
                        const deputyCandidates = candidate.vices ? candidate.vices.map(node => `${node.nm_URNA} (${node.sg_PARTIDO})`) : [];
                        const candidateAssets = candidate.bens 
                        ? candidate.bens
                            .sort((a, b) => a.ordem - b.ordem)
                            .map(node => `
                                <li>${node.descricaoDeTipoDeBem}</li>
                                    <ul>
                                        <li class="assetOrder">${node.ordem}</li>
                                        <li>${node.descricao}</li>
                                        <li>${formatCurrency(node.valor)}</li>
                                    </ul>
                                </li>
                            `)
                            .join('') 
                        : '';

                        const candidateCard = `
                            <div class="card__completeData">
                                <div class="card_completeData--nameAndParty">
                                    <h2>${candidate.nomeUrna} - ${candidate.numero}</h2>
                                </div>
                                <div class="card__completeData--wrapper">
                                    <div class="card__completeData--personalPicture">
                                        <img src="${candidate.fotoUrl || 'https://via.placeholder.com/150'}" alt="${candidate.nomeUrna}" class="candidate-photo">
                                    </div>
                                    <div class="card__completeData--completeData">
                                        <h3>Partido: ${candidate.partido.sigla}</h3>
                                        <p><strong>Gênero:</strong> ${candidate.descricaoSexo}</p>
                                        <p><strong>Naturalidade:</strong> ${candidate.nomeMunicipioNascimento}, ${candidate.sgUfNascimento}</p>
                                        <p><strong>Cor / Raça:</strong> ${candidate.descricaoCorRaca}</p>
                                        <p><strong>Estado Civil:</strong> ${candidate.descricaoEstadoCivil}</p>
                                        <p><strong>Grau de Instrução:</strong> ${candidate.grauInstrucao}</p>
                                        <p><strong>Data de Nascimento:</strong> ${formattedDate}</p>
                                        <p><strong>Nome da Coligação:</strong> ${candidate.nomeColigacao}</p>
                                        <p><strong>Composição Coligação:</strong> ${candidate.composicaoColigacao}</p>
                                        <p><strong>Vice:</strong> ${deputyCandidates}</p>
                                        <br />
                                        <p><strong>Bens do Candidato:</strong> 
                                            <ul>${candidateAssets}</ul>
                                        </p>
                                        <p><strong>Total de Bens:</strong> ${formattedTotalAssets}</p>
                                    </div>
                                </div>
                            </div>
                        `;
                        printContent.innerHTML += candidateCard;
                    });

                    const printWindow = window.open("", "_blank");
                    printWindow.document.write(`
                        <html>
                            <head>
                                <title>Candidatos 2024 | Detalhes</title>
                                <style>
                                    body { font-family: Arial, sans-serif; padding: 20px; display: grid; 
                                        grid-template-columns: repeat(auto-fit, minmax(calc(33% - 16px), 1fr)); min-width: 310px; }
                                    .container-card__completeData { display: flex; }
                                    .card__completeData { 
                                     border: 1px solid #ddd; padding: 20px; margin: 20px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); 
                                        border-radius: 8px; min-width: 310px; }
                                    .card_completeData--nameAndParty { width: 100%; }
                                    .card__completeData--personalPicture { margin-bottom: 16px; }
                                    .card__completeData--completeData { /*width: 50%;*/ }
                                    .card__completeData h2 { margin: 8px; font-size: 1.5em; }
                                    .card__completeData h3 { margin: 0; }
                                    .card__completeData p { margin: 10px 0; }
                                    .candidate-photo { width: 200px; height: auto; display: block; margin: 0 auto; }
                                    .assetOrder { display: none;}
                                </style>
                            </head>
                            <body>${printContent.innerHTML}</body>
                        </html>
                    `);
                    printWindow.document.close();
                    //printWindow.print();
                })
                .catch(error => {
                    console.error("Erro ao buscar dados detalhados:", error);
                    alert("Ocorreu um erro ao buscar dados detalhados. Por favor, tente novamente.");
                });
        }
    };

    // Fetch and handle location suggestions
    fetch('municipios-2024.json')
        .then(response => response.json())
        .then(data => {
            const uniqueLocations = getUniqueLocations(data);
            searchBox.addEventListener('input', () => displaySuggestions(uniqueLocations, searchBox.value));
        });

    /**
     * Fetches and handles location suggestions.
     * 
     * @param {Object} data - The fetched data.
     */
    function getUniqueLocations(data) {
        return data.reduce((locationMap, item) => {
            const location = `${item.NOM_LOCALIDADE} (${item.UF})`;
            if (!locationMap[location]) {
                locationMap[location] = item.COD_LOCALIDADE;
            }
            return locationMap;
        }, {});
    }

    // Handle election Year selection
    electionYearList.addEventListener('change', function() {
        const selectedYear = this.value;
        const election = tseElectionData.find(el => el.ano == selectedYear);
    
        if (election) {
            electionYear = election.ano;
            electionCode = election.id;
            document.querySelectorAll(".print-checkbox").forEach(checkbox => {
                checkbox.checked = false;
            });
            fetchCandidates();
        } else {
            console.log('No election data found for the selected year.');
        }
        updateElectionData();
    });

    // Handle office checkboxes
    document.querySelectorAll('.checkbox-buttons__input').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                document.querySelectorAll('.checkbox-buttons__input').forEach(cb => {
                    if (cb !== this) {
                        cb.checked = false;
                    }
                });
                officeId = this.value;
                fetchCandidates();
            } else {
                officeId = null;
                candidatesContainer.innerHTML = '';
                totalCandidates.innerHTML = '--';
            }
            updateSearchResult();
        });
    });

    function updateSearchResult() {
        searchResult.push({ locationCode, officeId});
    }

    function updateElectionData() {
        electionYearData.push({ electionYear, electionCode});
    }

    clearButton.addEventListener('click', clearCandidates);

    function clearCandidates() {
        const electionYearSelect = electionYearChooser;
        document.querySelectorAll('.checkbox-buttons__input').forEach(checkbox => {
            checkbox.checked = false;
        });
        electionYearSelect.selectedIndex = 0
        locationCode = null;
        officeId = null;
        electionCode = null;
        searchBox.value = '';
        suggestions.innerHTML = '';
        totalCandidates.innerHTML = '--';
        candidatesContainer.innerHTML = '';
        selectedCandidates.length = 0;
        printButton.style.display = 'none';
    }
});
