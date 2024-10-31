function getSeeds() {
    return [
        `https://tumnet.com/en/publications/?page=1`,
        `https://tumnet.com/es/publicaciones/?page=1`
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

async function fetchInitialPage({ canonicalURL, headers, lang }) {
    let customHeaders = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    };
    let requestURL = `https://tumnet.com/${lang === 'es' ? 'es/publicaciones/' : 'en/publications/'}`;
    //throw requestURL

    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    let $ = cheerio.load(await responsePage.response.text())
    let listingContainer = $(".elementor-widget-container div.jet-listing-grid.jet-listing div")
    let currentPage = parseInt(listingContainer.attr("data-page"))
    let totalPages = parseInt(listingContainer.attr("data-pages"))
    //throw `currentPage: ${currentPage}, totalPages: ${totalPages}`
    setSharedVariable('totalPages', parseInt(listingContainer.attr("data-pages")))
    if (currentPage < totalPages) {
        let href = `https://tumnet.com/${lang === 'es' ? 'es/publicaciones/' : 'en/publications/'}?page=${currentPage + 1}`
        $("a#vermas").attr("href", href)
    }
    responsePage.response = new fetch.Response($.html())
    responsePage.response.headers.set('Content-Type', 'text/html; charset=utf-8');
    return responsePage;
}

async function fetchPaginatedResults({ canonicalURL, headers, lang, page }) {
    //throw "e"
    const payload = {
        action: "jet_engine_ajax",
        handler: "listing_load_more",
        "query[post_status][]": "publish",
        "query[post_type]": "post",
        "query[posts_per_page]": 30,
        "query[paged]": 1,
        "query[ignore_sticky_posts]": 1,
        "query[tax_query][0][taxonomy]": "category",
        "query[tax_query][0][field]": "IN",
        "query[tax_query][0][terms][]": lang === 'en' ? 274 : 268,
        "query[tax_query][0][operator]": "IN",
        "query[orderby]": "date",
        "query[suppress_filters]": false,
        "query[jet_smart_filters]": "jet-engine/default",
        "widget_settings[lisitng_id]": lang === 'en' ? 5180 : 4946,
        "widget_settings[posts_num]": 30,
        "widget_settings[columns]": 4,
        "widget_settings[columns_tablet]": 2,
        "widget_settings[columns_mobile]": 1,
        "widget_settings[is_archive_template]": "",
        "widget_settings[post_status][]": "publish",
        "widget_settings[use_random_posts_num]": "",
        "widget_settings[max_posts_num]": 9,
        "widget_settings[not_found_message]": "No data was found",
        "widget_settings[is_masonry]": false,
        "widget_settings[equal_columns_height]": "",
        "widget_settings[use_load_more]": "yes",
        "widget_settings[load_more_id]": "vermas",
        "widget_settings[load_more_type]": "click",
        "widget_settings[load_more_offset][unit]": "px",
        "widget_settings[load_more_offset][size]": 0,
        "widget_settings[use_custom_post_types]": "",
        "widget_settings[hide_widget_if]": "",
        "widget_settings[carousel_enabled]": "",
        "widget_settings[slides_to_scroll]": 1,
        "widget_settings[arrows]": true,
        "widget_settings[arrow_icon]": "fa fa-angle-left",
        "widget_settings[dots]": "",
        "widget_settings[autoplay]": true,
        "widget_settings[pause_on_hover]": true,
        "widget_settings[autoplay_speed]": 5000,
        "widget_settings[infinite]": true,
        "widget_settings[center_mode]": "",
        "widget_settings[effect]": "slide",
        "widget_settings[speed]": 500,
        "widget_settings[inject_alternative_items]": "",
        "widget_settings[scroll_slider_enabled]": "",
        "widget_settings[scroll_slider_on][]": ["desktop", "tablet", "mobile"],
        "widget_settings[custom_query]": false,
        "widget_settings[custom_query_id]": "",
        "widget_settings[_element_id]": "",
        "page_settings[post_id]": false,
        "page_settings[queried_id]": lang === 'en' ? "5213|WP_Post" : "4822|WP_Post",
        "page_settings[element_id]": false,
        "page_settings[page]": page,
        listing_type: false,
        isEditMode: false,
        "addedPostCSS[]": lang === 'en' ? 5180 : 4946
    };
    //throw JSON.stringify(payload)
    const timestamp = Date.now();
    let requestURL = `https://tumnet.com/${lang === 'es' ? 'es/publicaciones/' : 'en/publications/'}/?nocache=${timestamp}`;
    // throw requestURL
    let body = querystring.stringify(payload);
    let customHeaders = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "Referer": `https://tumnet.com/${lang === 'es' ? 'es/publicaciones/' : 'en/publications/'}/`,
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    let _headers = Object.assign(customHeaders, headers);
    let method = "POST";
    let requestOptions = { method, headers: _headers, body };
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    let jsonResponse = await responsePage.response.json();
    //throw JSON.stringify(jsonResponse)
    let modifiedResponse = `<!DOCTYPE html>
    <html lang="${lang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Publications</title>
    </head>
    <body><div id ="Listcontainer">${jsonResponse.data.html}</div></body>
    </html>`;
    let $ = modifiedResponse ? cheerio.load(modifiedResponse) : modifiedResponse
    let totalItems = 0
    $("#Listcontainer>div").each(function () {
        totalItems++
    })
    if (totalItems >= 30) {
        //throw totalItems
        let href = `https://tumnet.com/${lang === 'es' ? 'es/publicaciones/' : 'en/publications/'}?page=${parseInt(page) + 1}`
        //  $("a#vermas").attr("href", href)
        link = `<a id="Vermas" href="${href}">Viewmore</a>`
        $("body").append(link);
    }
    responsePage.response = new fetch.Response($.html());
    responsePage.response.headers.set('Content-Type', 'text/html; charset=utf-8');

    return responsePage;
}
async function articles({ canonicalURL, headers, lang }) {
    let customHeaders = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "Referer": `https://tumnet.com/${lang === 'es' ? 'es/publicaciones/' : 'en/publications/'}`,
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = { method, headers: _headers };
    let responsePage = await fetchPage({ canonicalURL, requestOptions });
    return responsePage;
}

async function fetchURL({ canonicalURL, headers }) {
    const isListing = canonicalURL.match(/https:\/\/tumnet.com\/(.+)\/p.+\/\?page=(.+)/);
    const isArticle = canonicalURL.match(/https:\/\/tumnet.com\/(.+)\/.+/);
    if (isListing) {
        const lang = isListing[1]
        const page = parseInt(isListing[2])
        if (page === 1) {

            return [await fetchInitialPage({ canonicalURL, headers, lang })];
        }
        return [await fetchPaginatedResults({ canonicalURL, headers, lang, page })];
    } else if (isArticle) {
        const lang = isArticle[1]

        return [await articles({ canonicalURL, headers, lang })];
    }
}


//https://tumnet.com/es/ficpi-22nd-open-forum-en-madrid/
//https://tumnet.com/en/publications/?page=1

function discoverLinks({ content, contentType, canonicalURL }) {
    let links = [];
    if (contentType === "text/html") {
        const $ = cheerio.load(content);
        $("a.elementor-button-link").each(function () {
            const linkText = $(this).text().trim().toLowerCase();
            if (linkText === "read more..." || linkText === "leer más...") {
                links.push($(this).attr("href"));
            }
        });
        $("a#vermas").each((i, element) => {
            links.push($(element).attr("href"));
        })
    }

    return links;
}