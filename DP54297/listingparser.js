function parsePage({ responseBody, URL, html, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    
    if (responseBody.fileFormat === "application/json") {
      let data;
      try {
        data = JSON.parse(responseBody.content);
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        return [];
      }
      
      function toTitleCase(str) {
    const minorWords = ['a', 'ante', 'bajo', 'cabe', 'con', 'contra', 'de', 'desde', 'durante', 'en', 'entre', 'hacia', 'hasta', 'mediante', 'para', 'por', 'según', 'sin', 'so', 'sobre', 'tras', 'versus', 'vía', 'y', 'o', 'u', 'e', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'];
    
    return str.toLowerCase().split(' ').map((word, index) => {
      if (index === 0 || !minorWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    }).join(' ');
  }
  
      function parseJsonResponse(jsonData) {
        const result = [];
        if (jsonData.data && jsonData.data.boletin && jsonData.data.boletin.bop) {
          jsonData.data.boletin.bop.forEach(item => {
            if (item.registro && Array.isArray(item.registro)) {
              item.registro.forEach(reg => {
                const edicto = reg.edicto ? reg.edicto[0] : '';
                const publication = {
                  gazetteSection: reg.gndenom ? reg.gndenom[0] : '',
                  publishedDate: reg.fechaPublica ? moment(reg.fechaPublica[0], "DD/MM/YYYY").format("YYYY-MM-DD") : '',
                  gazetteIssue: reg.nBop ? reg.nBop[0] : '',
                  recordNumber: edicto,
                  title: reg.extracto ? toTitleCase(reg.extracto[0]) : '',
                  issuer: reg.ampliacion ? toTitleCase(reg.ampliacion[0]) : '',
                  URI: reg.ubicacion ? reg.ubicacion[0] : ''
                };
                result.push(publication);
              });
            }
          });
        }
        
        return result;
      }
      
      const extractedInfo = parseJsonResponse(data);
      console.log(JSON.stringify(extractedInfo, null, 2));
      return extractedInfo;
    }
    
    return [];
  }