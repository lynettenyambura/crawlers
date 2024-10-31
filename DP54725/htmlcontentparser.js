function parsePage({ responseBody, URL, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
  
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });
  
    const article = $('article');
  
    const htmlContent = article.html();
  
    const textContent = article.text().trim();
  
    const output = {
      uri: URL,
      content: {
        fileFormat: 'text/html',
        dataType: 'MEDIA',
        content: htmlContent,
        locale: 'pt-BR'
      },
      text: {
        fileFormat: 'text/plain',
        dataType: 'MEDIA',
        content: textContent,
        locale: 'pt-BR'
      }
    };
  
    return [output];
  }