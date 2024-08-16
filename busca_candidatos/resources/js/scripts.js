document.addEventListener("DOMContentLoaded", () => {
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
                        card.className = "divulga-cand__candidate-card";
                        card.innerHTML = `
                            <div class="divulga-cand__candidate-card-name">
                                <h2>${candidate.nomeUrna}</h2>
                            </div>
                            <div class="divulga-cand__candidate-card-wrapper">                            
                                <div class="divulga-cand__candidate-card-personal-picture">
                                    <img src="https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/${electionCode}/${candidate.id}/${locationCode}" alt="${candidate.nomeUrna}" class="candidate-photo">
                                </div>
                                <div class="divulga-cand__candidate-card-min-data">
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
    * Handles the change event of the checkbox elements, adding or removing candidate IDs from the selectedCandidates array.
    *
    * Also, updates the visibility of the print button based on the number of selected candidates.
    *
    * @param {Event} event - The change event triggered by the checkbox.
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
        clearUI();
        if (query.length >= 2) {
            const filteredLocations = Object.keys(locations).filter(location =>
                removeDiacritics(location.toLowerCase()).includes(removeDiacritics(query.toLowerCase())));

            filteredLocations.forEach(location => {
                const li = document.createElement('li');
                li.textContent = location;
                li.addEventListener('click', () => {
                    searchBox.value = location;
                    locationCode = locations[location];
                    clearUI();
                    fetchCandidates();
                    if (officeId) {
                        updateData(searchResult, { locationCode, officeId });
                    }
                });
                suggestions.appendChild(li);
            });
        }
    }

    // Print selected candidates
    window.printSelected = function () {
        if (locationCode && officeId) {
            const detailedEndpoints = selectedCandidates.map(id => `
                https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/buscar/${electionYear}/${locationCode}/${electionCode}/candidato/${id}`);

            // const detailedIncomeAndExpenses = selectedCandidates.map(numero, id => `
            //     https://divulgacandcontas.tse.jus.br/divulga/rest/v1/prestador/consulta/2045202024/20024/
            //         ${locationCode}/${officeId}/$(partyNumber}/${numero}/${id}`);

            Promise.all(detailedEndpoints.map(url => fetch(url).then(response => response.json())))
                .then(detailedDataArray => {
                    console.log(detailedDataArray);

                    // console.log(detailedIncomeAndExpenses);
                    const printContent = document.createElement("div");
                    printContent.className = "container-card__complete-data";
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
                                        <li class="asset-order">${node.ordem}</li>
                                        <li>${node.descricao}</li>
                                        <li>${formatCurrency(node.valor)}</li>
                                    </ul>
                                </li>
                            `)
                            .join('') 
                        : '';

                        const candidateCard = `
                            <div class="card__complete-data">
                                <div class="card__complete-data-name-and-party">
                                    <h2>${candidate.nomeUrna} - ${candidate.numero}</h2>
                                </div>
                                <div class="card__complete-data-wrapper">
                                    <div class="card__complete-data-personal-picture">
                                        <img src="${candidate.fotoUrl || 'https://via.placeholder.com/150'}" alt="${candidate.nomeUrna}" class="candidate-photo">
                                    </div>
                                    <div class="card__complete-data-complete-data">
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
                                    .container-card__complete-data { display: flex; }
                                    .card__complete-data { 
                                     border: 1px solid #ddd; padding: 20px; margin: 20px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); 
                                        border-radius: 8px; min-width: 310px; }
                                    .card__complete-data-name-and-party { width: 100%; }
                                    .card__complete-data-personal-picture { margin-bottom: 16px; }
                                    .card__complete-data-complete-data { /*width: 50%;*/ }
                                    .card__complete-data h2 { margin: 8px; font-size: 1.5em; }
                                    .card__complete-data h3 { margin-top: 0; }
                                    .card__complete-data p { margin: 0 0 8px 0; line-height: 1.5; }
                                    .candidate-photo { max-width: 150px; margin: 8px 8px; border-radius: 4px; }
                                    li.asset-order { display: none; }
                                </style>
                            </head>
                            <body>${printContent.innerHTML}</body>
                        </html>
                    `);
                    // printWindow.document.close();
                    // printWindow.print();
                })
                .catch(error => {
                    console.error("Erro ao buscar detalhes dos candidatos:", error);
                    alert("Ocorreu um erro ao buscar detalhes dos candidatos. Por favor, tente novamente.");
                });
        }
    };

    /**
     * Fetches and handles location suggestions.
     * 
     * @param {Object} data - The fetched data.
     * @returns {Object} uniqueLocations - An object containing unique locations as keys and their corresponding codes as values.
     */
    fetch('resources/data/municipios-2024.json')
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
            // Adiciona um zero à esquerda se o COD_LOCALIDADE tiver menos de 5 dígitos
            const codLocalidade = item.COD_LOCALIDADE.toString().padStart(5, '0');
            
            const location = `${item.NOM_LOCALIDADE} (${item.UF})`;
            if (!locationMap[location]) {
                locationMap[location] = codLocalidade;
            }
            return locationMap;
        }, {});
    }

    // Handle election Year selection
    electionYearList.addEventListener('change', function() {
        const selectedYear = this.value;

        fetch('resources/data/election-year.json')
            .then(response => response.json())
            .then(data => {
                const election = data.find(el => el.ano == selectedYear);

                if (election) {
                    electionYear = election.ano;
                    electionCode = election.id;
                    clearCheckboxes('.print-checkbox');;
                    fetchCandidates();
                    updateData(electionYearData, { electionYear, electionCode });
                } else {
                    console.log('Nenhum dado eleitoral encontrado para o ano selecionado.');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar dados eleitorais:', error);
            });
    });

    // Handle office checkboxes
    document.querySelectorAll('.divulga-cand__checkbox-input').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                document.querySelectorAll('.divulga-cand__checkbox-input').forEach(cb => {
                    if (cb !== this) {
                        cb.checked = false;
                    }
                });
                officeId = this.value;
                fetchCandidates();
            } else {
                clearCandidates();
            }
            updateData(searchResult, { locationCode, officeId });
        });
    });

    clearButton.addEventListener('click', clearCandidates);

    // Call utils function to clear the candidates content
    function clearCandidates() {
        clearCheckboxes('.divulga-cand__checkbox-input');
        resetDropdown(electionYearList);
        resetVariables();
        clearInputs();
        clearUI();
    }
    
});