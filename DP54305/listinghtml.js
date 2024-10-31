function parsePage({ responseBody, URL, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    const html = iconv.decode(responseBody.buffer,"binary")
    const $ = cheerio.load(html);
    const records = [];
  
    const dateMatch = URL.match(/\/(\d{4})\/(\d{2})\/(\d{2})/);
    const publishedDate = dateMatch
      ? moment(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`).format('YYYY/MM/DD')
      : '';
  
    let gazetteNumber = '';
    if (!gazetteNumber) {
      const migasText = $('#migas').text();
      const migasMatch = migasText.match(/Provincia\s+(\d+)/);
      if (migasMatch && migasMatch[1]) {
        gazetteNumber = migasMatch[1];
      }
    }
    let currentSection = '';
  
    $('h3.admons').each((i, sectionElem) => {
      currentSection = $(sectionElem).text().trim();
  
      $(sectionElem).nextUntil('h3.admons').find('.clasificaciones').each((i, elem) => {
        const issuer = $(elem).text().trim();
  
        $(elem).next('.anuncios').find('li').each((j, announcement) => {
          const title = $(announcement).find('a').first().text().trim();
  
          const record = {
            pagination: $(announcement).find('.nPagina').text().trim(),
            recordNumber: $(announcement).find('.nAnuncio').text().trim().split(' ')[2],
            issuer: issuer,
            section: currentSection,
            title: title,
            URI: $(announcement).find('a.pdf').attr('href'),
            country: 'España',
            Class: 'official gazette document',
            gazetteNumber: gazetteNumber,
            publishedDate: publishedDate,
            parsedFrom: URL
          };
          records.push(record);
        });
      });
    });
  
    return records;
  }
  
  
  
  
  
  