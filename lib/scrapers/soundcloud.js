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
        url.host = "www.klickaud.co";
        return url.toString();
    },
    search: async function search(i) {
        let e = "https://m.soundcloud.com",
            t = await axios.get(`${e}/search?q=${encodeURIComponent(i)}`, {}),
            a = cheerio.load(t.data),
            d = [];
        return (
            a("div > ul > li > div").each(function (i, t) {
                let r = a(t).find("a").attr("aria-label"),
                    v = e + a(t).find("a").attr("href"),
                    s = a(t)
                        .find("a > div > div > div > picture > img")
                        .attr("src"),
                    n = a(t).find("a > div > div > div").eq(1).text(),
                    o = a(t)
                        .find("a > div > div > div > div > div")
                        .eq(0)
                        .text(),
                    u = a(t)
                        .find("a > div > div > div > div > div")
                        .eq(1)
                        .text(),
                    l = a(t)
                        .find("a > div > div > div > div > div")
                        .eq(2)
                        .text();
                d.push({
                    title: r,
                    url: v,
                    thumb: s,
                    artist: n,
                    views: o,
                    release: l,
                    timestamp: u
                });
            }),
            { status: t.status, result: d }
        );
    }
};
