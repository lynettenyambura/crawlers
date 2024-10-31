function getSeeds() {
    let hrefs = [];
    let startDate = '2024-01-01';
    let endDate = '2024-06-17';

    // URL for dec_monocrativa
    let decMonocrativaUrl = `https://juris.trf2.jus.br/consulta.php?type=monocrativa&from=${startDate}&to=${endDate}`;
    hrefs.push(decMonocrativaUrl);

    // URL for tipo_decisao_acordao
    let tipoDecisaoUrl = `https://juris.trf2.jus.br/consulta.php?type=acordao&from=${startDate}&to=${endDate}`;
    hrefs.push(tipoDecisaoUrl);

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
async function homePage({ canonicalURL, headers, startDate, endDate, type }) {
    let customHeaders = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Host": "juris.trf2.jus.br",
        "Pragma": "no-cache",
        "Referer": "https://www.google.com/",
        "Sec-Ch-Ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": "\"Windows\"",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let requestURL = 'https://juris.trf2.jus.br/consulta.php?q=';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    let responseBody = await responsePage.response.text();
    //throw responseBody
    const $ = cheerio.load(responseBody);
    const orgaoValues = [];
    $('.form-check-input.opt_add_filter').each((index, el) => {
        const id = $(el).attr('id');
        const label = $(el).parent().find('label').text().trim();
        if (id && id.includes('fq_orgao_colegiado')) {
            const orgaoValue = label.replace(/ *\([^)]*\) */g, '');
            orgaoValues.push(orgaoValue);
        }
    });
    // throw JSON.stringify(orgaoValues,null,4)

    if (orgaoValues.size === 0) {
        throw new Error('No orgao_colegiado values found');
    }
    const searchUrls = [];
    for (const orgaoValue of orgaoValues) {
        const searchUrl = `https://juris.trf2.jus.br/consulta.php?from=${startDate}&to=${endDate}&type=${type}&fq_orgao_colegiado=${orgaoValue}&page=1`;
        //const searchUrl = `${canonicalURL}&fq_orgao_colegiado=${orgaoValue}&page=1`;
        searchUrls.push(searchUrl);
    }
    // my div for the search urls
    const urlsList = $('<ul>').attr('id', 'searchUrls');
    searchUrls.forEach(url => {
        const orgaoValue = url.split('&fq_orgao_colegiado=')[1].split('&')[0];
        const listItem = $('<li>').appendTo(urlsList);
        $('<a>')
            .attr('href', url)
            .text(orgaoValue)
            .appendTo(listItem);
    });
    $('body').prepend(urlsList);
    responsePage.response.body = $.html();
    // throw JSON.stringify( searchUrls, null, 4)
    return responsePage;
}

async function search({ canonicalURL, headers, startDate, endDate, orgaoColegiado, type, page }) {
    startDate = moment(startDate).format('DD/MM/YYYY');
    endDate = moment(endDate).format('DD/MM/YYYY');
    // throw endDate
    const start = (page - 1) * 20;
    // throw start
    let payload = {
        "start": start,
        "rows": "20",
        "q": "",
        "tip_criterio_data": "DESC",
        "dat_jul_ini": startDate,
        "dat_jul_fim": endDate,
        "numero_processo": "",
        [`fq_orgao_colegiado[${orgaoColegiado}]`]: 'on'
    };
    if (type === 'monocrativa') {
        payload["dec_monocrativa_is2G_true"] = "on";
    } else if (type === 'acordao') {
        payload["tipo_decisao_acordao"] = "on";
    }
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
    let responseBody = await responsePage.response.text();
    const $ = cheerio.load(responseBody);
    // Extract pagination links
    const paginationLinks = [];
    $('nav[aria-label="Page navigation example"] ul.pagination li a.page-link').each((index, element) => {
        const startValue = $(element).attr('start');
        if (startValue) {
            const newPage = (parseInt(startValue) / 20) + 1;
            const newUrl = canonicalURL.replace(/&page=\d+/, `&page=${newPage}`);
            paginationLinks.push(newUrl);
        }
    });
    const paginationLinksList = $('<ul>').attr('id', 'paginationLinks');
    paginationLinks.forEach(url => {
        const listItem = $('<li>').appendTo(paginationLinksList);
        $('<a>')
            .attr('href', url)
            .text(`Page ${url.match(/&page=(\d+)/)[1]}`)
            .appendTo(listItem);
    });
    $('body').append(paginationLinksList);

    responsePage.response.body = $.html();
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
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestOptions });
    return responsePage;
}

