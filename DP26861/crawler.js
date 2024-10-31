function getSeeds() {
    const startDate = moment('2024-01-01');
    const endDate = moment();
    const seeds = [];
    
    for (let date = startDate; date <= endDate; date.add(1, 'day')) {
        seeds.push(`https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?startDate=${date.format('YYYY-MM-DD')}&endDate=${date.format('YYYY-MM-DD')}&page=1`);
    }
    
    return seeds;
}
async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    if (requestURL.match(/^https/i))
        requestOptions.agent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });
    return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            };
        });
}
async function search({ startDate, endDate, canonicalURL, headers }) {
    startDate = moment(startDate);
    endDate = moment(endDate);
    let payload = {
        action: 'pgLocalizar',
        enviado: 'true',
        numero: '',
        search: '',
        dataInicialEntrada: startDate.format('DD/MM/YYYY'),
        dataFinalEntrada: endDate.format('DD/MM/YYYY'),
        diarioCodigo: '3',
        submit: ' Consultar '
    };
    //throw JSON.stringify(payload,null,2)
    let customHeaders = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.documentos.dioe.pr.gov.br/',
        'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };

    let queryString = Object.entries(payload).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
    let requestURL = `https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?${queryString}`;
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    const $ = cheerio.load(await responsePage.response.text());
    const pdfLinks = [];
    let ecValue;

    $('a.link1').each((i, el) => {
        const href = $(el).attr('href');
        const match = href.match(/javascript:download\('([^']+)',\s*'(\d+)',/);
        if (match) {
            const ec = match[1];
            const arquivoCodigo = match[2];
            pdfLinks.push({ ec, arquivoCodigo });
            if (!ecValue) ecValue = ec;
        }
    });

    if (ecValue) {
        setSharedVariable('ecValue', ecValue);
    } else {
        console.log("No 'ec' value found in the links");
    }
    //throw ecValue
    //throw("Extracted PDF links:", JSON.stringify(pdfLinks, null, 2));
    responsePage.pdfLinks = pdfLinks;
    responsePage.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    responsePage.response = new fetch.Response($.html(), responsePage.response)
    let responses = [responsePage];
    //throw ecValue
    for (let pdfLink of responsePage.pdfLinks) {
        let { ec, arquivoCodigo } = pdfLink;

        // Get and solve captcha
        let { captchaValue } = await fetchCaptchaPage({ canonicalURL, headers, ec, arquivoCodigo });
        //let captchaValue = await solveImageCaptcha({ headers, imgUrl: captchaPage.captchaURL });
        // Submit solved captcha
        await fetchCaptchaDownload({ canonicalURL, headers, ec, arquivoCodigo, imagemVerificacao: captchaValue });
        // Download PDF
        let pdfResponse = await downloadPDF({ canonicalURL, headers, ec, arquivoCodigo });
        responses.push(pdfResponse);
    }

    return responses;
}
//PAGINATION
async function paginatedResults({ startDate, endDate, page, canonicalURL, headers }) {
    let ecValue = getSharedVariable('ecValue');
    if (!ecValue) {
        await search({ startDate, endDate, headers });
        ecValue = getSharedVariable('ecValue');
    }
    //throw ecValue
    let payload = {
        action: 'pgLocalizar',
        enviado: 'true',
        numero: '',
        search: '',
        dataInicialEntrada: moment(startDate).format('DD/MM/YYYY'),
        dataFinalEntrada: moment(endDate).format('DD/MM/YYYY'),
        diarioCodigo: '3',
        submit: ' Consultar ',
        pg: page.toString(),
        qtd: '123',
        ec: ecValue
    };
    //throw JSON.stringify(payload,null,2)
    let customHeaders = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.documentos.dioe.pr.gov.br/',
        'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };

    let queryString = Object.entries(payload).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
    let requestURL = `https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?${queryString}`;

    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    const $ = cheerio.load(responsePage.response.body);
    // Extract PDF links
    const pdfLinks = $('a[href*="consultaPublicaPDF.do?action=pgCaptchaDownload"]').map((i, el) => {
        const href = $(el).attr('href');
        const params = new URLSearchParams(href.split('?')[1]);
        return {
            ec: params.get('ec') || ecValue,
            arquivoCodigo: params.get('arquivoCodigo')
        };
    }).get();

    if (pdfLinks.length === 0) {
        console.log("No PDF links found. HTML content:", $.html());
    }

    responsePage.pdfLinks = pdfLinks;
    return responsePage;
}
//PAGE with IMG SRC
//https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?action=pgCaptchaDownload&tipo=&ec=aDzZDZbDZBdZVDzKDZvDYDdZZ&arquivoCodigo=22569&pg=&janela=dv_ajax_captcha&posicao=undefined
async function fetchCaptchaPage({ canonicalURL, headers, ec, arquivoCodigo }) {
    let customHeaders = {
        'Accept': 'text/javascript, text/html, application/xml, text/xml, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.documentos.dioe.pr.gov.br/',
        'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'X-Prototype-Version': '1.6.0.3',
        'X-Requested-With': 'XMLHttpRequest'
    };

    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };

    let requestURL = `https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?action=pgCaptchaDownload&tipo=&ec=${ec}&arquivoCodigo=${arquivoCodigo}&pg=&janela=dv_ajax_captcha&posicao=undefined`;

    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    // Extract the captcha image URL from the response
    const $ = cheerio.load(await responsePage.response.text());
    let captchaURL = $('img[src*="consultaPublicaPDF.do?action=imagemVerificacao"]').attr('src');
    captchaURL = captchaURL ? url.resolve(canonicalURL, captchaURL) : null;
 //throw captchaURL
 if (!captchaURL) {
        throw new Error("Captcha URL not found in response");
    }

    // Solve the captcha
    let captchaValue = await solveImageCaptcha({ headers, imgUrl: captchaURL });

    // Set the captcha value as a shared variable
    setSharedVariable('captchaValue', captchaValue);

    return { responsePage, captchaURL, captchaValue };

}
//solve captcha
const fetchWithCaptcha = async function ({ canonicalURL, responsePage }) {
    const $ = cheerio.load(await responsePage.response.text());
    let captchaURL = $('img[src*="consultaPublicaPDF.do?action=imagemVerificacao"]').attr('src');
    captchaURL = captchaURL ? url.resolve(canonicalURL, captchaURL) : null;
   
    if (!captchaURL) throw new Error("Captcha URL not found in home:\n");
    let captchaPage = await fetchPage({ canonicalURL: captchaURL, requestOptions: { method: "GET" } });
    console.log("solving captcha");
    let captchaResult = await resolveCaptcha(await captchaPage.response.buffer());
    console.log('captcha result:', captchaResult);
    if (!captchaResult) throw new Error("Captcha not solved successfully: " + captchaResult);

    //you have captcha value as string, use it in form to send

    //PS: This is not for Google ReCaptcha
};

