function getSeeds(){
    return [`https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AE003`]
}
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
async function fetchPageWithState({ canonicalURL, headers }) {
    let customHeaders = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Priority": "u=0, i",
        "Referer": "https://www.google.com/",
        "Sec-Ch-Ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": "\"Windows\"",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    };

    let method = "GET";
    let _headers = Object.assign(customHeaders, headers);
    let requestOptions = { method, headers: _headers };
    let requestURL = 'https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AE003';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    let html = await responsePage.response.text();
    let $ = cheerio.load(html);
    let viewState = $('input[name="javax.faces.ViewState"]').val();
    setSharedVariable('viewState', viewState);
    $('a').each((index, element) => {
        if ($(element).text().trim() == "Actos y resoluciones con efectos sobre terceros") {
            setSharedVariable('elementID', $(element).attr('id'));
        }
    })
   // link to the next page
    let nextPageLink = `https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AE003&node=Actos y resoluciones con efectos sobre terceras personas`;
    $('body').append(`<a href="${nextPageLink}" class="next-page">Actos Page</a>`);

   // throw viewState
    //throw getSharedVariable('elementID')
    responsePage.response.body = $.html();
    responsePage.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    //responsePage.response = new fetch.Response($.html(), responsePage.response)
    return responsePage;
}
function extractAuth(html) {
    const $ = cheerio.load(html);
    const formAction = $('form[id="A6428:formInfo"]').attr('action');
    const encodedURL = $('input[name="javax.faces.encodedURL"]').val();

    let p_p_auth;

    if (formAction) {
        const match = formAction.match(/p_p_auth=([^&]+)/);
        if (match) p_p_auth = match[1];
    }

    if (!p_p_auth && encodedURL) {
        const match = encodedURL.match(/p_p_auth=([^&]+)/);
        if (match) p_p_auth = match[1];
    }
    return p_p_auth;
}
// Actos y resoluciones con efectos sobre terceras personas 
//https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AE003&node=Actos y resoluciones con efectos sobre terceras personas 
async function fetchActosYResoluciones({ canonicalURL, headers }) {
    let viewState = getSharedVariable('viewState');
    if (!viewState) {
        await fetchPageWithState({ headers })
        viewState = getSharedVariable("viewState")
    }
    // throw viewState
    let customHeaders = {
        "Accept": "application/xml, text/xml, */*; q=0.01",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Faces-Request": "partial/ajax",
        "Origin": "https://www.portaltransparencia.cl",
        "Pragma": "no-cache",
        "Priority": "u=1, i",
        "Referer": "https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AE003",
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
    let payload = {
        "javax.faces.partial.ajax": true,
        "javax.faces.source": "A6428:formInfo:j_idt39:0:datalist:6:j_idt43:1:j_idt47",
        "javax.faces.partial.execute": "@all",
        "javax.faces.partial.render": "A6428:formInfo",
        "A6428:formInfo:j_idt39:0:datalist:6:j_idt43:1:j_idt47": "A6428:formInfo:j_idt39:0:datalist:6:j_idt43:1:j_idt47",
        "A6428:formInfo": "A6428:formInfo",
        "javax.faces.encodedURL": "https://www.portaltransparencia.cl/PortalPdT/web/guest/directorio-de-organismos-regulados?p_p_id=pdtfichaorganismos_WAR_pdtfichaorganismosportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=1&_pdtfichaorganismos_WAR_pdtfichaorganismosportlet__jsfBridgeAjax=true&_pdtfichaorganismos_WAR_pdtfichaorganismosportlet__facesViewIdResource=%2Fviews%2Freviu.xhtml",
        "A6428:formInfo:j_idt39:0:datalist:0:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:0:datalist:1:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:0:datalist:2:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:0:datalist:3:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:0:datalist:4:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:0:datalist:5:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:0:datalist:6:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:1:datalist:0:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:1:datalist:1:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:1:datalist:2:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:1:datalist:3:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:1:datalist:4:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:1:datalist:5:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:1:datalist:6:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:1:datalist:7:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:1:datalist:8:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:1:datalist:9:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:2:datalist:0:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:2:datalist:1:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:2:datalist:2:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:2:datalist:3:j_idt43_scrollState": "0,0",
        "A6428:formInfo:j_idt39:2:datalist:4:j_idt43_scrollState": "0,0",
        "javax.faces.ViewState": viewState
    };

    let requestOptions = {
        method: "POST",
        headers: _headers,
        body: querystring.stringify(payload)
    };
    //throw querystring.stringify(payload,null,4)
    let requestURL = 'https://www.portaltransparencia.cl/PortalPdT/web/guest/directorio-de-organismos-regulados?p_p_id=pdtfichaorganismos_WAR_pdtfichaorganismosportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=1&_pdtfichaorganismos_WAR_pdtfichaorganismosportlet__jsfBridgeAjax=true&_pdtfichaorganismos_WAR_pdtfichaorganismosportlet__facesViewIdResource=%2Fviews%2Freviu.xhtml';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    let html = await responsePage.response.text();
    let $ = cheerio.load(html);
    let p_p_auth = extractAuth(html);
    if (p_p_auth) {
        setSharedVariable('p_p_auth', p_p_auth);
        //throw ("Extracted p_p_auth:", p_p_auth);
    } else {
        //throw ("Could not extract p_p_auth");
    }
    // link to circulares page
    let circularesLink = `https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AE003&table=circulares&page=1`;
    $('body').append(`<a href="${circularesLink}" class="circulares-page">Circulares Page</a>`);

    responsePage.response.body = $.html();
    responsePage.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    // throw p_p_auth
    // throw $.html()
    return responsePage
}
//https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AE003&table=circulares&page=1
async function fetchCirculares({ canonicalURL, headers }) {
    let viewState = getSharedVariable('viewState');
    let p_p_auth = getSharedVariable('p_p_auth');
    if (!viewState || !p_p_auth) {
        await fetchPageWithState({ headers });
        await fetchActosYResoluciones({ headers });
        viewState = getSharedVariable("viewState");
        p_p_auth = getSharedVariable("p_p_auth");
    }
    //throw p_p_auth
    let customHeaders = {
        "Accept": "application/xml, text/xml, */*; q=0.01",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Faces-Request": "partial/ajax",
        "Origin": "https://www.portaltransparencia.cl",
        "Pragma": "no-cache",
        "Priority": "u=1, i",
        "Referer": "https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AE003",
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
    let payload = {
        "javax.faces.partial.ajax": true,
        "javax.faces.source": "A6428:formInfo:j_idt76:1:j_idt78",
        "javax.faces.partial.execute": "@all",
        "javax.faces.partial.render": "A6428:formInfo",
        "A6428:formInfo:j_idt76:1:j_idt78": "A6428:formInfo:j_idt76:1:j_idt78",
        "A6428:formInfo": "A6428:formInfo",
        "javax.faces.encodedURL": `https://www.portaltransparencia.cl/PortalPdT/web/guest/directorio-de-organismos-regulados?p_p_auth=${p_p_auth}&p_p_id=pdtfichaorganismos_WAR_pdtfichaorganismosportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=1&_pdtfichaorganismos_WAR_pdtfichaorganismosportlet__jsfBridgeAjax=true&_pdtfichaorganismos_WAR_pdtfichaorganismosportlet__facesViewIdResource=%2Fviews%2Freviu.xhtml`,
        "javax.faces.ViewState": viewState
    };
    let requestOptions = {
        method: "POST",
        headers: _headers,
        body: querystring.stringify(payload)
    };
    //throw JSON.stringify(payload,null,4)
    // throw viewState
    let requestURL = `https://www.portaltransparencia.cl/PortalPdT/web/guest/directorio-de-organismos-regulados?p_p_auth=${p_p_auth}&p_p_id=pdtfichaorganismos_WAR_pdtfichaorganismosportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=1&_pdtfichaorganismos_WAR_pdtfichaorganismosportlet__jsfBridgeAjax=true&_pdtfichaorganismos_WAR_pdtfichaorganismosportlet__facesViewIdResource=%2Fviews%2Freviu.xhtml`
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    let html = await responsePage.response.text();
    let $ = cheerio.load(html);
    // Extract pagination information
    let paginationInfo = $('#A6428\\:formInfo\\:datosplantilla_paginator_top');
    let currentPage = paginationInfo.find('.ui-paginator-page.ui-state-active').text();
    let lastPage = paginationInfo.find('.ui-paginator-page').last().text();

    // Add pagination links
    for (let i = 1; i <= lastPage; i++) {
        let pageLink = `https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AE003&table=circulares&page=${i}`;
        $('body').append(`<a href="${pageLink}" class="pagination-link">Page ${i}</a>`);
    }
    responsePage.response.body = $.html()
    responsePage.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    return responsePage
}
//https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AE003&table=circulares&page=2
async function fetchPaginatedCirculares({ canonicalURL, headers, page }) {
    let viewState = getSharedVariable('viewState');
    let p_p_auth = getSharedVariable('p_p_auth');
    if (!viewState || !p_p_auth) {
        await fetchPageWithState({ headers });
        await fetchActosYResoluciones({ headers });
        viewState = getSharedVariable("viewState");
        p_p_auth = getSharedVariable("p_p_auth");
    }
   // throw viewState
  // throw p_p_auth
    let customHeaders = {
        "Accept": "application/xml, text/xml, */*; q=0.01",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Faces-Request": "partial/ajax",
        "Origin": "https://www.portaltransparencia.cl",
        "Pragma": "no-cache",
        "Priority": "u=1, i",
        "Referer": "https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AE003",
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

    let payload = {
        "javax.faces.partial.ajax": true,
        "javax.faces.source": "A6428:formInfo:datosplantilla",
        "javax.faces.partial.execute": "A6428:formInfo:datosplantilla",
        "javax.faces.partial.render": "A6428:formInfo:datosplantilla",
        "A6428:formInfo:datosplantilla": "A6428:formInfo:datosplantilla",
        "A6428:formInfo:datosplantilla_pagination": true,
        "A6428:formInfo:datosplantilla_first": (page - 1) * 100,
        "A6428:formInfo:datosplantilla_rows": 100,
        "A6428:formInfo:datosplantilla_skipChildren": true,
        "A6428:formInfo:datosplantilla_encodeFeature": true,
        "A6428:formInfo": "A6428:formInfo",
        "javax.faces.encodedURL": `https://www.portaltransparencia.cl/PortalPdT/web/guest/directorio-de-organismos-regulados?p_p_auth=${p_p_auth}&p_p_id=pdtfichaorganismos_WAR_pdtfichaorganismosportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=1&_pdtfichaorganismos_WAR_pdtfichaorganismosportlet__jsfBridgeAjax=true&_pdtfichaorganismos_WAR_pdtfichaorganismosportlet__facesViewIdResource=%2Fviews%2Freviu.xhtml`,
        "A6428:formInfo:searchBar": "",
        "javax.faces.ViewState": viewState
    };
    let requestOptions = {
        method: "POST",
        headers: _headers,
        body: querystring.stringify(payload)
    };
  //  throw JSON.stringify(payload,null,4)
    let requestURL = `https://www.portaltransparencia.cl/PortalPdT/web/guest/directorio-de-organismos-regulados?p_p_auth=${p_p_auth}&p_p_id=pdtfichaorganismos_WAR_pdtfichaorganismosportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=1&_pdtfichaorganismos_WAR_pdtfichaorganismosportlet__jsfBridgeAjax=true&_pdtfichaorganismos_WAR_pdtfichaorganismosportlet__facesViewIdResource=%2Fviews%2Freviu.xhtml`;
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    let xml = await responsePage.response.text()
    let $ = cheerio.load(xml, { xmlMode: true })
    let id = $("update[id$='datosplantilla']").html()
    responsePage.response.body = `<table>${id}</table>`
    responsePage.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    return responsePage
}
//getpdf
async function getpdf({ canonicalURL, headers }) {
    let customHeaders = {
        "authority": "www.portaltransparencia.cl",
        "path": "/PortalPdT/documents/10179/62801/documento_electronico_20240516_101451+%281%29%20-+Jonathan+Cid+Torres+%281%29.pdf/3383152a-2b94-4fde-8da5-463077d8d425",
        "scheme": "https",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Priority": "u=0, i",
        "Referer": "https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AE003",
        "Sec-Ch-Ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": "\"Windows\"",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    };
    let _headers = Object.assign(customHeaders, headers);
    let requestOptions = { method: "GET", headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestOptions });
    return responsePage;
}

async function fetchURL({ canonicalURL, headers }) {
    const initialUrl = 'https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=AE003';
    if (canonicalURL === initialUrl) {
        return [await fetchPageWithState({ canonicalURL, headers })];
    } else if (/\?org=AE003&node=Actos.+/.test(canonicalURL)) {
        await fetchPageWithState({ canonicalURL: initialUrl, headers })
        return [await fetchActosYResoluciones({ canonicalURL: initialUrl, headers })];
    } else if (/\?org=AE003&table=circulares/.test(canonicalURL)) {
        await fetchPageWithState({ canonicalURL: initialUrl, headers })
        await fetchActosYResoluciones({ canonicalURL: initialUrl, headers })

        const pageMatch = canonicalURL.match(/&page=(\d+)/);
        const page = pageMatch ? parseInt(pageMatch[1]) : 1;

        let p_p_auth = getSharedVariable('p_p_auth');

        if (page === 1) {
            return [await fetchCirculares({ canonicalURL, headers, p_p_auth })];
        } else {
            return [await fetchPaginatedCirculares({ canonicalURL, headers, page, p_p_auth })];
        }
    } else {
        if (/\.pdf(?:\/|$)/.test(canonicalURL)) {
            return [await getpdf({ canonicalURL, headers })];
        }
    }
}

//https://www.portaltransparencia.cl/PortalPdT/documents/10179/62801/cweb2011_17.pdf/ac654fd6-7c24-4d49-9c46-415b5d094a20
//https://www.portaltransparencia.cl/PortalPdT/documents/10179/62801/cweb2011_16.pdf/23993707-dd5f-449d-a39d-63303791d595
//https://www.tesoreria.cl/web/Contenido/Documentos/3990/CN12.pdf
//https://www.tesoreria.cl/web/Contenido/Documentos/3445/Circular_N_9_de_2010_Renta_masiva_2010.pdf
function discoverLinks({content, contentType, canonicalURL}) {
    var hrefs = [];
    if (contentType == "text/html") {
      var $ = cheerio.load(content);
  
      $("a[href]").each(function() {
        hrefs.push($(this).attr("href"));
      })
    }
    return hrefs;
  }