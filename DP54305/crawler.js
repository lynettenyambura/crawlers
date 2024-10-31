function getSeeds() {
    const startDate = moment('2023-01-01');
    const endDate = moment(); // current date
    const seeds = [];

    while (startDate.isSameOrBefore(endDate)) {
        const formattedDate = startDate.format('YYYY/MM/DD');
        //https://bop.dipucr.es/bop/2024/10/29
        const url = `https://bop.dipucr.es/bop/${formattedDate}`;
        seeds.push(url);
        startDate.add(1, 'days');
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

async function search({ canonicalURL, headers, year, month, day }) {
    const customHeaders = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Pragma": "no-cache",
        "Referer": "https://bop.dipucr.es/",
        "Sec-CH-UA": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
        "Sec-CH-UA-Mobile": "?0",
        "Sec-CH-UA-Platform": "\"Windows\"",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
    };
    let requestURL = `https://bop.dipucr.es/bop/${year}/${month}/${day}`;
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return responsePage;
}
async function fetchPDF({ canonicalURL, headers }) {
    let customHeaders = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Pragma": "no-cache",
        "Referer": "https://bop.dipucr.es/",
        "Sec-Ch-Ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": "\"Windows\"",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    };
    let _headers = Object.assign(customHeaders, headers);
    let requestOptions = { method: "GET", headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL: canonicalURL, requestOptions });

    return responsePage;
}
async function fetchURL({ canonicalURL, headers }) {
    const searchpattern = /https:\/\/bop.dipucr.es\/bop\/\d{4}\/\d{2}\/\d{2}/;
    if (searchpattern.test(canonicalURL)) {
        const [, year, month, day] = canonicalURL.match(/(\d{4})\/(\d{2})\/(\d{2})/);
        return [await search({ canonicalURL, headers, year, month, day })];
    }
    else if (canonicalURL.match(/https:\/\/se1.dipucr.es:4443\/SIGEM_BuscadorDocsWeb\/getDocument.do\?entidad=.+&doc=.+/)) {
        const pdfResponse = await fetchPDF({ canonicalURL, headers });
        return [pdfResponse];
    }

}