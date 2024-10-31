function getSeeds() {
    let hrefs = [];
    let startDate = '2023-06-17';
    let endDate = '2024-06-06';

    let searchTypes = [
        { type: 'acordaos', label: 'Acórdãos', param: 'tipo_decisao_acordao=on' },
        { type: 'decisoes', label: 'Decisões Monocráticas de 2ª Instância', param: 'dec_monocrativa_is2G_true=on' }
    ];

    let orgaosColegiados = [
        { name: '10a. TURMA ESPECIALIZADA' },
        { name: '1a. SEÇÃO ESPECIALIZADA' },
        { name: '1a. TURMA ESPECIALIZADA' },
        { name: '2a. SEÇÃO ESPECIALIZADA' },
        { name: '2a. TURMA ESPECIALIZADA' },
        { name: '3a. SEÇÃO ESPECIALIZADA' },
        { name: '3a. TURMA ESPECIALIZADA' },
        { name: '4a. SEÇÃO ESPECIALIZADA' },
        { name: '4a. TURMA ESPECIALIZADA' },
        { name: '5a. TURMA ESPECIALIZADA' },
        { name: '6a. TURMA ESPECIALIZADA' },
        { name: '7a. TURMA ESPECIALIZADA' },
        { name: '8a. TURMA ESPECIALIZADA' },
        { name: '9a. TURMA ESPECIALIZADA' },
        { name: 'Assessoria de Recursos' },
        { name: 'Comissão de Soluções Fundiárias' },
        { name: 'Corregedoria' },
        { name: 'GABINETE PRESIDÊNCIA - TRU' },
        { name: 'Presidência' },
        { name: 'Secretaria de Precatórios' },
        { name: 'TRIBUNAL PLENO' },
        { name: 'Turma Regional de Uniformização de Jurisprudência' },
        { name: 'Vice-Presidência' },
        { name: 'Órgão Especial' }
    ];

    searchTypes.forEach(searchType => {
        orgaosColegiados.forEach(orgaoColegiado => {
             let url = `//https://juris.trf2.jus.br/consulta.php?searchType=${searchType.param}&orgaoColegiado=${orgaoColegiado.name}&startDate=${startDate}&endDate=${endDate}&start=1`;
           //let url = `https://juris.trf2.jus.br/consulta.php?searchType=${searchType.param}&orgaoColegiado=${encodeURIComponent(orgaoColegiado.name)}&startDate=${startDate}&endDate=${endDate}&start=1`;
            hrefs.push(url);
        });
    });

    return hrefs;
}
async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            };
        });
}

// Function for "tipo_decisao_acordao"
async function searchAcordao({ canonicalURL, headers, start, startDate, endDate, orgaoColegiado }) {
    startDate = moment(startDate);
    endDate = moment(endDate);
    let payload = {
        "start": "0",
        "rows": "20",
        "q": "",
        "tipo_decisao_acordao": "on",
        "tip_criterio_data": "DESC",
        "dat_jul_ini": startDate.format('DD-MM-YYYY'),
        "dat_jul_fim": endDate.format('DD-MM-YYYY'),
        "numero_processo": "",
        [`fq_orgao_colegiado[${orgaoColegiado}]`]: 'on'
    };
    let body = querystring.stringify(payload);
    let customHeaders = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://juris.trf2.jus.br',
        'Pragma': 'no-cache',
        'Referer': 'https://juris.trf2.jus.br/consulta.php?q=',
        'Sec-Ch-Ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    };

    let _headers = Object.assign(customHeaders, headers);
    let method = "POST";
    let requestURL = `https://juris.trf2.jus.br/consulta.php?q=`;
    let requestOptions = { method, headers: _headers, body };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return responsePage;
}

