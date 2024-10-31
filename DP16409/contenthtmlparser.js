//"use strict";

async function runRemoteFilter({ URL, filter }) {
    const URLId = "H" + new Buffer(URL).toString("base64");
    const URLIdN = "H" + sha256(URL) + ".N";
  
    const resp = await graphql(`
      query {
        nodes(ids: ["${URLId}", "${URLIdN}"]) {
          id
          ... on CrawledURL {
            lastSuccessfulRequest {
              outputForFilter(filter: "${filter}")
            }
          }
        }
      }`);
  
    const node = resp.nodes && (resp.nodes[0] || resp.nodes[1]);
    return node?.lastSuccessfulRequest?.outputForFilter[0]?.filterOutput?.transcodedMediaObject;
  }
  
  // function extractTitle(URL) {
  //   const titlePart = URL.split('newsroom/')[1];
  //   const rawTitle = titlePart.replace('.html', '').replace(/-/g, ' ');
  //   return rawTitle
  //     .split(' ')
  //     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(' ');
  // }
  
  async function transcodeMediaObject({ mediaObjectId, filter, locale }) {
    const resp = await graphql(`
      mutation {
        transcodeMediaObject (input: {
          clientMutationId: "0",
          filter: "${filter}",
          mediaObjectId: "${mediaObjectId}"
        }) {
          mediaObject {
            id
          }
        }
      }
    `);
  
    return resp?.transcodeMediaObject?.mediaObject?.id ? {
      mediaObjectId: resp.transcodeMediaObject.mediaObject.id,
      dataType: "MEDIA",
      locale
    } : null;
  }
  
  async function parsePage({ responseBody, URL }) {
    const records = [];
    const locale = "en";
    const uri = URL.replace('.html', '');
    const transcodedMediaObject = await runRemoteFilter({ URL, filter: "sofficePdf" });
  
    if (transcodedMediaObject?.id) {
      //const title = extractTitle(URL);
  
      const record = {
       // URL: URL,
        URI:uri,
        transcodedContent: {
          //title,
          mediaObjectId: transcodedMediaObject.id,
          dataType: "MEDIA",
          locale
        }
      };
  
      const htmlVersion = await transcodeMediaObject({
        mediaObjectId: transcodedMediaObject.id,
        locale,
        filter: "pdf2htmlEx"
      });
  
      if (htmlVersion) {
        record.htmlContent = htmlVersion;
      }
  
      records.push(record);
    }
  
    return records;
  }
  
  
  
  
  // function parsePage({ responseBody, URL }) {
  //   const $ = cheerio.load(responseBody.content, { decodeEntities: false });
  
  
  //   const records = [];
  
  
  //  const content = $.html();
  //  const locale = "en"
  //  const dataType = 'MEDIA'
  //   let htmlcontent = {
  //     fileFormat:'text/html',
  //     content,
  //     locale,
  //     dataType
  //   }
  
  
  //   const record = {
  //     URI: URL,
  //     htmlcontent
  //   };
  
  
  //   records.push(record);
  //   return records;
  // }
  
  