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
      'pragma': 'no-cache',
      'priority': 'u=0, i',
      'referer': 'https://www.google.com/',
      'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'cross-site',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    };
    let requestURL = 'https://www.irs.gov/newsroom/news-release-and-fact-sheet-archive';
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return responsePage;
  }
  async function fetchNewsForMonths({ canonicalURL, headers, month, year }) {
    let customHeaders = {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
      "referer": "https://www.irs.gov/newsroom/news-release-and-fact-sheet-archive",
      "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
    };
    let requestURL = `https://www.irs.gov/newsroom/news-releases-for-${month}-${year}`
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return responsePage;
  }
  async function fetcheachNews({ canonicalURL, headers, month, year }) {
    let customHeaders = {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
      "referer": `https://www.irs.gov/newsroom/news-releases-for-${month}-${year}`,
      "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
    };
    //let requestURL = `https://www.irs.gov/newsroom/irs-reminder-to-americans-abroad-file-2021-return-by-june-15-eligible-families-can-claim-expanded-tax-benefits`
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestOptions });
    return responsePage;
  }
  async function fetchNewreleases({ canonicalURL, headers }) {
    let customHeaders = {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
      "referer": 'https://www.irs.gov/newsroom/news-release-and-fact-sheet-archive',
      "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
    };
    let requestURL = `https://www.irs.gov/newsroom/news-releases-for-current-month`
    let _headers = Object.assign(customHeaders, requestURL, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestOptions });
    return responsePage;
  }
  
  async function HomeArchive({ canonicalURL, headers }) {
    const customHeaders = {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      'pragma': 'no-cache',
      'priority': 'u=0, i',
      'referer': 'https://www.google.com/',
      'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'cross-site',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    };
    let requestURL = 'https://www.irs.gov/newsroom/news-release-and-fact-sheet-archive';
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
  
    const content = await responsePage.response.text();
    const $ = cheerio.load(content);
  
    $('a[data-entity-type="node"]').each(function () {
      const href = $(this).attr('href');
      if (href && href.includes('/newsroom/news-releases-for-')) {
        $(this).attr('href', href + '?listing');
      }
    });
  
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    return responsePage;
  }
  
  async function fetchcontentlisting({ canonicalURL, headers, month, year }) {
    let customHeaders = {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
      "referer": "https://www.irs.gov/newsroom/news-release-and-fact-sheet-archive",
      "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
    };
  
    let requestURL = `https://www.irs.gov/newsroom/news-releases-for-${month}-${year}`;
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    const content = await responsePage.response.text();
    const $ = cheerio.load(content);
    $('a[data-entity-substitution="canonical"][data-entity-type="node"]').each(function () {
      const originalHref = $(this).attr('href');
      if (originalHref && !originalHref.endsWith('.html')) {
        const newHref = `${originalHref}.html`;
        $(this).attr('href', newHref);
      }
    });
    $('a[rel="bookmark"] span').closest('a').each(function () {
      const originalHref = $(this).attr('href');
      if (originalHref && !originalHref.endsWith('.html')) {
        const newHref = `${originalHref}.html`;
        $(this).attr('href', newHref);
      }
    });
  
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    return responsePage;
  }
  async function fetcheachListingNews({ canonicalURL, headers, month, year }) {
    let customHeaders = {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
      "referer": `https://www.irs.gov/newsroom/news-releases-for-${month}-${year}`,
      "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
    };
    let requestURL = canonicalURL.replace('.html', '');
    //throw canonicalURL
    //https://www.irs.gov/newsroom/irs-reminder-to-americans-abroad-file-2021-return-by-june-15-eligible-families-can-claim-expanded-tax-benefits.html
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    const content = await responsePage.response.text();
    const $ = cheerio.load(content);
    const pageTitle = $('h1.pup-page-node-type-article-page__title').clone();
    $('.sidebar-left').remove();
    $('.sidebar-right').remove();
    $('nav').remove();
    $('header').remove();
    $('footer').remove();
    $('.pup-footer').remove();
  
    let mainContent = $('.field.field--name-body.field--type-text-with-summary.field--label-hidden.field--item');
  
    let cleanHTML = `
          <!DOCTYPE html>
          <html>
              <body>
                  ${pageTitle.prop('outerHTML')}
                  ${mainContent.html()}
              </body>
          </html>
      `;
  
    responsePage.response = new fetch.Response(cleanHTML, responsePage.response);
    return responsePage;
  }
  async function fetchNewreleasesHtml({ canonicalURL, headers }) {
    let customHeaders = {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
      "referer": 'https://www.irs.gov/newsroom/news-release-and-fact-sheet-archive',
      "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
    };
  
    let requestURL = canonicalURL.replace('.html', '');
    //throw canonicalURL
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    const content = await responsePage.response.text();
    const $ = cheerio.load(content);
    $('h3 a[rel="bookmark"]').each(function () {
      const originalHref = $(this).attr('href');
      if (originalHref && !originalHref.endsWith('.html')) {
        const newHref = `${originalHref}.html`;
        $(this).attr('href', newHref);
      }
    });
  
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    return responsePage;
  }
  async function fetchURL({ canonicalURL, headers }) {
    const listingPattern = /https:\/\/www\.irs.gov\/newsroom\/news-releases-for-(\w+)-(\d+)-.+/;
    const eachNewsPagePattern = /https:\/\/www\.irs.gov\/newsroom\/(.*)/;
    const currentNewsPattern = /https:\/\/www\.irs.gov\/newsroom\/news-releases-for-current-month$/;
    const contentPattern = /https:\/\/www.irs.gov\/newsroom\/news-releases-for-(\w+)-(\d{4})\?listing/;
    const currentNewsHtmlPattern = /https:\/\/www.irs.gov\/newsroom\/news-releases-for-current-month\?listing/;
    const eachListingPattern = /https:\/\/www\.irs.gov\/newsroom\/([a-zA-Z0-9-]+)\.html$/;
    const newsReleaseArchivePattern = /https:\/\/www\.irs.gov\/newsroom\/news-release-and-fact-sheet-archive/;
    const newsReleaseArchiveListingPattern = /https:\/\/www\.irs.gov\/newsroom\/news-release-and-fact-sheet-archive\?listing/;
  
    if (newsReleaseArchiveListingPattern.test(canonicalURL)) {
      return [await HomeArchive({ canonicalURL, headers })];
    }
    if (currentNewsHtmlPattern.test(canonicalURL)) {
      return [await fetchNewreleasesHtml({ canonicalURL, headers })];
    } else if (contentPattern.test(canonicalURL)) {
      const match = canonicalURL.match(contentPattern);
      if (match) {
        const month = match[1];
        const year = match[2];
        return [await fetchcontentlisting({ canonicalURL, headers, year, month })];
      }
    } else if (eachListingPattern.test(canonicalURL)) {
      return [await fetcheachListingNews({ canonicalURL, headers })];
    } else if (currentNewsPattern.test(canonicalURL)) {
      return [await fetchNewreleases({ canonicalURL, headers })];
    } else if (listingPattern.test(canonicalURL)) {
      const match = canonicalURL.match(listingPattern);
      if (match) {
        const month = match[1];
        const year = match[2];
        return [await fetchNewsForMonths({ canonicalURL, headers, year, month })];
      }
    } else if (newsReleaseArchivePattern.test(canonicalURL)) {
      return [await Home({ canonicalURL, headers })];
    } else if (eachNewsPagePattern.test(canonicalURL)) {
      const match = canonicalURL.match(eachNewsPagePattern);
      if (match) {
        const month = match[1];
        const year = match[2];
        return [await fetcheachNews({ canonicalURL, headers, month, year })];
      }
    }
  }
  
  
  //https://www.irs.gov/newsroom/irs-to-offer-an-employee-retention-credit-webinar-on-feb-8-provide-updates-on-voluntary-disclosure-program-moratorium
  //https://www.irs.gov/newsroom/news-releases-for-january-2024
  //https:\/\/www.irs.gov\/newsroom\/news-releases-for-current-month\?listing
  //https://www.irs.gov/newsroom/news-releases-for-january-2024?listing
  //https:\/\/www\.irs.gov\/newsroom\/([a-zA-Z0-9-]+)\.html
  //https://www.irs.gov/newsroom/news-releases-for-current-month?listing
  function discoverLinks({ content, contentType }) {
    const hrefs = [];
    
    if (contentType == "text/html") {
      const $ = cheerio.load(content);
      
      $("a[data-entity-type='node'], a[rel='bookmark'], a[href$='.html']").each(function() {
        const href = $(this).attr("href");
        if (href && 
            !href.startsWith("#") && 
            !href.includes("news-release-and-fact-sheet-archive") &&
            !$(this).text().includes("News Release and Fact Sheet Archive")) {
          hrefs.push(href);
        }
      });
    }
    
    return hrefs;
  }