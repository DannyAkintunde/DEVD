const axios = require("axios");
const cheerio = require("cheerio");

async function pindl(url) {
    try {
        const response = await axios.get(
            `https://www.savepin.app/download.php?url=${url}&lang=en&type=redirect`
        );
        const body = await response.data;
        const $ = cheerio.load(body);
        let mediaType = "";
        const imageTable = $("table").has('tr:contains("Quality")').first();
        const videoTable = $("table").has('tr:contains("480p")').first();
        const results = [];

        if (imageTable.length) {
            imageTable.find("tr").each((index, element) => {
                const quality = $(element).find(".video-quality").text();
                const format = $(element).find("td:nth-child(2)").text();
                const downloadLink = $(element).find("a").attr("href");
                if (quality) {
                    results.push({
                        quality,
                        format,
                        media: new URL(
                            downloadLink,
                            "https://www.savepin.app"
                        ).toString()
                    });
                }
            });
        } else if (videoTable.length) {
            videoTable.find("tr").each((index, element) => {
                const quality = $(element).find(".video-quality").text();
                const format = $(element).find("td:nth-child(2)").text();
                const downloadLink = $(element).find("a").attr("href");
                if (quality) {
                    results.push({
                        quality,
                        format,
                        media: new URL(
                            downloadLink,
                            "https://www.savepin.app"
                        ).toString()
                    });
                }
            });
        } else {
            return { message: "No media found" };
        }

        return { results };
    } catch (error) {
        return { error: "Error fetching media data: " + error.message };
    }
}

module.exports = pindl;
