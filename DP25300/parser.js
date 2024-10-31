function parsePage({ responseBody, URL, html, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);

    if (responseBody.fileFormat === "application/json") {
        let data;
        try {
            data = JSON.parse(responseBody.content);
            console.log("Parsed data:", JSON.stringify(data, null, 2));
        } catch (error) {
            console.error("Failed to parse JSON:", error);
            return [];
        }

        const results = [];
        if (data && Array.isArray(data.content)) {
            data.content.forEach(item => {
                let uri = null;
                if (item.numeroUnicoFormatado) {
                    uri = `http://www.tse.jus.br/jurisprudencia/decisoes/${item.numeroUnicoFormatado}/${item.descricaoTipoDecisao.toLowerCase()}/${item.dataDecisao}`;
                }
                // PDF URL
                const pdfUrl = item.pdfUrl || null;
                const htmlContent = {
                    fileFormat: "text/html",
                    dataType: 'MEDIA',
                    content: item.textoDecisao || "",
                    locale: "pt"
                };

                const result = {
                    uri: uri,
                    pdf_url: pdfUrl,
                    title: item.descricaoClasse || "",
                    numeroUnicoFormatado: item.numeroUnicoFormatado || "",
                    tipo_decisao: item.descricaoTipoDecisao || "",
                    data_publicacao: item.publicacoes && item.publicacoes[0] ? moment(item.publicacoes[0].dataPublicacao, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
                    data_decisao_julgamento: item.dataDecisao ? moment(item.dataDecisao, "DD/MM/YYYY").format("YYYY-MM-DD") : "",
                    html_content: htmlContent,
                    relator: item.relatores && item.relatores[0] ? {
                        name: item.relatores[0].nome,
                        url: `http://www.tse.jus.br/jurisprudencia/decisoes/${item.relatores[0].nome.replace(/\s+/g, '-').toLowerCase()}`
                    } : {},
                    referencia_legislativa: item.referenciasLegislativas ? item.referenciasLegislativas.map(ref => ({
                        descricao: ref.descricao || "",
                        ano: ref.ano || "",
                        artigos: ref.artigos || []
                    })) : null,
                    partes: item.partes ? item.partes.map(parte => {
                        let parteString = `PARTE: ${parte.nomeParte}\n`;
                        if (parte.advogados) {
                            parte.advogados.forEach(advogado => {
                                parteString += `Advogado(a): ${advogado.nomeAdvogado}\n`;
                            });
                        }
                        return parteString;
                    }).join('\n') : null,
                    classe_processual: {
                        name: item.descricaoClasse || "",
                        url: `http://www.tse.jus.br/jurisprudencia/decisoes/${item.descricaoClasse.replace(/\s+/g, '-')}`.toLowerCase(),
                      
                    },
                     precedentes:item.precedentes
                };

                results.push(result);
            });
        }

        return results;
    }
}
