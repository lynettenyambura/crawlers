function parsePage({ responseBody, URL, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });
  
    const records = [];
    const uniqueLinks = new Set();
  
    $('.elementor-posts-container article').each(function () {
      const $article = $(this);
  
      let title = $article.find('h3.elementor-post__title').text().trim();
      const dateRaw = $article.find('.elementor-post__meta-data .elementor-post-date').text().trim();
      const formattedDate = moment(dateRaw, 'DD/MM/YYYY').format('YYYY-MM-DD');
      const readMoreLink = $article.find('a.elementor-post__read-more').attr('href');
      const language = detectLanguage(title);
      title = capitalizeTitle(title);
  
      if (!uniqueLinks.has(readMoreLink)) {
        const record = {
          URI: readMoreLink,
          title: {
            dataType: 'STRING',
            value: title,
            locale: language
          },
          date: formattedDate,
          language,
          URL:URL
        };
        records.push(record);
        uniqueLinks.add(readMoreLink);
      }
    });
  
    return records;
  }
  
  // Function to capitalize titles
  function capitalizeTitle(title) {
    const lowercaseWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'in', 'of'];
    return title.split(' ').map((word, index) => {
      if (index === 0 || !lowercaseWords.includes(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    }).join(' ');
  }
  
  // Function to detect language
  function detectLanguage(title) {
    const spanishChars = /[áéíóúñ¿¡]/i;
    const englishKeywords = ['the', 'and', 'with', 'for', 'on', 'is', 'by', 'to', 'in', 'a', 'of', 'an', 'as', 'that', 'it', 'all', 'us', 'big', 'small', 'foreign', 'direct', 'investment', 'united', 'states', 'international', 'surveys'];
    const spanishKeywords = ['el', 'la', 'y', 'con', 'para', 'en', 'es', 'por', 'de', 'los', 'las', 'un', 'una', 'que', 'nuevas', 'normas', 'regulan', 'trámite', 'administrativo', 'visto', 'bueno'];
  
    const titleWords = title.toLowerCase().split(/\s+/);
    const totalWords = titleWords.length;
  
    let englishCount = 0;
    let spanishCount = 0;
  
    titleWords.forEach(word => {
      if (englishKeywords.includes(word)) englishCount++;
      if (spanishKeywords.includes(word)) spanishCount++;
    });
  
    const englishRatio = englishCount / totalWords;
    const spanishRatio = spanishCount / totalWords;
  
    if (spanishChars.test(title) || spanishRatio > englishRatio) {
      return 'es';
    } else if (englishRatio > spanishRatio || englishRatio > 0.2) {
      return 'en';
    } else {
      const commonEnglishPattern = /\b(in|of|the|and|to|for|with|by|at|on)\b/i;
      return commonEnglishPattern.test(title) ? 'en' : 'es';
    }
  }
  