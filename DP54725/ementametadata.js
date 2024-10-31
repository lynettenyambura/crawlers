function parsePage({ responseBody, URL, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
  
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });
  
    const ementaTitle = $(':contains("EMENTA")').filter(function () {
      return $(this).text().trim() === 'EMENTA';
    });
  
    let ementaContent = '';
  
    let currentElement = ementaTitle.next();
    while (currentElement.length && !currentElement.text().includes('ACÓRDÃO')) {
      ementaContent += currentElement.text().trim() + ' ';
      currentElement = currentElement.next();
    }
  
    ementaContent = ementaContent.trim();
  
    const output = {
      uri: URL,
      content: {
        fileFormat: 'text/html',
        dataType: 'MEDIA',
        content: ementaContent,
        locale: 'pt-BR'
      }
  
    };
  
    return [output];
  }