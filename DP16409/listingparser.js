async function parsePage({ responseBody, URL }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });
    const results = [];
    const IRS_BASE_URL = 'https://www.irs.gov';
    //const parserId = "A06slggsb2u2oa9";
  
  
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
  
  
    $('a[rel="bookmark"]').each((index, element) => {
      const pathHref = $(element).attr('href');
      const fullUrl = IRS_BASE_URL + pathHref;
      const title = $(element).find('span').text().trim();
  
      results.push({
        URL: URL,
        URI: fullUrl,
        title: toCamelCase(title)
      });
    });
  
  
    $('a[data-entity-type="node"]').each((index, element) => {
      const pathHref = $(element).attr('href');
      const fullUrl = IRS_BASE_URL + pathHref;
      const title = $(element).text().trim();
  
      results.push({
        URL: URL,
        URI: fullUrl,
        title: toCamelCase(title)
      });
    });
  
  
    return results.filter((result, index, self) =>
      index === self.findIndex((t) => t.URI === result.URI)
    );
  }
  
  const parseRemoteUrl = async (urlToParse, parserId) => {
    try {
      const urlToParseId = "H" + Buffer.from(urlToParse).toString("base64");
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
  
      let node = resp.nodes && resp.nodes.filter(n => n)[0];
      
      if (!node || !node.lastSuccessfulRequest) {
        return null; // URL is invalid or returns no content
      }
  
      const parserRes = await graphql(`
        query {
          node(id:"${parserId}") {
            ... on CrawledPageParser {
              jsonOutputFor(requestId:"${node.lastSuccessfulRequest.id}")
            }
          }
        }`);
  
      return parserRes?.node?.jsonOutputFor;
  
    } catch (error) {
      console.error(`Error parsing remote URL ${urlToParse}: ${error.message}`);
      return null; // Return null instead of throwing to handle the error gracefully
    }
  };
  
  