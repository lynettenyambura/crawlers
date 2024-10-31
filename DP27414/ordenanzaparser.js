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

        const results = [];

        if (data && Array.isArray(data.Row)) {
            data.Row.forEach(item => {
                let formattedFecha = null;
                if (item.Fecha) {
                    formattedFecha = moment(item.Fecha, 'DD/MM/YYYY').format('YYYY-MM-DD');
                }

                const documentDateMatch = item.FileLeafRef.match(/(\d{1,2}\s+[a-zA-Z]+\s+\d{4})/);
                let documentDate = null;

                if (documentDateMatch) {
                    const rawDate = documentDateMatch[1];
                    documentDate = moment(rawDate, 'D MMMM YYYY', 'es').format('YYYY-MM-DD');
                }

                let formattedFechaPublicacion = null;
                if (item.cbup) {
                    const rawFechaPublicacion = item.cbup.split(' ')[0];
                    formattedFechaPublicacion = moment(rawFechaPublicacion, 'DD/MM/YYYY').format('YYYY-MM-DD');
                }

                const result = {
                    URI: `https://www.casanare.gov.co${item.FileRef}`,
                    URL: URL,
                    document_type: item.Clasificaci_x00f3_n || "",
                    year: item.A_x00f1_o || "",
                    resolution_number: item.Title || "",
                    fecha: formattedFecha || "",
                    Dependencia: item.Dependencia || "null",
                    fecha_publicacion: formattedFechaPublicacion || "",
                    document_date: documentDate
                };

                results.push(result);
            });
        }

        return results;
    }

    return [];
}

// function inferDependencia(descripcion) {
//     if (descripcion) {
//         const lowerDesc = descripcion.toLowerCase();
//         if (lowerDesc.includes("por medio de la cual") &&
//             (lowerDesc.includes("departamento de casanare") ||
//              lowerDesc.includes("gobernador") ||
//              lowerDesc.includes("presupuesto general"))) {
//             return "Asamblea Departamental de Casanare";
//         }
//     }
//     return "null";
// }