const solveImageCaptcha = async function ({ headers, imgUrl }) {
    //this works if the captcha image is retrieved by simple get request.
    //if the image is retrieved by post request, you may need to pass the form data as well.

    let captchaPage = await fetchPage({ canonicalURL: imgUrl, requestOptions: { method: "GET" } });

    console.log("solving captcha");
    //this function resolveCaptcha is resident in iceberg, it will not work locally on your machine.
    let captchaResult = await resolveCaptcha(await captchaPage.response.buffer());
    console.log('captcha result:', captchaResult);
    if (!captchaResult) throw new Error("Captcha not solved successfully: " + captchaResult);

    return captchaResult;
};
//fUNCTION WITH THE SOLVED VALUE ...DOWNLOADS PDF 
//https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?action=pgCaptchaDownload&tipo=&ec=aDzZDZbDZBdZVDzKDZvDYDdZZ&arquivoCodigo=22569&pg=&janela=dv_ajax_captcha&posicao=undefined&imagemVerificacao=XOTK
async function fetchCaptchaDownload({ canonicalURL, headers, ec, arquivoCodigo, imagemVerificacao }) {
    let customHeaders = {
        'Accept': 'text/javascript, text/html, application/xml, text/xml, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.documentos.dioe.pr.gov.br/',
        'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'X-Prototype-Version': '1.6.0.3',
        'X-Requested-With': 'XMLHttpRequest'
    };

    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };

    let requestURL = `https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?action=pgCaptchaDownload&tipo=&ec=${ec}&arquivoCodigo=${arquivoCodigo}&pg=&janela=dv_ajax_captcha&posicao=undefined&imagemVerificacao=${imagemVerificacao}`;

    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return responsePage;
}
//BINARY DOWNLOAD FUNCTION
const binaryDownload = async function ({ canonicalURL, requestURL, headers, requestOptions }) {
    let responsePage = await fetchPage({ canonicalURL, requestURL, headers, requestOptions });
    let type = responsePage.response.headers.get('content-type');
    if (/octet|force/i.test(type)) {
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
// FUNCTION TO DOWNLOAD PDF 
// https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?action=download&ec=aDzZDZbDZBdZVDzKDZvDYDdZZ&arquivoCodigo=22569
async function downloadPDF({ canonicalURL, headers, arquivoCodigo, ec }) {
    let ecValue = getSharedVariable('ecValue');
    let captchaValue = getSharedVariable('captchaValue');

    //throw captchaValue
    //throw ecValue
    let customHeaders = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.documentos.dioe.pr.gov.br/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    };

    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };

    // First, make the request to pgCaptchaDownload with the solved captcha
    let captchaDownloadURL = `https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?action=pgCaptchaDownload&tipo=&ec=${ecValue}&arquivoCodigo=${arquivoCodigo}&pg=&janela=dv_ajax_captcha&posicao=undefined&imagemVerificacao=${captchaValue}`;
    await fetchPage({ canonicalURL: captchaDownloadURL, requestURL: captchaDownloadURL, requestOptions });

    // Then, make the request to download the PDF
    let pdfURL = `https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?action=download&ec=${ecValue}&arquivoCodigo=${arquivoCodigo}`;
    let pdfResponse = await binaryDownload({ canonicalURL: pdfURL, requestURL: pdfURL, requestOptions });

    return pdfResponse;
}

