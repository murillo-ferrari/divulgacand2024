async function loadStates() {
    try {
      // Carrega o arquivo JSON
      const response = await fetch(
        "../busca_candidatos/resources/data/municipios-2024.json"
      );
      const cities = await response.json();
  
      const ufSelect = document.getElementById("ufSelect");
      const ufSet = new Set();
  
      // Preenche o dropdown com os UFs únicos, removendo DF e ZZ
      cities.forEach((city) => {
        if (city.UF !== "DF" && city.UF !== "ZZ") {
          ufSet.add(city.UF);
        }
      });
  
      ufSet.forEach((uf) => {
        const option = document.createElement("option");
        option.value = uf;
        option.textContent = uf;
        ufSelect.appendChild(option);
      });
  
      // Adiciona evento de mudança para iniciar a consulta ao selecionar um estado
      ufSelect.addEventListener("change", () => {
        const selectedState = ufSelect.value;
        if (selectedState) {
          fetchCandidates(selectedState, cities);
        }
      });
  
      // Adiciona evento para o checkbox
      const filterCheckbox = document.getElementById("filterCheckbox");
      filterCheckbox.addEventListener("change", () => {
        const isChecked = filterCheckbox.checked;
        applyFilter(isChecked);
      });
    } catch (error) {
      console.error("Erro ao carregar estados:", error);
    }
  }
  
  async function fetchCandidates(selectedState, cities) {
    try {
      const cityCandidatesList = document.getElementById("cityCandidatesList");
      const loader = document.getElementById("loader");
      const filterCheckbox = document.getElementById("filterCheckbox");
  
      // Mostra o loader e desativa o checkbox
      loader.style.display = "block";
      filterCheckbox.disabled = true;
  
      cityCandidatesList.innerHTML = ""; // Limpa a lista anterior
      cityCandidatesList.style.display = "none"; // Oculta a lista de cidades/candidatos
      const processedCities = new Set(); // Para rastrear cidades já processadas
  
      // Itera sobre as cidades filtrando pelo estado selecionado
      for (const city of cities) {
        if (city.UF !== selectedState) continue; // Ignora cidades fora do estado selecionado
  
        let locationCode = city.COD_LOCALIDADE;
        const cityName = city.NOM_LOCALIDADE;
  
        // Verifica se a cidade já foi processada
        if (processedCities.has(locationCode)) {
          continue; // Ignora cidades já processadas
        }
  
        processedCities.add(locationCode); // Adiciona a cidade ao conjunto de processadas
  
        console.log(locationCode.length);
        // Ajusta o código da localidade para ter 5 dígitos
        if (locationCode.length === 4) {
          locationCode = "0" + locationCode;
        }
  
        if (locationCode.length === 3) {
          locationCode = "00" + locationCode;
        }
  
        if (locationCode.length === 2) {
          locationCode = "000" + locationCode;
        }
  
        // Monta o endpoint para a cidade
        const endpoint = `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/2024/${locationCode}/2045202024/13/candidatos`;
  
        // Faz a requisição ao endpoint
        const candidatesResponse = await fetch(endpoint);
        const candidatesData = await candidatesResponse.json();
  
        // Verifica se o atributo 'candidatos' existe antes de contar
        const candidateCount = candidatesData.candidatos
          ? candidatesData.candidatos.length
          : 0;
  
        // Cria um elemento de lista para mostrar o nome da cidade e o número de candidatos
        const listItem = document.createElement("li");
  
        // Cria o elemento <p> para o nome da cidade e o número de candidatos
        const paragraph = document.createElement("p");
        paragraph.textContent = `${cityName}: ${candidateCount.toLocaleString(
          "pt-BR",
          { minimumIntegerDigits: 1 }
        )} candidatos`;
  
        // Adiciona o <p> ao listItem
        listItem.appendChild(paragraph);
  
        // Se houver apenas um candidato, aplica a classe 'single-candidate'
        if (candidateCount === 1) {
          listItem.classList.add("single-candidate");
        }
  
        if (candidateCount > 0) {
          const subList = document.createElement("ul");
          for (const candidate of candidatesData.candidatos) {
            console.log(candidate);
            const subListItem = document.createElement("li");
            subListItem.classList.add("candidate");
            // subListItem.textContent = `${candidate.nomeUrna} (${candidate.partido.sigla})`;
  
            subListItem.textContent = ""; // Clear text content to append nodes instead
  
            const nameLink = document.createElement("a");
            const UFnormal = city.UF.toLowerCase();
            const cityNormal = sanitizeName(cityName.toLowerCase());
            const sanitizedName = sanitizeName(candidate.nomeUrna);
            const formatedName = formatarNome(candidate.nomeUrna);
            // console.log(`${cityName}: ${formatedName}`);
            nameLink.href = `https://www.cnnbrasil.com.br/eleicoes/2024/candidatos/${UFnormal}/${cityNormal}/vereador/${candidate.numero}-${sanitizedName}`; // Replace with the actual URL
            nameLink.textContent = formatedName;
            nameLink.target = "_blank"; // Open in a new tab
  
            const partyText = document.createTextNode(
              ` (${candidate.partido.sigla})`
            );
            const candidateNumber = document.createTextNode(
              ` - ${candidate.numero}`
            );
            const candidateStatus = document.createTextNode(
              ` - ${candidate.descricaoSituacao}`
            );
  
            subListItem.appendChild(nameLink);
            subListItem.appendChild(partyText);
            subListItem.appendChild(candidateNumber);
            subListItem.appendChild(candidateStatus);
  
            // Fetch the details for deputy candidates
            const detailedEndpoint = `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/buscar/2024/${locationCode}/2045202024/candidato/${candidate.id}`;
            try {
              const detailedResponse = await fetch(detailedEndpoint);
              const detailedData = await detailedResponse.json();
  
              const deputyCandidates = detailedData.vices
                ? detailedData.vices
                    .map((node) => `${node.nm_URNA} (${node.sg_PARTIDO})`)
                    .join(", ")
                : "";
              if (deputyCandidates) {
                const deputyParagraph = document.createElement("p");
                deputyParagraph.className = "candidate__deputy";
                deputyParagraph.textContent = `Vice: ${deputyCandidates}`;
                subListItem.appendChild(deputyParagraph);
              }
            } catch (error) {
              console.error("Erro ao buscar detalhes dos candidatos:", error);
              alert(
                "Ocorreu um erro ao buscar detalhes dos candidatos. Por favor, tente novamente."
              );
            }
  
            subList.appendChild(subListItem);
          }
          listItem.appendChild(subList);
        }
  
        cityCandidatesList.appendChild(listItem);
      }
  
      // Aplica o filtro inicial baseado no estado do checkbox
      applyFilter(document.getElementById("filterCheckbox").checked);
    } catch (error) {
      console.error("Erro ao buscar candidatos:", error);
    } finally {
      // Oculta o loader e ativa o checkbox após o processamento
      document.getElementById("loader").style.display = "none";
      document.getElementById("filterCheckbox").disabled = false;
      cityCandidatesList.style.display = "block";
    }
  }
  
  function applyFilter(isChecked) {
    const cityCandidatesList = document.getElementById("cityCandidatesList");
    const listItems = cityCandidatesList.getElementsByTagName("li");
  
    for (const item of listItems) {
      if (
        isChecked &&
        !item.classList.contains("single-candidate") &&
        !item.classList.contains("candidate")
      ) {
        item.classList.add("hidden");
      } else {
        item.classList.remove("hidden");
      }
    }
  }
  
  function sanitizeName(nome) {
    // Convert to lowercase and replace accented characters with non-accented equivalents
    nome = nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  
    // Split the name into words
    let palavras = nome.split(" ");
  
    // Join the words back into a string, replacing spaces with hyphens
    return palavras.join("-");
  }
  
  function formatarNome(nome) {
    // List of prepositions that should stay lowercase
    const preposicoes = [
      "de",
      "da",
      "do",
      "dos",
      "das",
      "e",
      "em",
      "com",
      "por",
      "para",
      "a",
      "o",
      "as",
      "os",
      "d",
    ];
  
    // Convert the entire name to lowercase
    nome = nome.toLowerCase();
  
    // Split the name into words
    let palavras = nome.split(" ");
  
    // Format each word
    palavras = palavras.map((palavra, index) => {
      // If the word is not a preposition or it's the first word, capitalize it
      if (!preposicoes.includes(palavra) || index === 0) {
        // Capitalize the first letter of the word
        palavra = palavra.charAt(0).toUpperCase() + palavra.slice(1);
  
        // Capitalize letters after apostrophes (') and hyphens (-)
        palavra = palavra.replace(/(['-])(\w)/g, (match, p1, p2) => {
          return p1 + p2.toUpperCase();
        });
  
        // Ensure that any accented letter after an apostrophe is also uppercase
        palavra = palavra.replace(/(['])([çúíãáâéêóô])/g, (match, p1, p2) => {
          return p1 + p2.toUpperCase();
        });
  
        // Ensure accented letters (both uppercase and lowercase) are preserved in their correct case
        palavra = palavra.replace(
          /ç|ú|í|ã|á|â|é|ê|ó|ô|Ç|Ú|Í|Ã|Á|Â|É|Ê|Ó|Ô/gi,
          (match) => {
            return match === match.toLowerCase()
              ? match.toLowerCase()
              : match.toUpperCase();
          }
        );
      }
      return palavra;
    });
  
    // Join the words back into a string
    return palavras.join(" ");
  }
  
  // Carrega os estados ao iniciar a página
  loadStates();
  