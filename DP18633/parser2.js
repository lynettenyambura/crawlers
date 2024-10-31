function parsePage({ responseBody, URL, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });
    const paragraphs = [];
    
    $('p').each((index, element) => {
      paragraphs.push($(element).text().trim());
    });
    
    const uniqueNumberMatch = $('#whereamiin').text().match(/(\d+)\/(\d{4})/);
    let uri = null;
    
    if (uniqueNumberMatch) {
      const [_, number, year] = uniqueNumberMatch;
      uri = url.resolve(URL, `/tc/acordaos/${year}${number}.html`);
    }
    const content = $('#mainContent').html()
    const text = $('#mainContent').text()
    
    const output = {
      uri,
      content: {fileFormat: 'text/html', dataType: 'MEDIA', content, locale: 'pt'},
      text: {fileFormat: 'text/plain', dataType: 'MEDIA', content: text, locale: 'pt'}
    };
  
    return [output];
  }