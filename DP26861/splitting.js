function createURIFriendlyTitle(title) {
    return encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  }
  
  async function parsePage({ responseBody, URL, html, referer }) {
    console.log(`parsePage: parsing: ${URL}`);
  
    const basePdfUrl = 'https://www.documentos.dioe.pr.gov.br/dioe/consultaPublicaPDF.do?action=download&ec=yFnNFNoFNHfMFFmLFNiFMFfNT&arquivoCodigo=22574';
  
    const summaryText = await runRemoteFilter({ URL, filter: "pdftotext_raw" });
    const summaryLines = summaryText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !/\d{1,2} de \w+ de \d{4}/.test(line));
  
    console.log('Number of summary lines:', summaryLines.length);
  
    let gazetteNumber = null;
    let gazetteDate = null;
    const gazetteInfoLine = summaryLines.find(line => line.includes('Edição Digital'));
    const dateLine = summaryText.match(/\d{1,2} de \w+ de \d{4}/);
  
    if (gazetteInfoLine) {
      const numberMatch = gazetteInfoLine.match(/Edição Digital nº (\d+)/);
      gazetteNumber = numberMatch ? numberMatch[1] : null;
    }
  
    if (dateLine) {
      gazetteDate = moment(dateLine[0], 'D [de] MMMM [de] YYYY', 'pt').format('YYYY-MM-DD');
    }
  
    const summaryStartIndex = summaryLines.findIndex(line => line.toLowerCase().includes('sumário'));
    const summaryEndIndex = summaryLines.findIndex(line => line.toLowerCase().includes('autarquias'));
  
    if (summaryStartIndex !== -1 && summaryEndIndex !== -1) {
      const summaryItems = [];
      let currentSection = '';
  
      summaryLines.slice(summaryStartIndex + 1, summaryEndIndex + 1).forEach((line, index, array) => {
        if (!/\.\.{2,}|\d{1,3}/.test(line)) {
          currentSection = line.trim();
        } else {
          const regex = /(.+?)(?:\.{2,}|\s{2,})(\d{1,3})\s*$/;
          const matches = line.match(regex);
  
          if (matches) {
            let title = matches[1].trim().replace(/\.+$/, '');
            let startPage = matches[2].trim();
            let endPage;
  
            if (index < array.length - 1) {
              const nextMatches = array[index + 1].match(regex);
              endPage = nextMatches ? (parseInt(nextMatches[2]) - 1).toString() : startPage;
            } else {
              endPage = startPage;
            }
  
            const URI = `${basePdfUrl}&title=${createURIFriendlyTitle(title)}&startpage=${startPage}&endpage=${endPage}`;
  
            summaryItems.push({
              title,
              startPage,
              endPage,
              section: currentSection,
              gazetteNumber,
              gazetteDate,
              URI
            });
          } else {
            const parts = line.split(/\s+/);
            if (parts.length > 1) {
              const startPage = parts.pop();
              const title = parts.join(' ').replace(/\.+$/, '');
              if (title && !isNaN(parseInt(startPage))) {
                const URI = `${basePdfUrl}&title=${createURIFriendlyTitle(title)}&startpage=${startPage}&endpage=${startPage}`;
                summaryItems.push({
                  title,
                  startPage,
                  endPage: startPage,
                  section: currentSection,
                  gazetteNumber,
                  gazetteDate,
                  URI,
                  parseFrom: URL
                });
              }
            }
          }
        }
      });
  
      for (let i = 0; i < summaryItems.length - 1; i++) {
        summaryItems[i].endPage = (parseInt(summaryItems[i + 1].startPage) - 1).toString();
      }
  
      for (let i = 0; i < summaryItems.length - 1; i++) {
        summaryItems[i].endPage = (parseInt(summaryItems[i].endPage) + 1).toString();
      }
  
      for (let i = 1; i < summaryItems.length - 1; i++) {
        if (summaryItems[i].startPage === summaryItems[i - 1].startPage) {
          summaryItems[i - 1].endPage = summaryItems[i].startPage;
        }
      }
  
      if (summaryItems.length > 0) {
        summaryItems[summaryItems.length - 1].endPage = 'end';
      }
  
      summaryItems.forEach(item => {
        item.URI = `${basePdfUrl}&title=${createURIFriendlyTitle(item.title)}&startpage=${item.startPage}&endpage=${item.endPage}`;
      });
      // Process summary items with splitPDF function
      for (let item of summaryItems) {
        const { splitPdf, splitHtml, splitText } = await splitPDF({ pdfURL: basePdfUrl, startPage: item.startPage, endPage: item.endPage, locale: 'pt-BR' });
        if (splitPdf || splitHtml || splitText) {
          item.splitPdf = splitPdf;
          item.splitHtml = splitHtml;
          item.splitText = splitText;
        }
      }
      return summaryItems;
    }
  }
  
  const runRemoteFilter = async function ({ URL, filter, id }) {
    let htmlContent = "";
    const URLId = URL && "H" + Buffer.from(URL).toString("base64");
    const URLIdN = URL && "H" + sha256(URL) + ".N";
    let query = `
                query {` +
      `
                  nodes(ids: ["${URL && `${URLId}", "${URLIdN}` || `${id}`}"]) {`
      + `               id
                  ... on CrawledURL {
                    lastSuccessfulRequest {
                      outputForFilter(filter: "${filter}")
                    }
                  }
                }
              }`;
    const resp = await graphql(query);
  
    let node = resp.nodes.filter(n => n)[0];
  
    if (node && node.lastSuccessfulRequest && node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content) {
      let _html = node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content;
      htmlContent += _html;
    } else {
    }
    return htmlContent;
  };
  
  async function splitPDF({ pdfURL, startPage = 1, endPage = 'end', locale }) {
    const URLId = "H" + Buffer.from(pdfURL).toString("base64");
    const URLIdN = "H" + sha256(pdfURL) + ".N";
    const resp = await graphql(`
              query {
                nodes(ids: ["${URLId}", "${URLIdN}"]) {
                  id
                  ... on CrawledURL {
                    lastSuccessfulRequest {
                      outputForFilter(filter: "getPDFRange", arguments: {FROM: "${startPage}", TO: "${endPage}"})
                    }
                  }
                }
              }`);
    const res = resp.nodes && (resp.nodes[0] || resp.nodes[1]);
    const transcodedMediaObject = res && res.lastSuccessfulRequest &&
      res.lastSuccessfulRequest.outputForFilter &&
      res.lastSuccessfulRequest.outputForFilter.length &&
      res.lastSuccessfulRequest.outputForFilter[0].filterOutput &&
      res.lastSuccessfulRequest.outputForFilter[0].filterOutput.transcodedMediaObject;
  
    let splitPdf = null;
    let splitHtml = null;
    let splitText = null;
  
    if (transcodedMediaObject) {
      splitPdf = transcodedMediaObject.id && {
        mediaObjectId: transcodedMediaObject.id,
        dataType: "MEDIA",
        locale
      };
      splitHtml = transcodedMediaObject.id && await transcodeMediaObject({
        mediaObjectId: transcodedMediaObject.id,
        locale,
        filter: "pdf2htmlEx"
      });
      splitText = transcodedMediaObject.id && await transcodeMediaObject({
        mediaObjectId: transcodedMediaObject.id,
        locale,
        filter: "pdftotext_raw"
      });
    }
    return { splitPdf, splitHtml, splitText };
  }
  
  
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
  `)
  
    return resp && resp.transcodeMediaObject && resp.transcodeMediaObject.mediaObject && {
      mediaObjectId: resp.transcodeMediaObject.mediaObject.id, dataType: "MEDIA", locale
    };
  }
  
  