// Function for "dec_monocrativa_is2G_true"
async function searchMonocratica({ canonicalURL, headers, startDate, endDate, orgaoColegiado }) {
    startDate = moment(startDate);
    endDate = moment(endDate);

    // let actualStart = (start - 1) * 20;
    let payload = {
        "start": "0",
        "rows": "20",
        "q": "",
        "dec_monocrativa_is2G_true": "on",
        "tip_criterio_data": "DESC",
        "dat_jul_ini": startDate.format('DD-MM-YYYY'),
        "dat_jul_fim": endDate.format('DD-MM-YYYY'),
        "numero_processo": "",
        [`fq_orgao_colegiado[${orgaoColegiado}]`]: 'on'
    };
    let body = querystring.stringify(payload);
    //throw (JSON.stringify(payload, null, 4))
    let customHeaders = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://juris.trf2.jus.br',
        'Pragma': 'no-cache',
        'Referer': 'https://juris.trf2.jus.br/consulta.php?q=',
        'Sec-Ch-Ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "POST";
    let requestURL = `https://juris.trf2.jus.br/consulta.php?q=`;
    let requestOptions = { method, headers: _headers, body };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return responsePage;
}

// pagination 
async function pagination({ startDate, endDate, start, canonicalURL, headers, orgaoColegiado, searchType }) {
    startDate = moment(startDate);
    endDate = moment(endDate);
    let actualStart = (start - 1) * 20;
    let payload = {
        "start": actualStart || 0,
        "rows": "20",
        "q": '',
        "tip_criterio_data": "DESC",
        "dat_jul_ini": startDate.format('DD/MM/YYYY'),
        "dat_jul_fim": endDate.format('DD/MM/YYYY'),
        "numero_processo": "",
        [`fq_orgao_colegiado[${orgaoColegiado}]`]: 'on'
    };

    if (searchType === 'acordao') {
        payload["tipo_decisao_acordao"] = "on";
    } else if (searchType === 'monocratica') {
        payload["dec_monocrativa_is2G_true"] = "on";
    }
    //throw searchType
    //throw (JSON.stringify(payload, null, 4))

    let body = querystring.stringify(payload);
    let customHeaders = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://juris.trf2.jus.br',
        'Pragma': 'no-cache',
        'Referer': 'https://juris.trf2.jus.br/consulta.php?q=',
        'Sec-Ch-Ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "POST";
    let requestURL = `https://juris.trf2.jus.br/consulta.php?q=`;
    let requestOptions = { method, headers: _headers, body };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return responsePage;
}
async function puppeteerFetch({ canonicalURL, headers }) {
    const page = await puppeteerManager.newPage();
    await page.goto(canonicalURL, {
        waitFor: "networkidle0",
        timeout: 30000
    }).catch(e => console.error(`Puppeteer still loading page ${canonicalURL}`));
    let html = await page.evaluate(() => document.documentElement.outerHTML);
    const $ = cheerio.load(html, { decodeEntities: false });
    $('base, script, iframe').remove();
    html = $.html();
    return simpleResponse({
        canonicalURL,
        mimeType: "text/html",
        responseBody: html,
    });
}

async function getcontent({ canonicalURL, headers }) {
    let customHeaders = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Host': 'juris.trf2.jus.br',
        'Pragma': 'no-cache',
        'Referer': 'https://juris.trf2.jus.br/consulta.php?q=',
        'Sec-Ch-Ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    }
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    //let requestURL = `https://juris.trf2.jus.br/documento.php?uuid=${uuid}&options=${encodeURIComponent(options)}`;
    //let requestURL = `https://juris.trf2.jus.br/documento.php?uuid=1606ac1b8a5d5bbfa27ee28aa6806bd0&options=%23page%3D1`;
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestOptions });
    return responsePage;
}

