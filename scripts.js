document.addEventListener("DOMContentLoaded", () => {
    const candidatesContainer = document.getElementById("candidates-container");
    const totalCandidates = document.getElementById('totalCandidates');
    const printButton = document.getElementById("print-button");
    const searchBox = document.getElementById('searchBox');
    const suggestions = document.getElementById('suggestions');
    const clearButton = document.getElementById('clearButton');
    const searchResult = [];

    let selectedCandidates = [];
    let candidatesData = [];
    let idCargo = null;
    let codLocalidade = null;

    /**
     * Fetches and displays candidates based on the selected location and cargo.
     * 
     * @param {string} codLocalidade - The code of the selected location.
     * @param {string} idCargo - The id of the selected cargo.
     */
    function fetchCandidates() {
        if (codLocalidade && idCargo) {
            const endpoint = `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/2024/${codLocalidade}/2045202024/${idCargo}/candidatos`;

            fetch(endpoint)
                .then(response => response.json())
                .then(data => {
                    candidatesData = data.candidatos;
                    candidatesContainer.innerHTML = '';
                    totalCandidates.innerHTML = candidatesData.length; // Update the count after fetching
                    candidatesData.forEach(candidate => {
                        const card = document.createElement("div");
                        card.className = "divulga-Cand__candidate-card";
                        card.innerHTML = `
                            <div class="divulga-Cand__candidate-card--name">
                                <h2>${candidate.nomeUrna}</h2>
                            </div>
                            <div class="divulga-Cand__candidate-card--wrapper">                            
                                <div class="divulga-Cand__candidate-card--personalPicture">
                                    <img src="https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/2045202024/${candidate.id}/${codLocalidade}" alt="${candidate.nomeUrna}" class="candidate-photo">
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
            if (selectedCandidates.length <= 10) {
                selectedCandidates.push(candidateId);
            } else {
                event.target.checked = false;
                alert("Você pode visualizar no máximo 10 candidatos.");
            }
        } else {
            selectedCandidates = selectedCandidates.filter(id => id !== candidateId);
        }

        printButton.style.display = (selectedCandidates.length >= 1 && selectedCandidates.length <= 10) ? "block" : "none";
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
                    codLocalidade = locations[location];
                    suggestions.innerHTML = '';
                    fetchCandidates(); // Fetch candidates when a location is selected
                    if (idCargo) {
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
        if (codLocalidade && idCargo) {
            const detailedEndpoints = selectedCandidates.map(id => `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/buscar/2024/${codLocalidade}/2045202024/candidato/${id}`);
            Promise.all(detailedEndpoints.map(url => fetch(url).then(response => response.json())))
                .then(detailedDataArray => {
                    console.log(detailedDataArray);
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
                            .map(node => `<li>${node.ordem}, ${node.descricaoDeTipoDeBem}, ${node.descricao}, ${formatCurrency(node.valor)}</li>`)
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
                                    .card__completeData--completeData { width: 50%; }
                                    .card__completeData h2 { margin: 8px; font-size: 1.5em; }
                                    .card__completeData h3 { margin: 0; }
                                    .card__completeData p { margin: 10px 0; }
                                    .candidate-photo { width: 200px; height: auto; display: block; margin: 0 auto; }
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
        const locationMap = {};
        data.forEach(item => {
            const location = `${item.NOM_LOCALIDADE} (${item.UF})`;
            if (!locationMap[location]) {
                locationMap[location] = item.COD_LOCALIDADE;
            }
        });
        return locationMap;
    }

    document.querySelectorAll('.checkbox-buttons__input').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                document.querySelectorAll('.checkbox-buttons__input').forEach(cb => {
                    if (cb !== this) {
                        cb.checked = false;
                    }
                });
                idCargo = this.value;
                fetchCandidates(); // Fetch candidates when a office is selected
            } else {
                idCargo = null;
                candidatesContainer.innerHTML = '';
                totalCandidates.innerHTML = '--';
            }
            updateSearchResult();
        });
    });

    function updateSearchResult() {
        searchResult.push({ codLocalidade, idCargo });
        //console.log(searchResult);
    }

    clearButton.addEventListener('click', clearCandidates);

    function clearCandidates() {
        document.querySelectorAll('.checkbox-buttons__input').forEach(checkbox => {
            checkbox.checked = false;
        });
        codLocalidade = null;
        idCargo = null;
        searchBox.value = '';
        suggestions.innerHTML = '';
        totalCandidates.innerHTML = '--';
        candidatesContainer.innerHTML = '';
        selectedCandidates.length = 0;
        printButton.style.display = 'none';
    }
});
