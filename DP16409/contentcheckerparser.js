async function parsePage({ responseBody, URL }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });
    const results = [];
    const IRS_BASE_URL = 'https://www.irs.gov';
    const parserId = "A06slggsb2u2oa9";
  
  
    const exceptions = ['on', 'in', 'the', 'a', 'and', 'to', 'for', 'of', 'by', 'with', 'at', 'from', 'but', 'or', 'nor'];
  
  
    function toCamelCase(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (exceptions.includes(word) && index !== 0) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }
  
    const tempResults = [];
  
  
    $('a[rel="bookmark"]').each((index, element) => {
      const pathHref = $(element).attr('href');
      const fullUrl = IRS_BASE_URL + pathHref;
      const title = $(element).find('span').text().trim();
     
      tempResults.push({
        URL: URL,
        URI: fullUrl,
        title: toCamelCase(title)
      });
    });
  
  
    $('a[data-entity-type="node"]').each((index, element) => {
      const pathHref = $(element).attr('href');
      const fullUrl = IRS_BASE_URL + pathHref;
      const title = $(element).text().trim();
     
      tempResults.push({
        URL: URL,
        URI: fullUrl,
        title: toCamelCase(title)
      });
    });
  
  
    for (const item of tempResults) {
      const urlCheck = await parseRemoteUrl(item.URI, parserId);
      if (urlCheck) {
        results.push(item);
      }
    }
  
  
    return results.filter((result, index, self) =>
      index === self.findIndex((t) => t.URI === result.URI)
    );
  }
  
  const parseRemoteUrl = async (urlToParse, parserId) => {
      const urlToParseId = "H" + new Buffer(urlToParse).toString("base64");
      const urlToParseId2 = "H" + sha256(urlToParse) + ".N";
      const resp = await graphql(`
            query {
              nodes(ids: ["${urlToParseId}", "${urlToParseId2}"]) {
                id
                ... on CrawledURL {
                  lastSuccessfulRequest {
                    id
                  }
                }
              }
            }`);
  
      let parserRes;
      let node = resp.nodes && resp.nodes.filter(n => n)[0];
      if (node && node.lastSuccessfulRequest) {
          // Parse acordao listing page
          parserRes = await graphql(`
              query {
                node(id:"${parserId}") {
                  ... on CrawledPageParser {
                    jsonOutputFor(requestId:"${node.lastSuccessfulRequest.id}")
                  }
                }
              }`);
      }
  
      return parserRes && parserRes.node && parserRes.node.jsonOutputFor;//returns array, filter as necessary
  };
  
  