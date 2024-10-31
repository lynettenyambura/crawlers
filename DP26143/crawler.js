function getSeeds() {
    return [
        `https://www.urf.gov.co/webcenter/portal/urf/pages_Normativa/proydecretos/proyectosdedecreto2024`,
        `https://www.urf.gov.co/webcenter/portal/urf/pages_Normativa/proydecretos/proyectosdedecreto2023`
    ]
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
const customPuppeteer = async ({ canonicalURL, year }) => {
    const page = await puppeteerManager.newPage();
    page.setDefaultNavigationTimeout(60000);
    const response = [];
    const baseUrl = 'https://www.urf.gov.co/webcenter/portal/urf/pages_Normativa/proydecretos/proyectosdedecreto';
    const url = `${baseUrl}${year}`;
    //throw url
    await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 120000
    });

    await page.waitForSelector('div#wrapper.WCSiteTemplateRoot.body-blue', { timeout: 60000 });

    // Fetch page 1
    let firstPageContent = await page.evaluate(() => {
        return document.querySelector('div#wrapper.WCSiteTemplateRoot.body-blue').outerHTML;
    });
    const $ = cheerio.load(firstPageContent, { decodeEntities: false });
    $('base, script, iframe').remove();
    $('.linkMinisterio').each(function () {
        let href = $(this).attr("href");
        if (href) {
            $(this).attr("href", href.replace(/:443/, ""));
        }
    });
    firstPageContent = $.html();
    response.push(
        simpleResponse({
            canonicalURL: `${canonicalURL}?page=1&year=${year}`,
            mimeType: "text/html",
            responseBody: firstPageContent,
        })
    );
    console.log(`Content of page 1 for year ${year} saved`);
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Scroll and fetch page 2
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForSelector('a[title="Ir a Página 2"]', { visible: true, timeout: 60000 });
    await page.click('a[title="Ir a Página 2"]');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await page.waitForSelector('#wrapper', { timeout: 30000 });

    let secondPageContent = await page.evaluate(() => {
        return document.querySelector('#wrapper').outerHTML;
    });
    const $2 = cheerio.load(secondPageContent, { decodeEntities: false });
    $2('base, script, iframe').remove();
    $2('.linkMinisterio').each(function () {
        let href = $2(this).attr("href");
        if (href) {
            $2(this).attr("href", href.replace(/:443/, ""));
        }
    });
    secondPageContent = $2.html();
    response.push(
        simpleResponse({
            canonicalURL: `${canonicalURL}?page=2&year=${year}`,
            mimeType: "text/html",
            responseBody: secondPageContent,
        })
    );

    console.log(`Content of page 2 for year ${year} saved`);
    return response;
}



async function downloadpdf({ canonicalURL, headers }) {
    const customHeaders = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Cookie": "874713e24211a4570bc63cce62360a16=re28kah5d517vulijn5fhb1g04; _ga=GA1.1.1412350079.1725275589; _ga_DCZ675ERXT=GS1.1.1725279694.2.1.1725280638.0.0.0",
        "Host": "www.pge.gob.ec",
        "Pragma": "no-cache",
        "Referer": "http://www.pge.gob.ec/index.php/component/sppagebuilder/page/75",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    };
    let method = "GET";
    let _headers = Object.assign(customHeaders, headers);
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestOptions });
    return responsePage;
}

async function fetchURL({ canonicalURL, headers }) {
    const isHome = canonicalURL.match(/\/urf\/pages_Normativa\/proydecretos\/proyectosdedecreto(\d+)$/);

    if (isHome) {
        const year = isHome[1];
        return await customPuppeteer({ canonicalURL, year, headers });
    } else if (/nodeId=.+/.test(canonicalURL)) {
        return [await downloadpdf({ canonicalURL, headers })];
    }
}

//https://www.urf.gov.co/webcenter/ShowProperty?nodeId=%2FConexionContent%2FWCC_CLUSTER-244863%2F%2FidcPrimaryFile&revision=latestreleased
function discoverLinks({ content, contentType, canonicalURL }) {
    let hrefs = [];
      if (contentType === "text/html") {
          let $ = cheerio.load(content);
          $("a[href]").each(function () {
              let href = $(this).attr("href");
              if (href.includes("ShowProperty?nodeId=") && href.includes("idcPrimaryFile")) {
                  hrefs.push(href);
              }
          });
      }
  
      return hrefs;
  }