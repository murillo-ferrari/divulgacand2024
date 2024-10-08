async function loadStates() {
  try {
    const response = await fetch(
      "../busca_candidatos/resources/data/municipios-2024.json"
    );
    const cities = await response.json();

    const ufSet = new Set(
      cities
        .map((city) => (city.UF !== "DF" && city.UF !== "ZZ" ? city.UF : null))
        .filter(Boolean)
    );

    const ufSelect = document.getElementById("ufSelect");
    ufSet.forEach((uf) => addOptionToSelect(ufSelect, uf));

    ufSelect.addEventListener("change", () => {
      const selectedState = ufSelect.value;
      if (selectedState) {
        populateCityDropdown(selectedState, cities);
      }
    });
  } catch (error) {
    console.error("Erro ao carregar estados:", error);
  }
}

function addOptionToSelect(selectElement, value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  selectElement.appendChild(option);
}

function populateCityDropdown(selectedState, cities) {
  const citySelect = document.getElementById("citySelect");
  citySelect.innerHTML = "";

  const uniqueCities = new Set();
  const cityList = [];

  cities.forEach((city) => {
    if (city.UF === selectedState && !uniqueCities.has(formatName(city.NOM_LOCALIDADE))) {
      uniqueCities.add(formatName(city.NOM_LOCALIDADE));
      cityList.push({ name: formatName(city.NOM_LOCALIDADE), cod: city.COD_LOCALIDADE });
    }
  });

  cityList.sort((a, b) => a.name.localeCompare(b.name));

  cityList.forEach((city) => {
    const option = document.createElement("option");
    option.value = city.cod; // City code as value
    option.textContent = city.name; // City name as display text
    citySelect.appendChild(option);
  });

  // Automatically fetch candidates for the first city if available
  if (cityList.length > 0) {
    const firstCityCode = cityList[0].cod; // Get the first city's code
    const firstCityName = cityList[0].name; // Get the first city's name
    fetchCandidatesForCity(firstCityCode, firstCityName); // Fetch candidates for the first city
  }

  citySelect.addEventListener("change", () => {
    const selectedCityCode = citySelect.value;
    const selectedCityName = citySelect.options[citySelect.selectedIndex].text; // Get the city name

    if (selectedCityCode) {
      fetchCandidatesForCity(selectedCityCode, selectedCityName); // Fetch candidates for selected city
    }
  });
}

async function fetchCandidatesForCity(cityCode, cityName) {
  const loader = document.getElementById("loader");
  const filterCheckbox = document.getElementById("filterCheckbox");
  const cityCandidatesList = document.getElementById("cityCandidatesList");

  loader.style.display = "block";
  if (filterCheckbox) filterCheckbox.disabled = true;

  cityCandidatesList.innerHTML = "";
  cityCandidatesList.style.display = "none";

  cityCode = cityCode.padStart(5, "0");
  const selectedUF = document.getElementById("ufSelect").value.toLowerCase();
  const endpoint = `https://resultados.tse.jus.br/oficial/ele2024/619/dados/${selectedUF}/${selectedUF}${cityCode}-c0011-e000619-u.json`;
  console.log(cityName, endpoint); // Debugging output

  await fetchAndDisplayCandidates(endpoint);

  applyFilter(filterCheckbox ? filterCheckbox.checked : false);

  loader.style.display = "none";
  if (filterCheckbox) filterCheckbox.disabled = false;
}

async function fetchAndDisplayCandidates(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);

    const data = await response.json();
    displayCandidateDetails(data);
  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
    document.getElementById(
      "resultados"
    ).innerHTML = `<p>Erro ao carregar os dados: ${error.message}</p>`;
  }
}

function displayCandidateDetails(data) {
  const resultadosDiv = document.getElementById("resultados");
  resultadosDiv.innerHTML = `<h3>Situação: ${data.mnae}</h3>`; // Clear previous results

  const cargos = data.carg;
  cargos.forEach((cargo) => {
    const candidatosOrdenados = cargo.agr
      .flatMap((agrupamento) => {
        return agrupamento.par.flatMap((partido) => {
          return partido.cand.map((candidato) => ({
            nomeCandidato: candidato.nmu,
            numeroCandidato: candidato.n,
            statusCandidato: candidato.st,
            votosCandidato: formatNumber(partido.tvan) || 0,
            partidoSigla: partido.sg,
            coligacaoNome: agrupamento.nm,
            viceCandidatos: candidato.vs || [],
          }));
        });
      })
      .sort((a, b) => b.votosCandidato - a.votosCandidato);

    resultadosDiv.innerHTML += candidatosOrdenados
      .map((candidato) => {
        const viceInfo =
          candidato.viceCandidatos.length > 0
            ? candidato.viceCandidatos
                .map(
                  (vice) =>
                    `<p><strong>Vice:</strong> ${vice.nmu} (${vice.sgp})</p>`
                )
                .join("")
            : "";
        return `
          <p><b>Candidato:</b> ${candidato.nomeCandidato} (${candidato.numeroCandidato}) - <b>Status: </b>${candidato.statusCandidato}</p>
          <p><b>Partido:</b> ${candidato.partidoSigla}</p>
          <p><b>Coligação:</b> ${candidato.coligacaoNome}</p>
          <p><b>Votos:</b> ${candidato.votosCandidato}</p>
          ${viceInfo}
          <hr>
        `;
      })
      .join("");
  });
}

function applyFilter(isChecked) {
  const listItems = document
    .getElementById("cityCandidatesList")
    .getElementsByTagName("li");
  for (const item of listItems) {
    item.classList.toggle(
      "hidden",
      isChecked && !item.classList.contains("single-candidate")
    );
  }
}

function formatNumber(number) {
  return number.toLocaleString("pt-BR");
}

function formatName(name) {
  const preposicoes = [
    "de", "da", "do", "dos", "das", "e", "em", "com", "por", "para", "a", "o", "as", "os", "d",
  ];

  name = name.toLowerCase();
  let palavras = name.split(" ");

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