async function fetchURL({ canonicalURL, headers }) {
    let searchMatch = /startDate=([\d-]+)&endDate=([\d-]+)&page=(\d+)/.exec(canonicalURL);
    if (searchMatch) {
        let startDate = searchMatch[1];
        let endDate = searchMatch[2];
        let page = parseInt(searchMatch[3]);

        let searchResponse;
        if (page === 1) {
            searchResponse = await search({ startDate, endDate, canonicalURL, headers });
        } else {
            searchResponse = await paginatedResults({ startDate, endDate, page, canonicalURL, headers });
        }

        return searchResponse;
    } else {
        let pdfMatch = /action=download&ec=([^&]+)&arquivoCodigo=(\d+)/.exec(canonicalURL);
        if (pdfMatch) {
            let ec = pdfMatch[1];
            let arquivoCodigo = pdfMatch[2];
            let pdfResponse = await binaryDownload({ canonicalURL, headers, ec, arquivoCodigo });
            return [pdfResponse];
        }
        else if (canonicalURL.includes("action=pgCaptchaDownload")) {
            let params = {};
            canonicalURL.split('?')[1].split('&').forEach(param => {
                let [key, value] = param.split('=');
                params[key] = decodeURIComponent(value);
            });

            let ec = params['ec'];
            let arquivoCodigo = params['arquivoCodigo'];
            let imagemVerificacao = params['imagemVerificacao'];

            if (imagemVerificacao) {
                let captchaDownloadResponse = await fetchCaptchaDownload({ canonicalURL, headers, ec, arquivoCodigo, imagemVerificacao });
                return [captchaDownloadResponse];
            } else {
                let captchaResponse = await fetchCaptchaPage({ canonicalURL, headers });
                return [captchaResponse];
            }
        }
    }
}

    //https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?action=download&ec=wKpPKPzKPBkPPKpZKPyKPVkPC&arquivoCodigo=22582
    //https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?startDate=2024-06-27&endDate=2024-06-27&page=1
    //https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?action=pgCaptchaDownload&tipo=&ec=kWyYWYpWYLwYEWyEWKrWYPwKW&arquivoCodigo=22582&pg=&janela=dv_ajax_captcha&posicao=undefined
    function discoverLinks({ content, contentType, canonicalURL }) {
        const $ = cheerio.load(content);
        const links = [];
    
        if (contentType === "text/html") {
            // Extract PDF links
            $('a.link1').each((i, el) => {
                const href = $(el).attr('href');
                const match = href.match(/javascript:download\('([^']+)',\s*'(\d+)',/);
                if (match) {
                    const ec = match[1];
                    const arquivoCodigo = match[2];
                    const pdfURL = `https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?action=download&ec=${ec}&arquivoCodigo=${arquivoCodigo}`;
                    links.push(pdfURL);
                }
            });
    
            return links;
        }
    }