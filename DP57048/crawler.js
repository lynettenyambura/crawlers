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
    let customHeaders = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-site",
        "Referer": 'https://case.law/',
    };
    let requestURL = 'https://static.case.law/';
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    return responsePage;
}
async function series({ canonicalURL, headers }) {
    let customHeaders = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-site",
        "Referer": 'https://case.law/',
    };
    let requestURL = "https://static.case.law/nh/";
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL,requestOptions });
    return responsePage;
}

//https://static.case.law/a2d/
//https://static.case.law/
async function downloadZip({ canonicalURL, headers }) {
    let customHeaders = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-site",
        "Referer": 'https://case.law/',
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responseArray = await handleCompressed({ canonicalURL, headers: _headers, requestOptions });
    return responseArray;
}

const handleCompressed = async function ({ canonicalURL, headers, responsePage }) {
    responsePage = responsePage || await fetchPage({ canonicalURL, headers });
    let out = [];
    let mime = responsePage.response.headers.get('content-type');
    let isRar = !!/rar/i.test(mime);
    let isZip = !!/zip/i.test(mime);

    if (responsePage && responsePage.response.ok && (isRar || isZip)) {
        out = isRar ? await unrar({ request: responsePage.request, response: responsePage.response }) :
            await unzip({ request: responsePage.request, response: responsePage.response });

        let accepted = [];
        let $ = cheerio.load("<html lang='en'><body><h2>Contents</h2><ol id='zip-content-links'></ol></body></html>");
        let ul = $("ol#zip-content-links");

        for (let i = 0; i < out.length; i++) {
            let filePage = out[i];
            filePage.canonicalURL = encodeURI(decodeURI(filePage.canonicalURL));
            ul.append(`<li><a href="${filePage.canonicalURL}">${filePage.canonicalURL}</a></li>\n`);
            let contentType = filePage.response.headers.get("content-type");

            // Filtering file types by their content-type or extension
            if (/empty|spreadsheet|excel/i.test(contentType)) {
                continue;
            }

            if (/\.gif?$/i.test(filePage.canonicalURL)) {
                filePage.response.headers.set('content-type', "image/gif");
            } else if (/\.png?$/i.test(filePage.canonicalURL)) {
                filePage.response.headers.set('content-type', "image/png");
            } else if (/\.jpe?g$/i.test(filePage.canonicalURL)) {
                filePage.response.headers.set('content-type', "image/jpeg");
            } else if (/\.tiff?$/i.test(filePage.canonicalURL)) {
                filePage.response.headers.set('content-type', "image/tiff");
            } else if (/\.pdf$/i.test(filePage.canonicalURL)) {
                filePage.response.headers.set('content-type', "application/pdf");
            } else if (/\.doc$/i.test(filePage.canonicalURL)) {
                filePage.response.headers.set('content-type', "application/msword");
            } else if (/\.docx$/i.test(filePage.canonicalURL)) {
                filePage.response.headers.set('content-type', "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            } else if (/\.html?$/i.test(filePage.canonicalURL)) {
                filePage.response.headers.set('content-type', "text/html");
            } else if (/\.txt$/i.test(filePage.canonicalURL)) {
                filePage.response.headers.set('content-type', "text/plain");
            } else if (/\.json$/i.test(filePage.canonicalURL)) {
                filePage.response.headers.set('content-type', "application/json");
            } else if (/\.xlsx/i.test(filePage.canonicalURL)) {
                filePage.response.headers.set('content-type', "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            } else {
                continue;
            }
            accepted.push(filePage);
        }
        out = accepted;
        out.push(simpleResponse({ canonicalURL, mimeType: "text/html", responseBody: $.html() }))
    }

    return out;
};
async function fetchURL({ canonicalURL, headers }) {
    if (/^https:\/\/static\.case\.law\/?$/.test(canonicalURL)) {
        return [await Home({ canonicalURL, headers })];
    } else if (/^https:\/\/static\.case\.law\/nh\/$/.test(canonicalURL)) {
        return [await series({ canonicalURL, headers })];
    } else if (/^https:\/\/static\.case\.law\/nh\/.+\.zip$/.test(canonicalURL)) {
        return await downloadZip({ canonicalURL, headers });
    }
}
function discoverLinks({ content, contentType, canonicalURL }) {
    let zipLinks = [];
    
    if (contentType == "text/html") {
      let $ = cheerio.load(content);
      
      $("tr").each(function(index) {
        if (index < 10) { 
          let zipLink = $(this).find("td:nth-child(2) a[href$='.zip']").attr("href");
          if (zipLink) {
            zipLinks.push(zipLink);
          }
        }
      });
    }
    
    return zipLinks;
  }


//   https://static.case.law/nh/
// https:\/\/static\.case\.law\/nh\/([1-9]|10)\.zip