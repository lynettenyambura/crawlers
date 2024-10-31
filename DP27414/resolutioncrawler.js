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
async function Home({ canonicalURL, headers }) {
    const customHeaders = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'connection': 'keep-alive',
        'host': 'www.casanare.gov.co',
        'pragma': 'no-cache',
        'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    };

    let requestURL = 'https://www.casanare.gov.co/NuestraGestion/Paginas/Normatividad.aspx';
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    responsePage.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    return responsePage;
}
async function Resoluciones({ canonicalURL, headers }) {
    const customHeaders = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'connection': 'keep-alive',
        'host': 'www.casanare.gov.co',
        'pragma': 'no-cache',
        'referer': 'https://www.casanare.gov.co/NuestraGestion/Paginas/Normatividad.aspx',
        'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    };
    let requestURL = 'https://www.casanare.gov.co/NuestraGestion/Paginas/Resoluciones.aspx';
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    const content = await responsePage.response.text();
    const $ = cheerio.load(content);

    // Extract WPQ1ListData
    let wpq1ListData;
    $('script').each((index, element) => {
        const scriptContent = $(element).html();
        const match = scriptContent.match(/var WPQ1ListData = ({[^;]+});/);
        if (match) {
            wpq1ListData = JSON.parse(match[1]);
            return false;
        }
    });

    if (wpq1ListData) {
        //throw "Extracted WPQ1ListData: " + JSON.stringify(wpq1ListData);
        responsePage.wpq1ListData = wpq1ListData;
    }
    //throw JSON.stringify("Extracted WPQ1ListData:", wpq1ListData);
    // Generate dependencia URLs
    const dependenciaURLs = generateDependenciaURLs(wpq1ListData);

    let urlsDiv = $('<div id="generatedUrls"></div>');

    dependenciaURLs.forEach(urlObj => {
        const urlWithItemCount = `${urlObj.url}&itemCount=${urlObj.itemCount}`;
        urlsDiv.append(`<a href="${urlWithItemCount}">${urlObj.dependencia} - Year ${urlObj.year} - Page ${urlObj.page}</a><br>`);
    });
    $('body').prepend(urlsDiv);
    responsePage.response = new fetch.Response($.html(), responsePage.response)

    return responsePage;
}
function generateDependenciaURLs(wpq1ListData) {
    const urls = [];
    const baseURL = 'https://www.casanare.gov.co/NuestraGestion/_layouts/15/inplview.aspx';

    wpq1ListData.Row.forEach(row => {
        if (row.Dependencia && row.A_x00f1_o) {
            const year = row.A_x00f1_o;
            const itemCount = parseInt(row['A_x00f1_o.COUNT.group2']) || 0;
            const pageCount = Math.ceil(itemCount / 30);

            for (let page = 1; page <= pageCount; page++) {
                const url = `${baseURL}?year=${year}&dependencia=${encodeURIComponent(row.Dependencia)}&page=${page}`;
                urls.push({ dependencia: row.Dependencia, url, page, itemCount, year });
            }
        }
    });

    return urls;
}

async function getContent({ canonicalURL, headers }) {
    const customHeaders = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'connection': 'keep-alive',
        'host': 'www.casanare.gov.co',
        'pragma': 'no-cache',
        'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    };

    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestOptions });
    return responsePage;
}
function extractParams(nextHref) {
    if (!nextHref) return {};
    const params = {};
    nextHref.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return params;
}
async function Resolutions_Year({ canonicalURL, headers, year, dependencia, page = 1, itemCount }) {
    const customHeaders = {
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'connection': 'keep-alive',
        'content-type': 'application/x-www-form-urlencoded',
        'host': 'www.casanare.gov.co',
        'origin': 'https://www.casanare.gov.co',
        'pragma': 'no-cache',
        'referer': 'https://www.casanare.gov.co/NuestraGestion/Paginas/Resoluciones.aspx',
        'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    };

    const baseURL = 'https://www.casanare.gov.co/NuestraGestion/_layouts/15/inplview.aspx';
    let requestURL = `${baseURL}?List={84F5FE97-0935-4BC6-BACE-8BC226422C06}&View={64EF2099-8BD2-4C65-A5F3-DA094657A0DE}&ViewCount=0&IsXslView=TRUE&IsCSR=TRUE&GroupString=%3B%23${dependencia}%3B%23${year}%3B%23&IsGroupRender=TRUE&WebPartID={64EF2099-8BD2-4C65-A5F3-DA094657A0DE}`;
    //throw requestURL
    let _headers = Object.assign(customHeaders, headers);
    let method = "POST";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });

    let data = JSON.parse(await responsePage.response.text());
    const fetchedItemCount = data.Row ? data.Row.length : 0;
    const hasMorePages = fetchedItemCount < itemCount;

    if (data.NextHref && hasMorePages) {
        setSharedVariable('nextHref', data.NextHref);
    } else {
        setSharedVariable('nextHref', null);
    }
    responsePage.response.headers.set('Content-Type', 'application/json');
    responsePage.response = new fetch.Response(JSON.stringify(data), responsePage.response);
    return responsePage;
}
async function prepareNextHref(url) {
    const WebPartID = getParameterValue(url, "View")
    url = url.replace(/&View=.+$/, `&IsGroupRender=TRUE&WebPartID={${WebPartID}}`).replace(/^\?/, "&")
    return url
}

