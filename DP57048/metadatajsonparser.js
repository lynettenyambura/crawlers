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
      const regex = /\/(\d+)\.zip\/(?:json|html)\/(\d{4}-\d{2})\./;
      const match = URL.match(regex);
  
      let uri = URL;
      if (match) {
        const volume = match[1];
        const caseNumber = match[2];
  
        uri = `http://vlex.com/newhampshireofficialreports/${volume}/${caseNumber}`;
      }
  
      const results = [];
  
      const item = data;
  
      const result = {
        parseFrom: URL,
        URI: uri,
        title: createTitle(item),
        id: item.id || null,
        name: item.name || "",
        name_abbreviation: item.name_abbreviation || "",
        decision_date: item.decision_date ? moment(item.decision_date).format("YYYY-MM-DD") : null,
        docket_number: item.docket_number || "",
        first_page: item.first_page || "",
        last_page: item.last_page || "",
        citations: item.citations ? item.citations.map(citation => ({
          type: citation.type || "",
          cite: citation.cite || ""
        })) : [],
        court: item.court ? {
          id: item.court.id || null,
          name: item.court.name || "",
          name_abbreviation: item.court.name_abbreviation || ""
        } : {},
        jurisdiction: item.jurisdiction ? {
          id: item.jurisdiction.id || null,
          name: item.jurisdiction.name || "",
          name_long: item.jurisdiction.name_long || ""
        } : {},
        cites_to: item.cites_to ? item.cites_to.map(citeTo => ({
          cite: citeTo.cite || "",
          category: citeTo.category || "",
          reporter: citeTo.reporter || "",
          case_ids: citeTo.case_ids || [],
          opinion_index: citeTo.opinion_index || null,
          case_paths: citeTo.case_paths || []
        })) : [],
        analysis: item.analysis ? {
          cardinality: item.analysis.cardinality || null,
          char_count: item.analysis.char_count || null,
          ocr_confidence: item.analysis.ocr_confidence || null,
          pagerank: item.analysis.pagerank ? {
            raw: item.analysis.pagerank.raw || null,
            percentile: item.analysis.pagerank.percentile || null
          } : {},
          sha256: item.analysis.sha256 || "",
          simhash: item.analysis.simhash || "",
          word_count: item.analysis.word_count || null
        } : {},
        provenance: item.provenance ? {
          date_added: item.provenance.date_added || "",
          source: item.provenance.source || "",
          batch: item.provenance.batch || ""
        } : {},
        casebody: item.casebody ? {
          judges: item.casebody.judges || [],
          parties: item.casebody.parties || [],
          opinions: item.casebody.opinions ? item.casebody.opinions.map(opinion => ({
            text: opinion.text || "",
            type: opinion.type || "",
            author: opinion.author || ""
          })) : [],
          attorneys: item.casebody.attorneys || [],
          corrections: item.casebody.corrections || "",
          head_matter: item.casebody.head_matter || ""
        } : {},
        file_name: item.file_name || "",
        first_page_order: item.first_page_order || "",
        last_page_order: item.last_page_order || ""
      };
  
      results.push(result);
  
      return results;
    }
  }
  function createTitle(item) {
    let title = "";
  
    if (item.name) {
      title += item.name;
    }
  
    if (item.id) {
      title += title ? ` (ID: ${item.id})` : `ID: ${item.id}`;
    }
  
    if (item.decision_date) {
      const formattedDate = moment(item.decision_date).format("YYYY-MM-DD");
      title += title ? ` - ${formattedDate}` : formattedDate;
    }
  
    return title.trim() || "Untitled Case";
  }
  