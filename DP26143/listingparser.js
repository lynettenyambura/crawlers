function parsePage({ responseBody, URL }) {
    const $ = cheerio.load(responseBody.content, { decodeEntities: false });
    const groupedRecords = new Map();
    const standaloneRecords = [];
    const baseURL = 'https://www.urf.gov.co/webcenter/portal/urf/pages_Normativa/proydecretos/proyectosdedecreto?';

    const extractTitle = (text) => {
        text = text.trim().replace(/^["']|["']$/g, '');
        const match = text.match(/Por (el|la) cual[^.]+/);
        if (match) {
            let extracted = match[0].trim().replace(/["']/g, '');
            extracted = extracted.replace(/\.$/, '');
            return extracted;
        }
        return null;
    };

    const normalizeTitle = (title) => {
        return title?.replace(/\s+/g, '').toLowerCase();
    };

   const extractCommentEndDate = (text) => {
    const patterns = [
        /Se recibirán comentarios hasta el (\d{1,2} de [a-zA-Z]+ de \d{4})/,
        /Se recibirán comentarios hasta el ([a-zA-Z]+ \d{1,2} de [a-zA-Z]+ de \d{4})/,
        /entre el \d{1,2} de [a-zA-Z]+ y el (\d{1,2} de [a-zA-Z]+ de \d{4})/,
        /Fecha de Publicación: (\d{1,2} de [a-zA-Z]+ de \d{4})/
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return moment(match[1], ['DD [de] MMMM [de] YYYY', 'D [de] MMMM [de] YYYY'], 'es').format('YYYY-MM-DD');
        }
    }

    return null;
};


    const extractYear = (date) => {
        return date ? moment(date).year().toString() : null;
    };

    $('.row_documento').each((index, element) => {
        const $row = $(element);
        const fullTitle = $row.find('a.linkMinisterio').text().trim();
        const contentURL = $row.find('a.linkMinisterio').attr('href');
        const paragrafText = $row.find('.ParagrafMinisterio').text().trim();

        if (fullTitle && contentURL) {
            let extractedTitle = extractTitle(fullTitle) || extractTitle(paragrafText);

            if (!extractedTitle) {
                const combinedText = (fullTitle + ' ' + paragrafText).replace(/["']/g, '');
                extractedTitle = extractTitle(combinedText);
            }
            const normalizedTitle = normalizeTitle(extractedTitle);
            const parentURI = extractedTitle ? `${baseURL}${(extractedTitle)}` : null;
            const commentEndDate = extractCommentEndDate(paragrafText);
            const year = extractYear(commentEndDate);

            const record = {
                title: fullTitle,
                extractedTitle: extractedTitle,
                // normalizedTitle: normalizedTitle,
                URI: contentURL,
                parseFrom: URL,
                class: fullTitle.toLowerCase().includes('proyecto') && fullTitle.toLowerCase().includes('decreto') ? 'initial bill' : null,
                parentURI: parentURI,
                // commentEndDate: commentEndDate,
                // year: year
            };

            if (parentURI) {
                let foundGroup = false;
                for (const [groupURI, group] of groupedRecords.entries()) {
                    if (normalizeTitle(group.children[0].extractedTitle) === normalizedTitle) {
                        group.children.push(record);
                        if (commentEndDate && (!group.commentEndDate || moment(commentEndDate).isAfter(group.commentEndDate))) {
                            group.commentEndDate = commentEndDate;
                            group.year = year;
                        }
                        foundGroup = true;
                        break;
                    }
                }
                if (!foundGroup) {
                    groupedRecords.set(parentURI, {
                        children: [record],
                        mother: null,
                        commentEndDate: commentEndDate,
                        year: year
                    });
                }
            } else {
                standaloneRecords.push(record);
            }
        }
    });

    const finalRecords = [];
    groupedRecords.forEach((group, parentURI) => {
        if (group.children.length > 1) {
            finalRecords.push({
                isMother: true,
                URI: parentURI,
                title: group.children[0].extractedTitle,
                commentEndDate: group.commentEndDate,
                year: group.year
            });
            finalRecords.push(...group.children);
        } else if (group.children.length === 1) {
            finalRecords.push(group.children[0]);
        }
    });

    finalRecords.push(...standaloneRecords);

    return finalRecords;
}