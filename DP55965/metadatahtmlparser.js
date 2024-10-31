function parsePage({ responseBody, URL, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });

    const pdfViewerExists = $('.pdfemb-viewer').length > 0;
    if (pdfViewerExists) {
        return [];
    }

    const records = [];
    const title = capitalizeWords($('h1.elementor-heading-title').text().trim());
    const content = $('div.elementor-widget-container')
        .filter(function () {
            return $(this).find('p').length > 0;
        })
        .map(function () {
            const $container = $(this);
            $container.find('figure.wp-block-embed.is-type-video').remove();
            $container.find('figure.wp-block-image').remove();
            $container.find('p.elementor-heading-title:contains("Elaborado por")').remove();
            $container.find('p:not(:last-child)').after('<br>');
            return $container.html();
        })
        .get()
        .join('\n\n');

    const currentLocale = URL.includes('/en/') ? 'en' : 'es';

    let publishedDate = $('meta[property="article:published_time"]').attr('content') || '';
    if (publishedDate) {
        publishedDate = publishedDate.split('T')[0];
    }

    let generalURI = '', esURI = '', enURI = '';

    if (currentLocale === 'en') {
        enURI = URL;
    } else {
        esURI = URL;
    }

    $('.lang-item').each(function () {
        const $link = $(this).find('a');
        const href = $link.attr('href');
        const lang = $link.attr('hreflang');
        if (lang && lang.startsWith('es')) {
            esURI = href;
        } else if (lang && lang.startsWith('en')) {
            enURI = href;
        }
    });

    const urlParts = URL.split('/');
    urlParts.splice(3, 1);
    generalURI = urlParts.join('/');

    const uriArray = [generalURI];
    if (esURI && !esURI.endsWith('/es/')) {
        uriArray.push(esURI);
    }
    if (enURI && !enURI.endsWith('/en/')) {
        uriArray.push(enURI);
    }

    const record = {
        URI: uriArray,
        URL: URL,
        title: {
            dataType: 'STRING',
            value: title,
            locale: currentLocale
        },
        locale: currentLocale,
        publishedDate: publishedDate,
        content: {
            fileFormat: 'text/html',
            dataType: 'MEDIA',
            content: content,
        },
    };

    records.push(record);
    return records;
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
}