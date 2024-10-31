function parsePage({ responseBody, URL, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);

    const $ = cheerio.load(responseBody.content, { decodeEntities: false });

    const records = [];
    let orgaoColegiadoValue = '';
    let orgaoColegiadoURL = '';
    $('input[type="checkbox"][id*="fq_orgao_colegiado"]:checked').each((index, element) => {
        const id = $(element).attr('id');
        const labelElement = $(`label[for="${id}"]`);
        let label = labelElement.text().trim();

        label = label.replace(/\(\d+\)/g, '').trim();
        label = label.replace(/\s+/g, ' ').trim();
        const parts = label.split(' ');
        orgaoColegiadoValue = [...new Set(parts)].join(' ');
        const urlName = orgaoColegiadoValue.toLowerCase()
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        orgaoColegiadoURL = `http://vlex.com/trf2.jus/2379/orgaos-colegiados/${urlName}`;
        console.log(`Extracted orgaoColegiadoValue: ${orgaoColegiadoValue}`);
        console.log(`Generated orgaoColegiadoURL: ${orgaoColegiadoURL}`);
        return false;
    });

    $('div.panel.panel-default').each((index, panel) => {
        const panel$ = $(panel);
        const processoElement = panel$.find('span.btn.btn-outline-secondary.label-processo.item_button');
        const processoText = processoElement.text().trim();
        const processoMatch = processoText.match(/(\d{7}-\d{2}\.\d{4}\.\d{1,2}\.\d{2}\.\d{4})/);
        if (!processoMatch) {
            console.log(`Processo not found  ${index}`);
            return;
        }
        const processo = processoMatch[0];

        let record = {
            uri: `${URL}?processo=${processo}`,
            Processo: processo
        };

        const table = panel$.find('table');
        table.find('tr').each((i, row) => {
            const cells = $(row).find('td');
            if (cells.length === 2) {
                const key = $(cells[0]).text().trim().toLowerCase();
                const value = $(cells[1]).text().trim();

                switch (key) {
                    case 'classe':
                        record["Classe"] = {
                           
                                name: value,
                                URL: `http://vlex.com/trf2.jus/2379/classes/${value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')}`
                            
                        };
                        break;
                    case 'assunto(s)':
                        record["Assuntos"] = value;
                        break;
                    case 'competência':
                        record["Competência"] = {
            
                                name: value,
                                URL: `http://vlex.com/trf2.jus/2379/competencias/${value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')}`
                            
                        };
                        break;
                    case 'relator originário':
                        record["Relator"] = {
                            
                                name: value,
                                URL: `http://vlex.com/trf2.jus/2379/relatores/${value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')}`
                           
                        };
                        break;
                    case 'data autuação':
                        record["Data Autuação"] = moment(value, "DD/MM/YYYY").format("YYYY-MM-DD");
                        break;
                    case 'data julgamento':
                        record["Data Julgamento"] = moment(value, "DD/MM/YYYY").format("YYYY-MM-DD");
                        break;
                    default:
                        break;
                }
            }
        });

        records.push(record);
    });
    return records;
}