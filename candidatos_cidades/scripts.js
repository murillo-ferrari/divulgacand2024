async function loadStates() {
  try {
    const response = await fetch(
      "../busca_candidatos/resources/data/municipios-2024.json"
    );
    const cities = await response.json();

    const ufSelect = document.getElementById("ufSelect");
    const ufSet = new Set();

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

    ufSelect.addEventListener("change", () => {
      const selectedState = ufSelect.value;
      if (selectedState) {
        populateCityDropdown(selectedState, cities);
      }
    });

    const filterCheckbox = document.getElementById("filterCheckbox");
    filterCheckbox.addEventListener("change", () => {
      const isChecked = filterCheckbox.checked;
      applyFilter(isChecked);
    });
  } catch (error) {
    console.error("Erro ao carregar estados:", error);
  }
}

function populateCityDropdown(selectedState, cities) {
  const citySelect = document.getElementById("citySelect");
  citySelect.innerHTML = "";

  const uniqueCities = new Set();
  const cityList = [];

  cities.forEach((city) => {
    if (city.UF === selectedState && !uniqueCities.has(city.NOM_LOCALIDADE)) {
      uniqueCities.add(city.NOM_LOCALIDADE);
      cityList.push({ nome: city.NOM_LOCALIDADE, cod: city.COD_LOCALIDADE });
    }
  });

  cityList.sort((a, b) => a.nome.localeCompare(b.nome));

  cityList.forEach((city) => {
    const option = document.createElement("option");
    option.value = city.cod;
    option.textContent = city.nome;
    citySelect.appendChild(option);
  });

  citySelect.addEventListener("change", () => {
    const selectedCityCode = citySelect.value;
    const selectedCityName = citySelect.options[citySelect.selectedIndex].text;

    if (selectedCityCode) {
      fetchCandidatesForCity(selectedCityCode, selectedCityName); 
    }
  });
}

citySelect.addEventListener("change", () => {
  const selectedCityCode = citySelect.value;
  const selectedCityName = citySelect.options[citySelect.selectedIndex].text;
  const selectedUF = document.getElementById("ufSelect").value;

  if (selectedCityCode) {
    fetchCandidatesForCity(selectedCityCode, selectedCityName, selectedUF);
  }
});

async function fetchCandidatesForCity(cityCode, cityName, selectedUF) {
  try {
    const cityCandidatesList = document.getElementById("cityCandidatesList");
    const loader = document.getElementById("loader");
    const filterCheckbox = document.getElementById("filterCheckbox");

    loader.style.display = "block";
    if (filterCheckbox) filterCheckbox.disabled = true;

    cityCandidatesList.innerHTML = "";
    cityCandidatesList.style.display = "none";

    cityCode = cityCode.padStart(5, "0");

    const endpoint = `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/2024/${cityCode}/2045202024/13/candidatos`;

    const candidatesResponse = await fetch(endpoint);
    const candidatesData = await candidatesResponse.json();

    const candidateCount = candidatesData.candidatos
      ? candidatesData.candidatos.length
      : 0;

    const listItem = document.createElement("li");
    const paragraph = document.createElement("p");
    paragraph.textContent = `Candidatos: ${candidateCount.toLocaleString("pt-BR")}`;
    listItem.appendChild(paragraph);

    if (candidateCount > 0) {
      const subList = document.createElement("ul");
      candidatesData.candidatos.forEach((candidate) => {
        const subListItem = document.createElement("li");
        subListItem.classList.add("candidate");

        const nameLink = document.createElement("a");
        const cityNormal = sanitizeName(cityName.toLowerCase()); // cityName is now defined
        const sanitizedName = sanitizeName(candidate.nomeUrna);
        const formatedName = formatarNome(candidate.nomeUrna);
        const UFnormal = "UF_PLACEHOLDER"; // Add logic for UF (state) if needed
        nameLink.href = `https://www.cnnbrasil.com.br/eleicoes/2024/candidatos/${selectedUF}/${cityNormal}/vereador/${candidate.numero}-${sanitizedName}/`;
        nameLink.textContent = formatedName;
        nameLink.target = "_blank";

        const partyText = document.createTextNode(` (${candidate.partido.sigla})`);
        const candidateNumber = document.createTextNode(` - ${candidate.numero}`);
        const candidateStatus = document.createTextNode(` - ${candidate.descricaoSituacao}`);

        subListItem.appendChild(nameLink);
        subListItem.appendChild(partyText);
        subListItem.appendChild(candidateNumber);
        subListItem.appendChild(candidateStatus);

        subList.appendChild(subListItem);
      });
      listItem.appendChild(subList);
    }

    cityCandidatesList.appendChild(listItem);
    cityCandidatesList.style.display = "block";

    applyFilter(filterCheckbox ? filterCheckbox.checked : false);
  } catch (error) {
    console.error("Erro ao buscar candidatos:", error);
  } finally {
    loader.style.display = "none";
    if (filterCheckbox) filterCheckbox.disabled = false;
  }
}

function applyFilter(isChecked) {
  const cityCandidatesList = document.getElementById("cityCandidatesList");
  const listItems = cityCandidatesList.getElementsByTagName("li");

  for (const item of listItems) {
    if (isChecked && !item.classList.contains("single-candidate")) {
      item.classList.add("hidden");
    } else {
      item.classList.remove("hidden");
    }
  }
}

function sanitizeName(nome) {
  nome = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  let palavras = nome.split(" ");
  return palavras.join("-");
}

function formatarNome(nome) {
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

  nome = nome.toLowerCase();
  let palavras = nome.split(" ");

  palavras = palavras.map((palavra, index) => {
    if (!preposicoes.includes(palavra) || index === 0) {
      palavra = palavra.charAt(0).toUpperCase() + palavra.slice(1);
      palavra = palavra.replace(/(['-])(\w)/g, (match, p1, p2) => {
        return p1 + p2.toUpperCase();
      });
      palavra = palavra.replace(/(['])([çúíãáâéêóô])/g, (match, p1, p2) => {
        return p1 + p2.toUpperCase();
      });
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

  return palavras.join(" ");
}

loadStates();
