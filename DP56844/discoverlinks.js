function discoverLinks({ content, contentType, canonicalURL }) {
    var hrefs = [];
    if (contentType == "text/html") {
      var $ = cheerio.load(content);
      $("nav.elementor-pagination a.page-numbers").each(function () {
        hrefs.push($(this).attr("href"));
      });
      $("a.elementor-post__read-more").each(function () {
        hrefs.push($(this).attr("href"));
      });
      const nextPageUrl = $("div.e-load-more-anchor").attr("data-next-page");
      if (nextPageUrl) {
        hrefs.push(nextPageUrl);
      }
    }
    return hrefs;
  }