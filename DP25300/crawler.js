function getSeeds() {
    let hrefs = [];
    let date_from = '2023-07-01';
    let date_to = '2024-05-23';
    let court = ["tre-ac", "tre-al", "tre-am", "tre-ap", "tre-ba"]

    court.forEach((court) => {
        let Url = `https://jurisprudencia.${court}.jus.br/sjur-pesquisa-backend/rest/public/pesquisa?court=${court}&date_from=${date_from}&date_to=${date_to}&page=1`;
        hrefs.push(Url);

    })

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

//SOLVERECAPTCHA FUNCTION
// Method to wait for a certain number of seconds
const sleepForSeconds = function (seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};
const solveRecaptcha = async function ({ siteURL = "https://www.tse.jus.br/jurisprudencia/decisoes/jurisprudencia" }) {
  
    const config = {
        headers: {}, // any custom headers
        apiKey: "10122c7066706ebba801995c2e99fbe2", // 2captcha subscription key
        siteKey: "6LeEYa0fAAAAAIwHU9lHw3fahlRNNb6yvv1Fjnbc", // k or data-sitekey
        invisible: true, // is it invisible recaptcha?
        proxy: `lum-customer-vlex-zone-2captcha-country-br:dcohwmkemk0n@zproxy.lum-superproxy.io:22225` // match or remove country if necessary
    };
    let customHeaders = {
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, config.headers);

    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let requestURL = `https://2captcha.com/in.php?key=${config.apiKey}&method=userrecaptcha&googlekey=${config.siteKey}&proxy=${config.proxy}&pageurl=${siteURL}${config.invisible ? "&invisible=1" : ""}&json=1`;
    let responsePage = await fetch(requestURL, requestOptions);
    let j = await responsePage.text();
    let json = JSON.parse(j);
    if (!json || json.status !== 1 || !json.request) throw `Error resolving recaptcha: ${j}`;
    // wait for resolution
    requestURL = `https://2captcha.com/res.php?key=${config.apiKey}&action=get&id=${json.request}&json=1`;
    let gResponse = null;
    let waitLoops = 0;
    do {
        waitLoops++;
        responsePage = await fetch(requestURL, requestOptions);
        j = await responsePage.text();
        console.log(j);
        if (/CAPCHA_NOT_READY/i.test(j)) {
            await sleepForSeconds(10);
            continue;
        }
        json = JSON.parse(j);
        if (!json || json.status !== 1 || !json.request) throw `Error resolving recaptcha: ${j}`;
        gResponse = json.request;
    } while (!gResponse && waitLoops < 10);
    if (!gResponse)
        throw `Error resolving recaptcha, captcha not resolved after total wait duration: ${j}`;
    return gResponse;
};
//fetchdocuments function
async function fetchDocuments({ canonicalURL, headers, date_to, date_from, page, court }) {
    //throw date_to
    // Obtain reCAPTCHA token
    let recaptchaToken = await solveRecaptcha({ siteURL: "https://www.tse.jus.br/jurisprudencia/decisoes/jurisprudencia" });
    let formattedDateFrom = moment(date_from, "DD/MM/YY").format("DD/MM/YYYY");
    let formattedDateTo = moment(date_to, "DD/MM/YY").format("DD/MM/YYYY");
    let payload = {
        "refinaTermos": [],
        "refinaData": [],
        "termoPesquisa": JSON.stringify({
            "bool": {
                "must": [
                    {
                        "terms": {
                            "descricaoTipoDecisao.keyword": [
                                "Acórdão",
                                "Resolução",
                                "Decisão monocrática",
                                "Decisão sem resolução"
                            ]
                        }
                    },
                    {
                        "range": {
                            "dataDecisao": {
                                "gte": formattedDateFrom,
                                "lte": formattedDateTo
                            }
                        }
                    }
                ],
                "filter": [],
                "must_not": [],
                "should": []
            }
        }),
        "refinamento": null,
        "pagina": page - 1,
        "tamanho": 25,
        "ordenacao": "dj",
        "tribunais": ["tse"],
        "recaptchaToken": recaptchaToken
    };
    //throw (JSON.stringify(payload, null, 4))
    let body = JSON.stringify(payload);
    let customHeaders = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Host': `jurisprudencia.${court}.jus.br`,
        'Origin': `https://jurisprudencia.${court}.jus.br`,
        'Pragma': 'no-cache',
        'Referer': `https://jurisprudencia.${court}.jus.br/`,
        'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "POST";
    let requestOptions = { method, headers: _headers, body };
    let requestURL = `https://jurisprudencia.${court}.jus.br/sjur-pesquisa-backend/rest/public/pesquisa`
    //throw requestURL
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions, date_to, date_from, page });
    //throw "gResponse"
    let jsonResponse = await responsePage.response.json();
    if (jsonResponse.content && Array.isArray(jsonResponse.content)) {
        jsonResponse.content.forEach(item => {
            item.pdfUrl = null;
            if (item.temInteiroTeorPDF === 'true') {
                item.pdfUrl = `https://sjur-servicos.tse.jus.br/sjur-servicos/rest/download/pdf/${item.codigoDecisao}`;

            }
        });
    }
    // throw (JSON.stringify(jsonResponse, null, 4))
    let modifiedBody = JSON.stringify(jsonResponse, null, 4);
    responsePage.response.body = modifiedBody;

    return responsePage;

}

