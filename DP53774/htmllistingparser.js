function parsePage({ responseBody, URL, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });
    
    const records = [];
    
    $('table tbody tr').each((index, row) => {
        const record = {};
        $(row).find('td').each((cellIndex, cell) => {
            const cellText = $(cell).text().trim();
            switch(cellIndex) {
                case 0: record['Año'] = cellText; break;
                case 1: record['Mes'] = cellText; break;
                case 2: record['Tipología del acto'] = cellText; break;
                case 3: record['Tipo de acto'] = cellText; break;
                case 4: record['Denominación del acto'] = cellText; break;
                case 5: record['Número del acto'] = cellText; break;
                case 6: record['Fecha'] = cellText; break;
                case 7: record['Fecha publicación en DO'] = cellText; break;
                case 8: record['Indicación del medio y forma de publicidad'] = cellText; break;
                case 9: record['Tiene efectos generales'] = cellText; break;
                case 10: record['Fecha última actualización'] = cellText; break;
                case 11: record['Breve descripción del objeto del acto'] = cellText; break;
                case 12: record['Vínculo al texto íntegro y actualizado'] = cellText; break;
            }
        });
        records.push(record);
    });
    
    return records;
}