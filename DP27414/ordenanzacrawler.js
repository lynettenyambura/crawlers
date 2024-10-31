function getSeeds() {
    const years = [2022, 2023, 2024];
    return years.map(year => `https://www.casanare.gov.co/NuestraGestion/_layouts/15/inplview.aspx?year=${year}&page=1`);
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
  async function Ordenanzas({ canonicalURL, headers }) {
    const customHeaders = {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      'connection': 'keep-alive',
      'host': 'www.casanare.gov.co',
      'pragma': 'no-cache',
      'referer': 'https://www.casanare.gov.co/NuestraGestion/Paginas/OrdenanzasCas.aspx',
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
    let requestURL = 'https://www.casanare.gov.co/NuestraGestion/Paginas/OrdenanzasCas.aspx';
    //throw requestURL
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    responsePage.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    return responsePage;
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
    responsePage.response.headers.set('Content-Type', 'application/pdf');
    return responsePage;
  }
  async function Ordenanza_Year_FirstPage({ canonicalURL, headers, year }) {
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
      'referer': 'https://www.casanare.gov.co/NuestraGestion/Paginas/OrdenanzasCas.aspx',
      'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    };
  
    let baseURL = 'https://www.casanare.gov.co/NuestraGestion/_layouts/15/inplview.aspx';
    let payload = {
      'List': '{84F5FE97-0935-4BC6-BACE-8BC226422C06}',
      'View': '{A8C1F90B-130E-4DEC-AEE3-C3955BACF2E4}',
      'ViewCount': 193,
      'IsXslView': 'TRUE',
      'IsCSR': 'TRUE',
      'GroupString': `;#${year};#`,
      'IsGroupRender': 'TRUE',
      'WebPartID': '{A8C1F90B-130E-4DEC-AEE3-C3955BACF2E4}'
    };
    //throw JSON.stringify(payload)
    let queryString = Object.entries(payload)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  
    let requestURL = `${baseURL}?${queryString}`;
    //throw requestURL
    let _headers = Object.assign(customHeaders, headers);
    let method = "POST";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    let data = JSON.parse(await responsePage.response.text());
    let nextHref = data.NextHref;
    setSharedVariable('nextHref', nextHref);
    responsePage.response.headers.set('Content-Type', 'application/json');
    //throw nextHref
    //throw JSON.stringify(data)
    responsePage.response = new fetch.Response(JSON.stringify(data), responsePage.response);
    // responsePage.response = new fetch.Response(JSON.stringify(data), {
    //     status: responsePage.response.status,
    //     statusText: responsePage.response.statusText,
    //     headers: responsePage.response.headers
    // });
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
  
  async function Ordenanza_Year_Pagination({ canonicalURL, headers, year, page }) {
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
      'referer': 'https://www.casanare.gov.co/NuestraGestion/Paginas/OrdenanzasCas.aspx',
      'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    };
  
    let baseURL = 'https://www.casanare.gov.co/NuestraGestion/_layouts/15/inplview.aspx';
  
    // Use the stored nextHref from the previous request
    let storedNextHref = getSharedVariable('nextHref');
  
    // Extract parameters from storedNextHref
    const extractedParams = extractParams(storedNextHref);
    //throw("Extracted parameters:", JSON.stringify(extractedParams, null, 2));
    let payload = {
      List: '{84F5FE97-0935-4BC6-BACE-8BC226422C06}',
      View: '{A8C1F90B-130E-4DEC-AEE3-C3955BACF2E4}',
      ViewCount: extractedParams.ViewCount || '30',
      IsXslView: 'TRUE',
      IsCSR: 'TRUE',
      Paged: 'TRUE',
      p_A_x00f1_o: year,
      p_SortBehavior: extractedParams.p_SortBehavior || '0',
      p_Title: extractedParams.p_Title || '',
      p_Fecha: extractedParams.p_Fecha || '',
      p_ID: extractedParams.p_ID || '',
      GroupString: `;#${year};#`,
      PageFirstRow: extractedParams.PageFirstRow || ((page - 1) * 30 + 1).toString(),
      IsGroupRender: 'TRUE',
      WebPartID: '{A8C1F90B-130E-4DEC-AEE3-C3955BACF2E4}'
    };
  
    //throw("Final payload:", JSON.stringify(payload, null, 2));
    let queryString = Object.entries(payload)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  
    let requestURL = `${baseURL}?${queryString}`;
    //throw ("Request URL:", requestURL);
    let _headers = Object.assign(customHeaders, headers);
    let method = "POST";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    // Extract the new NextHref for the next page
    let data = JSON.parse(await responsePage.response.text());
    let newNextHref = data.NextHref;
    setSharedVariable('nextHref', newNextHref); // Store for the next request
  
  
    responsePage.response.headers.set('Content-Type', 'application/json');
    //throw JSON.stringify(data)
    responsePage.response = new fetch.Response(JSON.stringify(data), responsePage.response);
    // responsePage.response = new fetch.Response(JSON.stringify(data), {
    //     status: responsePage.response.status,
    //     statusText: responsePage.response.statusText,
    //     headers: responsePage.response.headers
    // });
    return responsePage;
  }
  
  // async function fetchURL({ canonicalURL, headers }) {
  //     const HomePattern = /https:\/\/www\.casanare\.gov\.co\/NuestraGestion\/Paginas\/Normatividad\.aspx/;
  //     const OrdenanzaPattern = /https:\/\/www\.casanare\.gov\.co\/NuestraGestion\/Paginas\/OrdenanzasCas\.aspx/;
  //     const yearPattern = /https:\/\/www\.casanare\.gov\.co\/NuestraGestion\/_layouts\/15\/inplview\.aspx\?year=(\d{4})(?:&page=(\d+))?/;
  //     const pdfPattern = /https:\/\/www\.casanare\.gov\.co\/NuestraGestion\/Normatividad\/.+\.pdf/;
  
  //     if (HomePattern.test(canonicalURL)) {
  //         return [await Home({ canonicalURL, headers })];
  //     } else if (OrdenanzaPattern.test(canonicalURL)) {
  //         return [await Ordenanzas({ canonicalURL, headers })];
  //     } else if (yearPattern.test(canonicalURL)) {
  //         const matched = canonicalURL.match(yearPattern);
  //         if (matched) {
  //             let year = matched[1];
  //             let page = matched[2] ? parseInt(matched[2]) : 1;
  
  //             if (page === 1) {
  //                 let response = await Ordenanza_Year_FirstPage({ canonicalURL, headers, year });
  //                 return [response];
  //             } else {
  //                 let response = await Ordenanza_Year_Pagination({ canonicalURL, headers, year, page });
  //                 await Ordenanza_Year_FirstPage({ canonicalURL, headers,year })
  //                 return [response];
  //             }
  //         }
  
  //     } else if (pdfPattern.test(canonicalURL)) {
  //         return [await getContent({ canonicalURL, headers })];
  //     }
  
  //     return [];
  // }
  async function fetchURL({ canonicalURL, headers }) {
    const HomePattern = /https:\/\/www\.casanare\.gov\.co\/NuestraGestion\/Paginas\/Normatividad\.aspx/;
    const OrdenanzaPattern = /https:\/\/www\.casanare\.gov\.co\/NuestraGestion\/Paginas\/OrdenanzasCas\.aspx/;
    const yearPattern = /https:\/\/www\.casanare\.gov\.co\/NuestraGestion\/_layouts\/15\/inplview\.aspx\?year=(\d{4})(?:&page=(\d+))?/;
    const pdfPattern = /https:\/\/www\.casanare\.gov\.co\/NuestraGestion\/Normatividad\/.+\.pdf/;
  
    if (HomePattern.test(canonicalURL)) {
      return [await Home({ canonicalURL, headers })];
    } else if (OrdenanzaPattern.test(canonicalURL)) {
      return [await Ordenanzas({ canonicalURL, headers })];
    } else if (yearPattern.test(canonicalURL)) {
      const matched = canonicalURL.match(yearPattern);
      if (matched) {
        let year = matched[1];
        let page = matched[2] ? parseInt(matched[2]) : 1;
  
        // Always fetch page 1 first
        let firstPageURL = `https://www.casanare.gov.co/NuestraGestion/_layouts/15/inplview.aspx?year=${year}&page=1`;
        await Ordenanza_Year_FirstPage({ canonicalURL: firstPageURL, headers, year });
  
        // If the requested page is not 1, fetch it after fetching page 1
        if (page !== 1) {
          let response = await Ordenanza_Year_Pagination({ canonicalURL, headers, year, page });
          return [response];
        } else {
          return [await Ordenanza_Year_FirstPage({ canonicalURL, headers, year })];
        }
      }
    } else if (pdfPattern.test(canonicalURL)) {
      return [await getContent({ canonicalURL, headers })];
    }
  
  }
  
  
  //https://www.casanare.gov.co/NuestraGestion/_layouts/15/inplview.aspx?year=2024&page=2
  //https://www.casanare.gov.co/NuestraGestion/_layouts/15/inplview.aspx?List={84F5FE97-0935-4BC6-BACE-8BC226422C06}&View={A8C1F90B-130E-4DEC-AEE3-C3955BACF2E4}&ViewCount=145&IsXslView=TRUE&IsCSR=TRUE&GroupString=%3B%232024%3B%23&IsGroupRender=TRUE&WebPartID={A8C1F90B-130E-4DEC-AEE3-C3955BACF2E4}
  function discoverLinks({ content, contentType, canonicalURL }) {
    const links = [];
  
    if (contentType === 'application/json') {
      try {
        const jsonResponse = JSON.parse(content);
  
        //  PDF links
        if (jsonResponse && jsonResponse.Row && Array.isArray(jsonResponse.Row)) {
          jsonResponse.Row.forEach(item => {
            if (item.FileLeafRef) {
              const pdfURL = `https://www.casanare.gov.co/NuestraGestion/Normatividad/${encodeURIComponent(item.FileLeafRef)}`;
              links.push(pdfURL);
            }
          });
        }
  
        //  pagination
        if (jsonResponse.FirstRow && jsonResponse.LastRow) {
          const currentYear = new URL(canonicalURL).searchParams.get('year');
          const currentPage = parseInt(new URL(canonicalURL).searchParams.get('page') || '1');
          const totalItems = jsonResponse.LastRow;
          const itemsPerPage = 30; 
          const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  
          for (let i = 1; i <= totalPages; i++) {
            if (i !== currentPage) {
              links.push(`https://www.casanare.gov.co/NuestraGestion/_layouts/15/inplview.aspx?year=${currentYear}&page=${i}`);
            }
          }
        }
  
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  
    return links;
  }