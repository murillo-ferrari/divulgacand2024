function formatarNome(nome) {
// List of prepositions that should stay lowercase
const preposicoes = ['de', 'da', 'do', 'dos', 'das', 'e', 'em', 'com', 'por', 'para', 'a', 'o', 'as', 'os', 'd'];

nome = nome.toLowerCase();

let palavras = nome.split(' ');

palavras = palavras.map((palavra, index) => {
    if (!preposicoes.includes(palavra) || index === 0) {
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
        palavra = palavra.replace(/ç|ú|í|ã|á|â|é|ê|ó|ô|Ç|Ú|Í|Ã|Á|Â|É|Ê|Ó|Ô/gi, (match) => {
            return match === match.toLowerCase()
                ? match.toLowerCase()
                : match.toUpperCase();
        });
    }
    return palavra;
});

return palavras.join(' ');
}

fetch('../busca_candidatos/resources/data/municipios-2024.json')
.then(response => response.json())
.then(data => {
    const originalListElement = document.getElementById('originalList');
    const camelCaseListElement = document.getElementById('camelCaseList');

    const uniqueLocalidades = new Set();

    data.forEach(item => {
        if (item.UF !== 'ZZ') {  // Ignore cities with UF as "ZZ"
            const localidade = item.COD_LOCALIDADE.padStart(5, "0")
            uniqueLocalidades.add(`${item.NOM_LOCALIDADE} (${item.UF}) - ${localidade}`);
        }
    });

    uniqueLocalidades.forEach(localidadeWithUF => {
        const [localidade, uf] = localidadeWithUF.split(' (');

        // Create the list item for the original list
        const originalListItem = document.createElement('li');
        originalListItem.textContent = localidadeWithUF;
        originalListElement.appendChild(originalListItem);

        // Create the list item for the formatted name list (using formatarNome)
        const camelCaseListItem = document.createElement('li');
        camelCaseListItem.textContent = `${formatarNome(localidade)} (${uf}`;
        camelCaseListElement.appendChild(camelCaseListItem);
    });
})
.catch(error => console.error('Error fetching the JSON file:', error));