function discoverLinks({ content, contentType, canonicalURL }) {
    const links = [];

    if (contentType === 'text/html') {
        const $ = cheerio.load(content);

        $('#generatedUrls a').each((index, element) => {
            const href = $(element).attr('href');
            if (href) {
                links.push(href);
            }
        });
    } else if (contentType === 'application/json') {
        try {
            const jsonResponse = JSON.parse(content);

            if (jsonResponse && jsonResponse.Row && Array.isArray(jsonResponse.Row)) {
                jsonResponse.Row.forEach(item => {
                    if (item.FileLeafRef) {
                        const pdfURL = `https://www.casanare.gov.co/NuestraGestion/Normatividad/${encodeURIComponent(item.FileLeafRef)}`;
                        links.push(pdfURL);
                    }
                });
            }

            const currentURL = new URL(canonicalURL);
            const itemCount = currentURL.searchParams.get('itemCount');
            const currentPage = parseInt(currentURL.searchParams.get('page')) || 1;
            const year = currentURL.searchParams.get('year');
            const dependencia = currentURL.searchParams.get('dependencia');

            const fetchedItemCount = jsonResponse.Row ? jsonResponse.Row.length : 0;
            const totalFetchedItems = (currentPage - 1) * 30 + fetchedItemCount;

            if (totalFetchedItems < parseInt(itemCount)) {
                const nextPage = currentPage + 1;
                const nextPageURL = `https://www.casanare.gov.co/NuestraGestion/_layouts/15/inplview.aspx?year=${year}&dependencia=${dependencia}&page=${nextPage}&itemCount=${itemCount}`;
                links.push(nextPageURL);
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    }

    return links;
}