// pagination function
async function pagination({ canonicalURL, headers, date_to, date_from, page, court }) {
    // Obtain reCAPTCHA token
    let recaptchaToken = await solveRecaptcha({ siteURL: "https://www.tse.jus.br/jurisprudencia/decisoes/jurisprudencia" });
    let formattedDateFrom = moment(date_from, "DD/MM/YY").format("DD/MM/YYYY");
    let formattedDateTo = moment(date_to, "DD/MM/YY").format("DD/MM/YYYY");
    let payload = {
        "refinaTermos": [],
        "refinaData": [],
        "termoPesquisa": JSON.stringify({
            "bool": {
                "must": [
                    {
                        "terms": {
                            "descricaoTipoDecisao.keyword": [
                                "Acórdão",
                                "Resolução",
                                "Decisão monocrática",
                                "Decisão sem resolução"
                            ]
                        }
                    },
                    {
                        "range": {
                            "dataDecisao": {
                                "gte": formattedDateFrom,
                                "lte": formattedDateTo
                            }
                        }
                    }
                ],
                "filter": [],
                "must_not": [],
                "should": []
            }
        }),
        "refinamento": null,
        "pagina": page - 1,
        "tamanho": 25,
        "ordenacao": "dj",
        "tribunais": ["tse"],
        "recaptchaToken": recaptchaToken
    };

    //throw (JSON.stringify(payload, null, 4))
    let body = JSON.stringify(payload);
    let customHeaders = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Host': `jurisprudencia.${court}.jus.br`,
        'Origin': `https://jurisprudencia.${court}.jus.br`,
        'Pragma': 'no-cache',
        'Referer': `https://jurisprudencia.${court}.jus.br/`,
        'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "POST";
    let requestOptions = { method, headers: _headers, body };
    let requestURL = `https://jurisprudencia.${court}.jus.br/sjur-pesquisa-backend/rest/public/pesquisa`
    //throw requestURL
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions, date_to, date_from, page });
    let jsonResponse = await responsePage.response.json();
    if (jsonResponse.content && Array.isArray(jsonResponse.content)) {
        jsonResponse.content.forEach(item => {
            item.pdfUrl = null;
            if (item.temInteiroTeorPDF === 'true') {
                item.pdfUrl = `https://sjur-servicos.tse.jus.br/sjur-servicos/rest/download/pdf/${item.codigoDecisao}`;

            }
        });
    }
    //throw (JSON.stringify(jsonResponse, null, 4))
    let modifiedBody = JSON.stringify(jsonResponse, null, 4);
    responsePage.response.body = modifiedBody;
    return responsePage;

}

