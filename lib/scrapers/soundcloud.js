const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");
const UserAgent = require("user-agents");

const soundcloud = {
    request: async function (data) {
        const request = {
            ...data,
            headers: {
                ...(data.headers ?? {}),
                "User-Agent": new UserAgent().toString(),
                ...(this.cookie ? { Cookie: this.cookie } : {})
            }
        };
        const response = await axios(request);
        const cookies = response.headers["set-cookie"];
        if (Array.isArray(cookies)) {
            this.cookie = cookies
                .map(cookie => {
                    return cookie.split("; ")[0];
                })
                .join("; ");
        }
        return response;
    },
    getToken: async function () {
        const response = await this.request({
            url: "https://www.klickaud.org/",
            method: "get"
        });
        const csrfResponse = await this.request({
            url: "https://www.klickaud.org/csrf-token-endpoint.php",
            method: "get"
        });
        const csrf = csrfResponse.data?.csrf_token;
        return csrf;
    },
    dl: async function dl(link) {
        const csrf_token = await this.getToken();
        console.log(csrf_token);
        if (!csrf_token) throw new Error("Error occoured decoding server");
        const data = qs.stringify({
            csrf_token,
            value: link
        });
        const downloadResponse = await this.request({
            method: "post",
            url: "https://www.klickaud.org/download.php",
            data,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
                // Cookie: "__appid=bzxcranfoc5l4vv5ui4u4umg"
            }
        });
        const $ = cheerio.load(downloadResponse.data);
        const reaultTable = $(
            "#header > div > div > div.col-lg-8 > div > table"
        );
        if (!reaultTable) throw new Error("no result found");
        const result = {
            title: reaultTable.find("tbody > tr > td:nth-child(2)").text(),
            bitrate: reaultTable.find("tbody > tr > td:nth-child(3)").text(),
            thumbnail: reaultTable
                .find("tbody > tr > td:nth-child(1) > img")
                .attr("src"),
            link: this.removeCloudFlare(
                $("#dlMP3")
                    .attr("onclick")
                    .split(`downloadFile('`)[1]
                    .split(`',`)[0]
            )
        };
        return result;
    },
    removeCloudFlare: function (dllink) {
        const url = new URL(dllink);
        url.host = "cf-media.sndcdn.com";
        return url.toString();
    },
    search: async function search(query) {
        const baseUrl = "https://m.soundcloud.com";

        // Fetch search results from SoundCloud
        const response = await axios.get(
            `${baseUrl}/search?q=${encodeURIComponent(query)}`
        );
        const $ = cheerio.load(response.data);

        const results = [];

        // Parse each result item
        $("div > ul > li > div").each((index, element) => {
            const title = $(element).find("a").attr("aria-label");
            const url = baseUrl + $(element).find("a").attr("href");
            const thumbnail = $(element)
                .find("a > div > div > div > picture > img")
                .attr("src");
            const artist = $(element).find("a > div > div > div").eq(1).text();
            const views = $(element)
                .find("a > div > div > div > div > div")
                .eq(0)
                .text();
            const timestamp = $(element)
                .find("a > div > div > div > div > div")
                .eq(1)
                .text();
            const releaseDate = $(element)
                .find("a > div > div > div > div > div")
                .eq(2)
                .text();

            // Push the result object into the results array
            results.push({
                title,
                url,
                thumb: thumbnail,
                artist,
                views,
                release: releaseDate,
                timestamp
            });
        });

        // Return status and results
        return {
            status: response.status,
            result: results
        };
    }
};

module.exports = soundcloud;
