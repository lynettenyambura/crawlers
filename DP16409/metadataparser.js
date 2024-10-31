function parsePage({ responseBody, URL }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });
    const results = [];
    const seenURLs = new Set();
    
    const releasePattern = /IR-\d{4}-\d+,?\s*[A-Za-z]+\.?\s*\d{1,2},?\s*\d{4}/i;
    const numberPattern = /IR-\d{4}-\d+/i;
    const datePattern = /([A-Za-z]+)\.?\s*(\d{1,2}),?\s*(\d{4})/i;
    
    $('body, .field--name-body').each((index, element) => {
        const text = $(element).text();
        const matches = text.match(releasePattern);
        
        if (matches) {
            matches.forEach(match => {
                const numberMatch = match.match(numberPattern);
                const releaseNumber = numberMatch ? numberMatch[0] : null;
                
                const dateMatch = match.match(datePattern);
                let formattedDate = null;
                let year = null;
                
                if (dateMatch) {
                    const month = dateMatch[1].replace('.', '').trim();
                    const day = dateMatch[2].trim();
                    year = dateMatch[3];
                    
                    const dateStr = `${month} ${day}, ${year}`;
                    formattedDate = moment(dateStr, ['MMMM D, YYYY', 'MMM D, YYYY'])
                        .format('YYYY-MM-DD');
                }
                
                if (releaseNumber && !seenURLs.has(URL + releaseNumber)) {
                    const result = {
                        URI: URL,
                        releaseNumber: releaseNumber,
                        date: formattedDate !== 'Invalid date' ? formattedDate : null,
                        year: year
                    };
                    
                    seenURLs.add(URL + releaseNumber);
                    results.push(result);
                }
            });
        }
    });
    
    
    console.log('Parsing results:', results);
    if (results.length === 0) {
        console.log('No results found. Document content:', $('body').text().substring(0, 500));
    }
    
    return results;
}