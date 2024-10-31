function parsePage({ responseBody, URL, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });
    const output = [];
    const regex = /\/(\d+)\.zip\/(?:json|html)\/(\d{4}-\d{2})\./;
    const match = URL.match(regex);
  
    let uri = URL; 
    if (match) {
      const volume = match[1];      
      const caseNumber = match[2];   
  
      uri = `http://vlex.com/newhampshireofficialreports/${volume}/${caseNumber}`;
    }
  
    $('.casebody').each((index, element) => {
      let casebodyContent = $(element).html();
      casebodyContent = casebodyContent.replace(/<\/p>/g, '<br><br>').replace(/<p>/g, '');
      output.push({
        parseFrom: URL,
        URI: uri,
        content: {
          fileFormat: 'text/html',
          dataType: 'MEDIA',
          content: casebodyContent,
          locale: 'en'
        },
      });
    });
  
    return output;
  }