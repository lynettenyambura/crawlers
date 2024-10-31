function getSeeds() {
    const startDate = moment('2024-01-01');
    const endDate = moment(); // current date
    const seeds = [];

    while (startDate.isSameOrBefore(endDate)) {
        const formattedDate = startDate.format('DD/MM/YYYY');
        const url = `https://sede.diputacionalicante.es/consultas-bop/search?date=${formattedDate}`;
        seeds.push(url);
        startDate.add(1, 'days');
    }

    return seeds;
}

//2024-01-05
async function fetchPage({ canonicalURL, requestURL, requestOptions, headers }) {
    if (!requestOptions) requestOptions = { method: "GET", headers };
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;

    return await fetchWithCookies(requestURL, requestOptions, 'zone-g1-country-es')
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({ URL: requestURL }, requestOptions),
                response
            };
        });
}
async function fetchResults({ date, headers }) {
    let customHeaders = {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Host": "sede.diputacionalicante.es",
        "Pragma": "no-cache",
        "Referer": "https://sede.diputacionalicante.es/consultas-bop/",
        "Sec-Ch-Ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": "\"Windows\"",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
    };
    let _headers = Object.assign(customHeaders, headers);
    let param = encodeURIComponent(`<raiz><entrada><registro><fechaPub>${date}</fechaPub><tipoorganismo></tipoorganismo></registro></entrada></raiz>`);
    let requestURL = `https://sede.diputacionalicante.es/wp-content/themes/Desarrollo-Diputacion/webservices/wseConsultaAjax.php?nemo=BOP_CON&param=${param}&usuario=-`;
    let requestOptions = { method: "GET", headers: _headers };
    let responsePage = await fetchPage({ canonicalURL: requestURL, requestURL, requestOptions });
    if (!responsePage.response.ok) {
        console.error(`HTTP error! status: ${responsePage.response.status}`);
        responsePage.response.body = JSON.stringify({ error: "HTTP Error", status: responsePage.response.status }, null, 2);
        responsePage.response.headers.set('Content-Type', 'application/json');
        return responsePage;
    }
    let rawResponse = await responsePage.response.text();
    console.log("Raw API response:", rawResponse);

    let results;
    try {
        results = JSON.parse(rawResponse);
        if (results.error) {
            console.error("API returned an error:", results.error);
            responsePage.response.body = JSON.stringify({ error: "API Error", message: results.error }, null, 2);
            responsePage.response.headers.set('Content-Type', 'application/json');
            return responsePage;
        }
        // Continue processing if it's not an error
    } catch (error) {
        console.error("Error parsing JSON:", error);
        responsePage.response.body = JSON.stringify({ error: "Failed to parse API response", rawResponse }, null, 2);
        responsePage.response.headers.set('Content-Type', 'application/json');
        return responsePage;
    }
    //throw("Raw API response:", rawResponse);
    //throw ("Parsed results:", results);
    if (results && results.boletin && results.boletin.boletin && Array.isArray(results.boletin.boletin)) {
        results.boletin.boletin = results.boletin.boletin.map(result => {
            if (result.registro && result.registro.sumario) {
                return {
                    url: canonicalURL,
                    method: "GET",
                    headers: _headers,
                    data: result
                };
            }
            return null;
        }).filter(item => item !== null);
    }
    if (results && results.boletin && results.boletin.bop && Array.isArray(results.boletin.bop)) {
        const pdfUrls = results.boletin.bop.flatMap(item =>
            item.registro.map(reg => reg.ubicacion[0])
        ).filter(url => url && url.endsWith('.pdf'));
        results.pdfUrls = pdfUrls;
    }
    // } else {
    //     console.error("Unexpected API response structure:", results);
    responsePage.response.body = JSON.stringify({ data: results }, null, 2);
    responsePage.response.headers.set('Content-Type', 'application/json');
    return responsePage;
}
async function fetchPDF({ canonicalURL, headers }) {
    let customHeaders = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Host": "www.dip-alicante.es",
        "Pragma": "no-cache",
        "Referer": "https://sede.diputacionalicante.es/",
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
  const dateMatch = canonicalURL.match(/https:\/\/sede\.diputacionalicante\.es\/consultas-bop\/search\?date=(\d{2}\/\d{2}\/\d{4})/);

  if (dateMatch) {
    const date = dateMatch[1];
    const results = await fetchResults({ canonicalURL, date, headers });
    
    let pdfResponses = [];
    if (results.response && results.response.body) {
      const bodyJson = JSON.parse(results.response.body);
      if (bodyJson.data && bodyJson.data.boletin && bodyJson.data.boletin.bop) {
        const pdfUrls = bodyJson.data.boletin.bop.flatMap(item => 
          item.registro.map(reg => reg.ubicacion[0])
        ).filter(url => url && url.endsWith('.pdf'));

        pdfResponses = await Promise.all(pdfUrls.map(url => fetchPDF({ canonicalURL: url, headers })));
      }
    }

    const modifiedResults = {
      ...results,
      url: canonicalURL,
      canonicalURL: canonicalURL
    };

    return [modifiedResults, ...pdfResponses];
  } else if (canonicalURL.match(/\.pdf$/)) {
    const pdfResponse = await fetchPDF({ canonicalURL, headers });
    return [pdfResponse];
  } else {
    const responsePage = await fetchPage({ canonicalURL, requestURL: canonicalURL, headers });
    const content = await responsePage.response.text();
    const contentType = responsePage.response.headers.get('Content-Type');

    const pdfLinks = discoverLinks({ content, contentType, canonicalURL });

    if (pdfLinks.length > 0) {
      const pdfResponses = await Promise.all(pdfLinks.map(link => fetchPDF({ canonicalURL: link, headers })));
      return [responsePage, ...pdfResponses];
    } else {
      return [responsePage];
    }
  }
}
function discoverLinks({ content, contentType, canonicalURL }) {
    const urls = [];
    if (contentType === "text/html") {
      const $ = cheerio.load(content);
  
      $("a[href]").each(function () {
        const href = $(this).attr("href");
        if (href && href.endsWith(".pdf")) {
          urls.push(href);
        }
      });
    }
    return urls;
  }