const binaryDownload = async function ({ canonicalURL, requestURL, headers, requestOptions }) {
    let responsePage = await fetchPage({ canonicalURL, requestURL, headers, requestOptions });
    let type = responsePage.response.headers.get('content-type');
    if (/octet/i.test(type)) {
        let name = responsePage.response.headers.get('content-disposition');
        let newtype = /\.pdf/i.test(name) ? "application/pdf" : /\.docx/i.test(name) ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : /\.doc/i.test(name) ? "application/msword" : null;
        console.log('disposition:', type, name);
        if (newtype) {
            responsePage.response.headers.set('content-type', newtype);
            type = newtype;
            type && console.log(`TYPE = ${type}`);
        }
    }
    type && console.log(`TYPE = ${type}`);
    if (responsePage.response.ok && /pdf|word/i.test(type)) {//Make sure your binary fileType is permitted by this regex
        let contentSize = parseInt(responsePage.response.headers.get('content-length') || "-1");
        let buffer = await responsePage.response.buffer();
        let bufferLength = buffer.length;
        if (contentSize < 0 || bufferLength === contentSize) {
            responsePage.response = new fetch.Response(buffer, responsePage.response);
        } else if (contentSize == 0 || bufferLength == 0) {//empty response
            responsePage.response.ok = false;
            responsePage.response.status = 404;
            responsePage.response.statusText = `Empty ${type} document download: ${contentSize} > ${bufferLength}\n`.toUpperCase();
            responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
        } else {
            responsePage.response.ok = false;
            responsePage.response.status = 504;
            responsePage.response.statusText = `incomplete ${type} document download: ${contentSize} > ${bufferLength}\n`.toUpperCase();
            responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
        }
    } else if (responsePage.response.ok && !/pdf|word/i.test(type)) {
        responsePage.response.ok = false;
        responsePage.response.statusText = `either not pdf, or request did not succeed: ${responsePage.response.status} && ${type}\n`.toUpperCase();
        responsePage.response.status = 505;
        responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
    }
    return responsePage;
};



//https://sjur-servicos.tse.jus.br/sjur-servicos/rest/download/pdf/3309066

async function fetchURL({ canonicalURL, headers }) {
    if (canonicalURL === "https://localhost") {
        return [];
    }
    let match = /court=(.+)&date_from=([\d+-]+)&date_to=([\d+-]+)&page=(\d+)/.exec(canonicalURL)
    if (match) {
        let court = match[1]
        // throw court
        let date_from = moment(match[2]).format("DD/MM/YY")
        //throw date_from
        let date_to = moment(match[3]).format("DD/MM/YY")
        let page = match[4] ? parseInt(match[4]) : 1
        if (page === 0) {
            return [await fetchDocuments({ canonicalURL, headers, date_from, date_to, page, court })]
        } else {
            return [await pagination({ canonicalURL, headers, date_from, date_to, page, court })]
        }
    }
    let pdfPattern = /download\/pdf\/(\d+)/.exec(canonicalURL);
    if (pdfPattern) {
        return [await binaryDownload({ canonicalURL, headers })]
    } else {
        return [];
    }

}



//https://sjur-servicos.tse.jus.br/sjur-servicos/rest/download/pdf/3315541
 // https://jurisprudencia.tre-ac.jus.br/sjur-pesquisa-backend/rest/public/pesquisa?date_from=2023-07-23&date_to=2024-05-23&page=1
    //https://jurisprudencia.tre-ac.jus.br/sjur-pesquisa-backend/rest/public/pesquisa
   // https://sjur-servicos.tse.jus.br/sjur-servicos/rest/download/pdf/\d+
   //https://jurisprudencia.tre-ap.jus.br/sjur-pesquisa-backend/rest/public/pesquisa?court=tre-ap&date_from=2023-07-01&date_to=2024-05-31&page=1

   function discoverLinks({ content, contentType, canonicalURL }) {
    const links = [];
    if (contentType === 'application/json') {
        let match = /date_from=([\d+-]+)&date_to=([\d+-]+)&page=(\d+)/.exec(canonicalURL);
        if (match) {
            let currentPage = parseInt(match[3]);
            const jsonResponse = JSON.parse(content);
            const totalRegistros = jsonResponse.totalRegistros;
            const itemsPerPage = 25;
            const totalPages = Math.ceil(totalRegistros / itemsPerPage);
            for (let page = 1; page <= totalPages; page++) {
                if (page !== currentPage) {
                    const nextURL = canonicalURL.replace(/page=\d+/, `page=${page}`);
                    links.push(nextURL);
                }
            }
            jsonResponse.content.forEach(item => {
                if (item.temInteiroTeorPDF === 'true') {
                    let pdfURL = `https://sjur-servicos.tse.jus.br/sjur-servicos/rest/download/pdf/${item.codigoDecisao}`;
                    links.push(pdfURL);
                }
            });
        }
    }
    return links;
}