async function fetchURL({ canonicalURL, headers }) {
    let documentPattern = /documento\.php\?uuid=.+\&options=.+/

    let match1 = documentPattern.exec(canonicalURL);
    if (match1) {

        return [await puppeteerFetch({ canonicalURL, headers })]
    }
    let urlPattern = /consulta\.php\?searchType=(.+)\&orgaoColegiado=(.+)\&startDate=(.+)\&endDate=(.+)\&start=(.+)/
    let match = urlPattern.exec(canonicalURL);
    if (match) {
        // throw "str"
        let start = parseInt(match[5]);
        let startDate = match[3];
        let endDate = match[4];
        let orgaoColegiado = decodeURIComponent(match[2]);
        //let orgaoColegiado = match[2];
        let searchType = match[1] === 'tipo_decisao_acordao' ? 'acordao' : 'monocratica';
        //throw start
        if (start === 1) {

            let acordaoResponse = await searchAcordao({ canonicalURL, headers, start, startDate, endDate, orgaoColegiado });
            let monocraticaResponse = await searchMonocratica({ canonicalURL, headers, start, startDate, endDate, orgaoColegiado });
            return [acordaoResponse, monocraticaResponse];
        } else {

            return [await pagination({ startDate, endDate, start, canonicalURL, headers, orgaoColegiado, searchType })];
        }
    } else {
        throw new Error("URL does not match the expected pattern");
    }
}


//https://juris.trf2.jus.br/consulta.php?q=start=2&rows=20&dat_jul_ini=2023-06-17&dat_jul_fim=2024-06-06&fq_orgao_colegiado=10a. TURMA ESPECIALIZADA&dec_monocrativa_is2G_true=on
//https://juris.trf2.jus.br/consulta.php?q=start=0&rows=20&dat_jul_ini=2023-01-01&dat_jul_fim=2023-12-31&fq_orgao_colegiado=10a. TURMA ESPECIALIZADA&tipo_decisao_acordao=on
//https://juris.trf2.jus.br/consulta.php?q=start=0&rows=20&dat_jul_ini=2023-01-01&dat_jul_fim=2023-12-31&fq_orgao_colegiado=10a. TURMA ESPECIALIZADA&dec_monocrativa_is2G_true=on
//https://juris.trf2.jus.br/consulta.php?q=&dat_jul_ini=2023-01-01&dat_jul_fim=2023-12-31&fq_orgao_colegiado=10a. TURMA ESPECIALIZADA&dec_monocrativa_is2G_true=on
//https://juris.trf2.jus.br/consulta.php?searchType=dec_monocrativa_is2G_true=on&orgaoColegiado=10a. TURMA ESPECIALIZADA&startDate=2023-01-01&endDate=2023-12-31&start=1
function discoverLinks({ content, contentType, canonicalURL }) {
    const links = [];
    if (contentType === 'text/html') {
        let $ = cheerio.load(content);
        $(".content_ementa").each((index, element) => {
            let pdf = $(element).attr('id');
            let pdfregex = pdf.match(/.+_(.+)/);
            let pdfurl = `https://juris.trf2.jus.br/documento.php?uuid=${pdfregex[1]}&options=%23page%3D1`;
            links.push(pdfurl);
            console.log(pdfurl);
        });

        let urlPattern = /consulta\.php\?searchType=(.+)=on\&orgaoColegiado=(.+)\&startDate=(.+)\&endDate=(.+)\&start=(\d+)/;
        const match = urlPattern.exec(canonicalURL);
        if (match) {
            let start = parseInt(match[5]);
            let startDate = match[3];
            let endDate = match[4];
           let orgaoColegiado = decodeURIComponent(match[2]);
            let searchType = match[1];
            let item = $('#orgao_colegiado_nao_ordenado').text().trim();
            const totalRecordsPattern = item.match(/.+\((\d+)\)/);
            if (totalRecordsPattern) {
                const totalRecords = parseInt(totalRecordsPattern[1]);
                const totalPages = Math.ceil(totalRecords / 20);

                for (let page = 2; page <= totalPages; page++) {
                    if (page !== start) {
                        const nextURL = `https://juris.trf2.jus.br/consulta.php?searchType=${searchType}=on&orgaoColegiado=${orgaoColegiado}&startDate=${startDate}&endDate=${endDate}&start=${page}`;
                        links.push(nextURL);
                    }
                }
            }
        }
    }

    return links;
}