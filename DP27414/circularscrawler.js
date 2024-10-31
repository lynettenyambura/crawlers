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
  
  async function Circularesfunction({ canonicalURL, headers }) {
    const customHeaders = {
      'accept': 'application/json; odata=verbose',
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
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      'x-requested-with': 'XMLHttpRequest'
    };
  
    let requestURL = `https://www.casanare.gov.co/NuestraGestion/_api/web/lists/getbyTitle('Normatividad')/items?$select=Title,LinkFilename,Fecha,Clasificaci_x00f3_n,A_x00f1_o,Descripci_x00f3_n&$top=10000&$filter=substringof(%27Circulares%27,Title)%20or%20substringof(%27Circulares%27,FileLeafRef)%20or%20substringof(%27Circulares%27,Clasificaci_x00f3_n)`;
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return await handleCompressed({ canonicalURL, headers, responsePage });
  }
  async function tiff({ canonicalURL, headers }) {
    const customHeaders = {
      'accept': 'application/json; odata=verbose',
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
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      'x-requested-with': 'XMLHttpRequest'
    };
  
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestOptions });
    return await handleCompressed({ canonicalURL, headers, responsePage });
  }
  const handleCompressed = async function ({ canonicalURL, headers, responsePage }) {
    responsePage = responsePage || await fetchPage({ canonicalURL, headers });
    let out = [];
    let mime = responsePage.response.headers.get('content-type');
    let isRar = !!/rar/i.test(mime);
    let isZip = !!/zip/i.test(mime);
    //throw(JSON.stringify({isRar, isZip, mime}));
    if (responsePage && responsePage.response.ok && (isRar || isZip)) {
      out = isRar ? await unrar({ request: responsePage.request, response: responsePage.response }) :
        await unzip({ request: responsePage.request, response: responsePage.response });
      let accepted = [];
      let $ = cheerio.load("<html lang='en'><body><h2>Contents</h2><ol id='zip-content-links'></ol></body></html>");
      let ul = $("ol#zip-content-links");
      for (let i = 0; i < out.length; i++) {
        let responsePage = out[i];
        responsePage.canonicalURL = encodeURI(decodeURI(responsePage.canonicalURL));
        ul.append(`<li><a href="${responsePage.canonicalURL}">${responsePage.canonicalURL}</a></li>\n`);
        let contentType = responsePage.response.headers.get("content-type");
        if (/empty|spreadsheet|excel/i.test(contentType)) {
          continue;
        }
        //not else
        if (/\.gif?$/i.test(responsePage.canonicalURL)) {
          responsePage.response.headers.set('content-type', "image/gif");
        } else if (/\.png?$/i.test(responsePage.canonicalURL)) {
          responsePage.response.headers.set('content-type', "image/png");
        } else if (/\.jpe?g$/i.test(responsePage.canonicalURL)) {
          responsePage.response.headers.set('content-type', "image/jpeg");
        } else if (/\.tiff?$/i.test(responsePage.canonicalURL)) {
          responsePage.response.headers.set('content-type', "image/tiff");
        } else if (/\.pdf$/i.test(responsePage.canonicalURL)) {
          responsePage.response.headers.set('content-type', "application/pdf");
        } else if (/\.doc$/i.test(responsePage.canonicalURL)) {
          responsePage.response.headers.set('content-type', "application/msword");
        } else if (/\.docx$/i.test(responsePage.canonicalURL)) {
          responsePage.response.headers.set('content-type', "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        } else if (/\.html?$/i.test(responsePage.canonicalURL)) {
          responsePage.response.headers.set('content-type', "text/html");
        } else if (/\.txt$/i.test(responsePage.canonicalURL)) {
          responsePage.response.headers.set('content-type', "text/plain");
          //} else if (/\.xml$/i.test(responsePage.canonicalURL)) {
          //  responsePage.response.headers.set('content-type', "text/xml");
        } else if (/\.json$/i.test(responsePage.canonicalURL)) {
          responsePage.response.headers.set('content-type', "application/json");
        } else if (/\.xlsx/i.test(responsePage.canonicalURL)) {
          responsePage.response.headers.set('content-type', "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        } else {
          continue;
        }
        accepted.push(responsePage);
      }
      out = accepted;
      out.push(simpleResponse({ canonicalURL, mimeType: "text/html", responseBody: $.html() }))
    } //else out = [responsePage];
    if (out.length === 0) {
      out.push(responsePage);
    }
  
    return out;
  };
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
  async function fetchURL({ canonicalURL, headers }) {
    const pdfPattern = /https:\/\/www.casanare.gov.co\/NuestraGestion\/Normatividad\/.+(.PDF|pdf)/;
    const tiffPattern = /https:\/\/www.casanare.gov.co\/NuestraGestion\/Normatividad\/.+\.tif/;
    const circularsPattern = /https:\/\/www.casanare.gov.co\/NuestraGestion\/Paginas\/Normatividad.aspx\?circulars&year=.+/;
  
    if (circularsPattern.test(canonicalURL)) {
      return await Circularesfunction({ canonicalURL, headers });
    }
    else if (/https:\/\/www.casanare.gov.co\/NuestraGestion\/Paginas\/Normatividad.aspx/.test(canonicalURL)) {
      return [await Home({ canonicalURL, headers })];
    }
    else if (pdfPattern.test(canonicalURL)) {
      return [await getContent({ canonicalURL, headers })];
    }
    else if (tiffPattern.test(canonicalURL)) {
      return await tiff({ canonicalURL, headers });
    }
  
  }
  
  
  //https://www.casanare.gov.co/NuestraGestion/_api/web/lists/getbyTitle('Normatividad')/items?$select=Title,LinkFilename,Fecha,Clasificaci_x00f3_n,A_x00f1_o,Descripci_x00f3_n&$top=10000&$filter=substringof(%27Circulares%27,Title)%20or%20substringof(%27Circulares%27,FileLeafRef)%20or%20substringof(%27Circulares%27,Clasificaci_x00f3_n)
  //https://www.casanare.gov.co/NuestraGestion/_api/web/lists/getbyTitle('Normatividad')/items?$select=Title,LinkFilename,Fecha,Clasificaci_x00f3_n,A_x00f1_o,Descripci_x00f3_n&$top=10000&$filter=substringof('Circulares',Title) or substringof('Circulares',FileLeafRef) or substringof('Circulares',Clasificaci_x00f3_n)
  
  //https://www.casanare.gov.co/NuestraGestion/_api/web/lists/getbyTitle('Normatividad')/items?$select=Title,LinkFilename,Fecha,Clasificaci_x00f3_n,A_x00f1_o,Descripci_x00f3_n&$top=10000&$filter=substringof(%27Circulares%27,Title)%20or%20substringof(%27Circulares%27,FileLeafRef)%20or%20substringof(%27Circulares%27,Clasificaci_x00f3_n)
  //https://www.casanare.gov.co/NuestraGestion/_api/web/lists/getbyTitle('Normatividad')/items?$select=Title,LinkFilename,Fecha,Clasificaci_x00f3_n,A_x00f1_o,Descripci_x00f3_n&$top=10000&$filter=substringof('Circulares',Title) or substringof('Circulares',FileLeafRef) or substringof('Circulares',Clasificaci_x00f3_n)
  function discoverLinks({ content, contentType, canonicalURL }) {
    const links = [];
  
    if (contentType === 'application/json') {
      try {
        const jsonResponse = JSON.parse(content);
  
        if (jsonResponse.d && jsonResponse.d.results && Array.isArray(jsonResponse.d.results)) {
          jsonResponse.d.results.forEach(item => {
            if (item.LinkFilename) {
              const pdfURL = `https://www.casanare.gov.co/NuestraGestion/Normatividad/${encodeURIComponent(item.LinkFilename)}`;
              links.push(pdfURL);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  
    return links;
  }