function parsePage({ responseBody, URL, referer }) {
    console.log(`parsePage: parsing: ${responseBody.fileFormat} ${URL}`);
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });
  
    let authorSelectors = [
      'a[href^="autor:"]',
      'p',
      'span',
      'div.elementor-widget-container p em span a strong',
      'h4.elementor-heading-title a',
      'p',
      'h2.elementor-heading-title'
    ];
  
    let author = '';
    let excludeHeadings = ['BLOG', 'Compartir', 'Escrito por'];
  
    for (let sel of authorSelectors) {
      $(sel).each(function () {
        let text = $(this).text().trim();
        if (excludeHeadings.includes(text)) return true;
        if (text.includes('Autor:')) {
          author = text.replace('Autor:', '').trim();
          return false;
        }
        let $container = $(this).closest('div.elementor-widget-container');
        if ($container.find('p em span').text().includes('Para más información, contactame') ||
          $container.find('h4.elementor-heading-title').length ||
          $container.find('h2.elementor-heading-title').length ||
          text.includes('Para más información, contactar a') ||
          text.includes('Para más información, comunícate con')) {
          author = text.replace(/Para más información,\s*(contactame|contactar a|comunícate con)/g, '').replace(':', '').trim();
          return false;
        }
      });
      if (author) break;
    }
  
    const contactKeywords = [
      'Para más información', 'contactar a', 'Tel', 'Email', 'Síguenos en',
      'INSTAGRAM', 'TIKTOK', 'WHATSAPP', '#',
    ];
  
    contactKeywords.forEach(keyword => {
      $('p, li').filter(function () {
        return $(this).text().includes(keyword);
      }).remove();
    });
  
    $('figure.wp-block-image.alignwide.size-full').remove();
    $('img').remove();
    $('form, .elementor-form-fields-wrapper, .elementor-field-group').remove();
    $('div.elementor-element.elementor-widget.elementor-widget-form').remove();
  
    let language = detectLanguage($);
  
    let specificContentElement = $('div.elementor-element.elementor-widget-theme-post-content[data-widget_type="theme-post-content.default"] > div.elementor-widget-container');
    if (specificContentElement.length) {
      let contentHTML = specificContentElement.html();
      contentHTML = changeColorToBlack(contentHTML);
  
      const record = {
        URI: URL,
        author,
        language,
        content: {
          fileFormat: 'text/html',
          dataType: 'MEDIA',
          content: contentHTML,
          locale: language
        },
      };
  
      return [record];
    }
  
    let contentElements = $('div.elementor-element.elementor-widget-theme-post-content[data-widget_type="theme-post-content.default"] > div.elementor-widget-container');
    if (!contentElements.length) {
      contentElements = $('body');
  
  
    }
    let contentHTML = '';
    if (contentElements.length) {
      contentElements.each(function () {
  
        $(this).find('img, form, input, textarea, button').remove();
        contentHTML += $(this).html();
      });
    } else {
      contentHTML = $.html();
    }
  
  
  
    contentHTML = changeColorToBlack(contentHTML);
  
    const record = {
      URI: URL,
      author,
      language,
      content: {
        fileFormat: 'text/html',
        dataType: 'MEDIA',
        content: contentHTML,
        locale: language
      },
    };
  
    return [record];
  }
  
  
  function changeColorToBlack(html) {
    return html.replace(/color:\s*#1E5B52;/g, 'color: #202020;');
  }
  
  function detectLanguage($) {
    const contentText = $('body').text().toLowerCase();
    const englishIndicators = [
      'the', 'and', 'of', 'to', 'in', 'that', 'for', 'it', 'with', 'as',
      'was', 'on', 'are', 'be', 'by', 'at', 'this', 'have', 'from', 'or',
      'one', 'had', 'but', 'not', 'what', 'all', 'were', 'we', 'when',
      'your', 'can', 'said', 'there', 'use', 'an', 'each', 'which', 'she', 'do',
      'how', 'their', 'if', 'will', 'up', 'other', 'about', 'out', 'many', 'then',
      'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'him', 'into',
      'time', 'has', 'look', 'two', 'more', 'write', 'go', 'see', 'number', 'no',
      'way', 'could', 'people', 'my', 'than', 'first', 'water', 'been', 'call', 'who',
      'oil', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come'
    ];
    const spanishIndicators = [
      'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se',
      'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le',
      'lo', 'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este',
      'ir', 'otro', 'ese', 'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando',
      'él', 'muy', 'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre', 'mi', 'alguno',
      'mismo', 'yo', 'también', 'hasta', 'año', 'dos', 'querer', 'entre', 'así', 'primero',
      'desde', 'grande', 'eso', 'ni', 'nos', 'llegar', 'pasar', 'tiempo', 'ella', 'sí',
      'día', 'uno', 'bien', 'poco', 'deber', 'entonces', 'poner', 'cosa', 'tanto', 'hombre',
      'parecer', 'nuestro', 'tan', 'donde', 'ahora', 'parte', 'después', 'vida', 'quedar', 'siempre'
    ];
    let englishCount = 0;
    let spanishCount = 0;
  
    englishIndicators.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = contentText.match(regex);
      if (matches) englishCount += matches.length;
    });
  
    spanishIndicators.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = contentText.match(regex);
      if (matches) spanishCount += matches.length;
    });
  
    // Check for Spanish-specific characters
    const spanishChars = 'áéíóúñü¿¡';
    const spanishCharCount = (contentText.match(new RegExp(`[${spanishChars}]`, 'g')) || []).length;
    spanishCount += spanishCharCount * 2;
    if (englishCount > spanishCount) {
      return 'en';
    } else if (spanishCount > englishCount) {
      return 'es';
    } else {
      const htmlLang = $('html').attr('lang') || '';
      const bodyLang = $('body').attr('lang') || '';
      if (htmlLang.startsWith('en') || bodyLang.startsWith('en')) return 'en';
      if (htmlLang.startsWith('es') || bodyLang.startsWith('es')) return 'es';
      return 'en';
    }
  }
  
  
  
  
  