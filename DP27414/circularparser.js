function parsePage({ responseBody, URL }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
  
    if (responseBody.fileFormat === "application/json") {
      let data;
      try {
        data = JSON.parse(responseBody.content);
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        return [];
      }
  
      const results = [];
      const startDate = new Date('2017-01-31');
      const endDate = new Date('2024-10-02');
  
      if (data && data.d && data.d.results) {
        data.d.results.forEach(item => {
          const result = {
            URL: URL,
            URI: null,
            Title: item.Title || null,
            Summary: item.Descripci_x00f3_n || null,
            CircularNumber: item.LinkFilename || null,
            Year: item.A_x00f1_o || null,
            OriginalPageDate: item.Fecha || null,
            UniqueTitle: `${item.Descripci_x00f3_n?.substring(0, 30)} - ${item.Fecha?.split('T')[0]} - ${item.Clasificaci_x00f3_n || ''}`.trim()
          };
  
          if (result.CircularNumber) {
            const match = result.CircularNumber.match(/N°\s*(\d+)/);
            if (match) {
              const numberPart = match[1].slice(-4);
              result.CircularNumber = `N° ${numberPart}`;
            } else {
              result.CircularNumber = null;
            }
          } else {
            result.CircularNumber = null;
          }
          if (item.LinkFilename) {
            const encodedFilename = (item.LinkFilename);
            result.URI = `https://www.casanare.gov.co/NuestraGestion/Normatividad/${encodedFilename}`;
          }
  
          if (result.OriginalPageDate) {
            const dateParts = result.OriginalPageDate.split('T')[0].split('-');
            result.OriginalPageDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
  
            const recordDate = new Date(result.OriginalPageDate);
            if (recordDate >= startDate && recordDate <= endDate) {
              results.push(result);
            }
          }
        });
      }
  
      return results;
    }
  
    return [];
  }