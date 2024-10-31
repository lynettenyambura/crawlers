function parsePage({ responseBody, URL, html, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });
    const results = [];
  
    $(".ilistashtmlminimal_in tr").each((index, element) => {
      const $element = $(element);
      const acordao = $element.find(".acac a").text().trim();
      if (!acordao) return;
      let URI = $element.find(".acac a").attr("href");
      URI = url.resolve(URL, URI);
      const processo = $element.find(".processo").text().trim();
      let formacao = $element.find(".seccao").text().trim();
      let especie = $element.find(".especie").text().trim();
      const data = $element.find(".data").text().trim();
      const date = moment(data, "DD/MM/YYYY").format("YYYY-MM-DD");
      let relator = $element.find(".relator").text().trim();
  
      if (formacao === "Conf.") {
        formacao = {
          name: "Conferência",
          URL: "http://vlex.com/tc/2000/formacao/conferencia",
        };
      } else if (formacao === "Plen.") {
        formacao = {
          name: "Plenário",
          URL: "",
        };
      }
      if (especie === "Recurso") {
        especie = {
          name: "Recurso",
          URL: "http://vlex.com/tc/2000/especie/recurso",
        };
      }
      relator = relator.replace("Cons. ", "");
      relator = {
        name: relator,
        URL: `http://vlex.com/tc/2000/relatores/${encodeURIComponent(
          relator.toLowerCase().replace(/ /g, "-")
        )}`,
      };
      for (let result of results) {
        if (result.URI === URI) {
          return;
        }
      }
      results.push({ acordao, processo, formacao, especie, data, relator, URI, date });
    });
    return results;
  }