function getParameterValue(url, paramName) {
    const queryString = url.split('?')[1];
    if (!queryString) {
        return null;
    }

    const params = queryString.split('&');
    for (let i = 0; i < params.length; i++) {
        const paramPair = params[i].split('=');
        if (paramPair[0] === paramName) {
            return decodeURIComponent(paramPair[1]);
        }
    }
    return null;
}

async function Resolutions_Year_Pagination({ canonicalURL, headers, year, dependencia, page, itemCount }) {
    let customHeaders = {
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'connection': 'keep-alive',
        'content-type': 'application/x-www-form-urlencoded',
        'host': 'www.casanare.gov.co',
        'origin': 'https://www.casanare.gov.co',
        'pragma': 'no-cache',
        'referer': 'https://www.casanare.gov.co/NuestraGestion/Paginas/Resoluciones.aspx',
        'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    };

    let baseURL = 'https://www.casanare.gov.co/NuestraGestion/_layouts/15/inplview.aspx?List={84F5FE97-0935-4BC6-BACE-8BC226422C06}&View={64EF2099-8BD2-4C65-A5F3-DA094657A0DE}&ViewCount=4&IsXslView=TRUE&IsCSR=TRUE';

    const maxRetries = 10;
    let retries = 0;
    let success = false;

    while (retries < maxRetries && !success) {
        try {
            // Get the NextHref 
            let nextHref = getSharedVariable('nextHref');
            
            if (!nextHref) {
                const newcanonicalURL = canonicalURL.replace(/page=.+$/, "page=1");
                await Resolutions_Year({ canonicalURL: newcanonicalURL, headers, year, dependencia, page: 1, itemCount });
                nextHref = getSharedVariable('nextHref');
            }

            if (!nextHref) {
                throw new Error('NextHref not available after initial request');
            }

            nextHref = await prepareNextHref(nextHref);
            let requestURL = `${baseURL}${nextHref}`;

            let _headers = Object.assign(customHeaders, headers);
            let method = "POST";
            let requestOptions = { method, headers: _headers };
            let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });

            let data = JSON.parse(await responsePage.response.text());
            const totalFetchedItems = (page - 1) * 30 + (data.Row ? data.Row.length : 0);
            const hasMorePages = totalFetchedItems < itemCount;

            if (data.NextHref && hasMorePages) {
                setSharedVariable('nextHref', data.NextHref);
            } else {
                setSharedVariable('nextHref', null);
            }

            responsePage.response.headers.set('Content-Type', 'application/json');
            responsePage.response = new fetch.Response(JSON.stringify(data), responsePage.response);

            success = true;
            return responsePage;
        } catch (error) {
            console.error(`Attempt ${retries + 1} failed: ${error.message}`);
            retries++;
            if (retries >= maxRetries) {
                throw new Error(`Failed to fetch data after ${maxRetries} attempts: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
    }
}


async function fetchURL({ canonicalURL, headers }) {
    const normatividadPattern = /https:\/\/www.casanare.gov.co\/NuestraGestion\/Paginas\/Normatividad.aspx/;
    const resolucionesPattern = /https:\/\/www.casanare.gov.co\/NuestraGestion\/Paginas\/Resoluciones.aspx/;
    const dependenciaPattern = /https:\/\/www\.casanare\.gov\.co\/NuestraGestion\/_layouts\/15\/inplview\.aspx\?year=(\d{4})&dependencia=([^&]+)&page=(\d+)(?:&itemCount=(\d+))?/;
    const pdfPattern = /https:\/\/www.casanare.gov.co\/NuestraGestion\/Normatividad\/.+(.PDF|pdf)/;

    if (normatividadPattern.test(canonicalURL)) {
        return [await Home({ canonicalURL, headers })];
    } else if (resolucionesPattern.test(canonicalURL)) {
        return [await Resoluciones({ canonicalURL, headers })];
    } else if (dependenciaPattern.test(canonicalURL)) {
        const matched = canonicalURL.match(dependenciaPattern);
        if (matched) {
            const year = matched[1];
            const dependencia = matched[2];
            const page = parseInt(matched[3]);
            const itemCount = parseInt(matched[4] || '0');

            if (page === 1) {
                return [await Resolutions_Year({ canonicalURL, headers, year, dependencia, page, itemCount })];
            } else {
                //await Resolutions_Year({ canonicalURL, headers, year, dependencia, page, itemCount })
                return [await Resolutions_Year_Pagination({ canonicalURL, headers, year, dependencia, page, itemCount })];
            }
        }
    } else if (pdfPattern.test(canonicalURL)) {
        return [await getContent({ canonicalURL, headers })];
    }
}