async function fetchURL({ canonicalURL, headers }) {
    let documentPattern = /documento\.php\?uuid=.+\&options=.+/
    let match1 = documentPattern.exec(canonicalURL);
    if (match1) {
        // throw canonicalURL
        return [await puppeteerFetch({ canonicalURL, headers })]
    }
    const match = canonicalURL.match(/\/consulta\.php\?type=(.+)&from=(.+)&to=(.+)$/);
    if (match) {
        const type = match[1];
        const startDate = match[2];
        const endDate = match[3];
        return [await homePage({ canonicalURL, headers, startDate, endDate, type })];
    }
    const searchMatch = canonicalURL.match(/\/consulta\.php\?from=(.+)&to=(.+)&type=(.+)&fq_orgao_colegiado=(.+)&page=(.+)/);
    if (searchMatch) {
        const type = searchMatch[3];
        const startDate = searchMatch[1];
        const endDate = searchMatch[2];

        const orgaoColegiado = decodeURI((searchMatch[4]))
        const page = searchMatch[5];
        return [await search({ canonicalURL, headers, startDate, endDate, orgaoColegiado, type, page })];
    }
}


//https://juris.trf2.jus.br/consulta.php?type=monocrativa&from=2024-01-01&to=2024-06-21
//https://juris.trf2.jus.br/consulta.php?type=monocrativa&from=2024-01-01&to=2024-06-21&fq_orgao_colegiado=Assessoria de Recursos&page=1
//https://juris.trf2.jus.br/consulta.php?type=monocrativa&from=2024-01-01&to=2024-06-24&fq_orgao_colegiado=10a. TURMA ESPECIALIZADA&page=1
//https://juris.trf2.jus.br/consulta.php?from=2024-01-01&to=2024-06-25&type=acordao&fq_orgao_colegiado=10a. TURMA ESPECIALIZADA&page=1
//https://juris.trf2.jus.br/documento.php?uuid=384a5eb2676d9d32549804ecf8d40843&options=%23page%3D1
function discoverLinks({ content, contentType, canonicalURL }) {
    const links = [];
    if (contentType === 'text/html') {
        let $ = cheerio.load(content);
        $("a[href]").each(function () {
            links.push($(this).attr("href"));
        })

        $(".content_ementa").each((index, element) => {
            let pdf = $(element).attr('id')
            let pdfregex = pdf.match(/.+_(.+)/)
            let pdfurl = `https://juris.trf2.jus.br/documento.php?uuid=${pdfregex[1]}&options=%23page%3D1`
            links.push(pdfurl)
            console.log(pdfurl)
        })
        let urlPattern = /\/consulta\.php\?from=(.+)&to=(.+)&type=(.+)&fq_orgao_colegiado=(.+)&page=(.+)/;
        const searchMatch = urlPattern.exec(canonicalURL);

        if (searchMatch) {
            const type = searchMatch[3];
            const startDate = searchMatch[1];
            const endDate = searchMatch[2];
            const orgaoValue = (searchMatch[4]);
            const start = searchMatch[5];
             let item = $('#orgao_colegiado_nao_ordenado').text().trim();
            const totalRecordsPattern = item.match(/.+\((\d+)\)/)
            if (totalRecordsPattern) {
                const totalRecords = parseInt(totalRecordsPattern[1]);
                const totalPages = Math.ceil(totalRecords / 20);
                for (let page = 2; page <= totalPages; page++) {
                    if (page !== start) {
                        //const nextStart = page * 20;
                        const nextURL = `https://juris.trf2.jus.br/consulta.php?from=${startDate}&to=${endDate}&type=${type}&fq_orgao_colegiado=${orgaoValue}&page=${page}`;
                        links.push(nextURL);
                    }
                }
            }
        }
    }

    return links;
}