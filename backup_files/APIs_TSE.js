
return this.isAbrangenciaFederalOuEstadual(t) && (console.log("Eleicao Abrangencia Federal/Estadual"),
_ = this.irParaListaDeCargos(t.id, p)),
this.isAbrangenciaMunicipal(t) && (console.log("Eleicao Abrangencia Municipal"),

isAbrangenciaFederalOuEstadual(t) {
    return t.tipoAbrangencia === n.E.ELEICAO_FEDERAL || t.tipoAbrangencia === n.E.ELEICAO_ESTADUAL
}
isAbrangenciaMunicipal(t) {
    return t.tipoAbrangencia === n.E.ELEICAO_MUNICIPAL
}
irParaListaDeCargos(t, o) {
    return this.eleicaoService.getResourceCargosMunicipio(t, o)
}
irParaListaDeMunicipios(t, o) {
    return this.eleicaoService.getResourceCargosMunicipio(t, o)
}



/*
* APIs básicas de candidatos
*/
cont apiURL = "https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura"

// endpoint de candidatos
    return this.http.get(`${apiURL}/listar/${ano}/${uf}/${idEleicao}/${cargo}/candidatos`)

// endpoint de candidatos com vices suplentes
    return this.http.get(`${apiURL}/listar/${ano}/${uf}/${idEleicao}/${cargo}/candidatoscomvicessuplentes`)

// endpoint com dados detalhados de candidatos
    return this.http.get(`${apiURL}/buscar/${ano}/${sgUe}/${idEleicao}/candidato/${idCandidato}`)


/*
* APIs de atas
*/
cont apiAtasURL = "https://divulgacandcontas.tse.jus.br/divulga/rest/v1/ata"

// endpoint das eleições ordinárias
  return this.http.get(`${this.apiURL}/ordinarias`);

// endpoint das ata de eleições ordinárias
  return this.http.get(`${this.apiURL}/ordinariasAta`);

//  endpoint de estados
  return this.http.get(`${this.apiURL}/estados`);

//  endpoint de municípios
  return this.http.get(`${this.apiURL}/municipios/${me}/${K.id}`);

//  endpoint de Atas Suplementares
  return this.http.get(`${this.apiURL}/suplementaresAta/${me}`);

//  endpoint de anos eleitorais
  return this.http.get(`${this.apiURL}/anos-eleitorais`);

//  endpoint de partidos
  return this.http.get(`${this.apiURL}/partidos/${me.id}/${K}`);

//  endpoint de partidos por estado
  return this.http.get(`${this.apiURL}/partidos/${me.id}/${K}/uf`);

//  endpoint de partidos por município
    `${this.apiURL}/partidos/${me.id}/${K}/${ge}/municipio`

//  endpoint de partidos em eleições suplementares
    `${this.apiURL}/partidos/${me.id}/suplementar`

//  endpoint de atas por estado
  return this.http.get(`${this.apiURL}/uf/${me.id}`);

//  endpoint de atas por municípios
  return this.http.get(`${this.apiURL}/municipioAta/${me.id}/${K}`);

/*
* APIs básicas de eleições
*/
cont apiEleicoesURL = "https://divulgacandcontas.tse.jus.br/divulga/rest/v1/eleicao"

//  endpoint de
    return this.http.get(`${this.apiURL}/anos-eleitorais`);

//  endpoint de
    return this.http.get(`${this.apiURL}/suplementares/${me}/${K}`);

//  endpoint de
    return this.http.get(`${this.apiURL}/estados/${me}/ano`);

//  endpoint de
    (K = "idEleicao"
      this.http.get(`${this.apiURL}/eleicao-atual`, { params: K })
    );

//  endpoint de anos eleitorais
    return this.http.get(`${this.apiURL}/buscar/${K}/${me}/municipios`);

//  endpoint de período de eleição
      `${this.apiURL}/periodoEleicao/${me}/${K}/periodo`

//  endpoint de cargos por municípios
    return this.http.get(
      `${this.apiURL}/listar/municipios/${me}/${K}/cargos`

//  endpoint de eleições ordinárias
    return this.http.get(`${this.apiURL}/ordinaria/${me}`);

//  endpoint de diplomação
    return this.http.get(`${this.apiURL}/validar/${me}/diplomacao`);

//  endpoint de data de replicação do Divulga
    return this.http.get(`${this.apiURL}/replicacaoDivulga/${me}/ano`);

// endpoint de receitas
"receitas" === e && this.existeDados().receitas ? this.router.navigate([`/candidato/${this.candidatoVO.regiao}/${this.candidatoVO.uf}/${this.candidatoVO.eleicao}/${this.candidatoVO.idCandidato}/${this.candidatoVO.ano}/${this.candidatoVO.sgUe}/prestacao/receitas`]) 

// endpoint de despesas
"despesas" === e && this.existeDados().despesas && this.router.navigate([`/candidato/${this.candidatoVO.regiao}/${this.candidatoVO.uf}/${this.candidatoVO.eleicao}/${this.candidatoVO.idCandidato}/${this.candidatoVO.ano}/${this.candidatoVO.sgUe}/prestacao/despesas`])

// endpoint de extratos bancários do candidato
this.existeDados().extrato && this.router.navigate([`/candidato/${this.candidatoVO.regiao}/${this.candidatoVO.uf}/${this.candidatoVO.eleicao}/${this.candidatoVO.idCandidato}/${this.candidatoVO.ano}/${this.candidatoVO.sgUe}/extratos`])

// endpoint de histórico de entregas do candidato
    this.dadosPrestacaoConta.historicoEntregas.length > 0 && this.router.navigate([`/candidato/${this.candidatoVO.regiao}/${this.candidatoVO.uf}/${this.candidatoVO.eleicao}/${this.candidatoVO.idCandidato}/${this.candidatoVO.ano}/${this.candidatoVO.sgUe}/historico`])

// endpoint de histórico de nfes do candidato
    this.existeDados().nota && this.router.navigate([`/candidato/${this.candidatoVO.regiao}/${this.candidatoVO.uf}/${this.candidatoVO.eleicao}/${this.candidatoVO.idCandidato}/${this.candidatoVO.ano}/${this.candidatoVO.sgUe}/nfes`])

/*
* Exemplo de fetch para dados econômicos de candidato
*/ 

fetch("https://divulgacandcontas.tse.jus.br/divulga/rest/v1/prestador/consulta/2030402020/2020/71072/11/45/45/250000896546", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6",
      "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "cookie": "_ga=GA1.1.935674605.1713993569; __utmz=260825096.1721415981.22.13.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); _ga_TY3FZ06TXD=GS1.1.1722374212.14.0.1722374212.0.0.0; __utma=260825096.1322571465.1713993569.1722543789.1722604634.24; _ga_7RLBKGD8GK=GS1.1.1722868608.28.0.1722868608.60.0.0; _d8a23=cb69eccb04f214d8; TS01efa917=0103a0ceae404952f1ebdc271fa489158725369dd1542c00010b64a63e6477ffc323731cd7345a1e2223470162cb39ad6ebe3049ab224406ed344c15aff7731ac6a860ce0b",
      "Referer": "https://divulgacandcontas.tse.jus.br/",
      "Referrer-Policy": "strict-origin"
    },
    "body": null,
    "method": "GET"
  });