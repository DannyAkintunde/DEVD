const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");
const UserAgent = require("user-agents");

const appleMusic = {
    getToken: async function getToken() {
        this.userAgent = new UserAgent();
        const response = await axios.get("https://aplmate.com/", { headers: {
            "user-agent": this.userAgent.toString()
        }});
        const $ = cheerio.load(response.data);
        return {
            token: $("input[type=hidden]").attr("name"),
            id: $("input[type=hidden]").val(),
            cookie: response.headers["set-cookie"]
                .map(cookie => cookie.split(";")[0])
                .join("; ")
        };
    },

    request: async function request(url) {
        url = url.split("?i=")[0];
        const rx = /^https:\/\/music\.apple\.com\/.+\/(album|song)\/.+$/;
        if (!rx.test(url)) {
            return {
                creator: "Danny",
                status: "error",
                code: 400,
                message: "Link must be an album or song slug."
            };
        }

        const { token, id, cookie } = await this.getToken();
        const form = new FormData();
        form.append("url", url);
        form.append(token, id);

        try {
            const response = await axios.post(
                "https://aplmate.com/action",
                form,
                {
                    headers: {
                        ...form.getHeaders(),
                        cookie,
                        "user-agent": this.userAgent
                            ? this.userAgent.toString()
                            : "Postify/1.0.0"
                    }
                }
            );
            const $ = cheerio.load(response.data);
            const musicInfo = await this.getInfo(url);

            if (url.includes("/song/")) {
                const image = $(".aplmate-downloader img").attr("src");
                const title = $(
                    ".aplmate-downloader h3[itemprop=name] .hover-underline"
                )
                    .text()
                    .trim();
                const artist = $(".aplmate-downloader p")
                    .text()
                    .trim()
                    .replace(/ · | · |\s/g, "")
                    .trim();
                const downloadLinks = this.getDownloadLinks(response.data);

                return {
                    creator: "Danny",
                    status: "success",
                    code: 200,
                    data: [
                        {
                            image,
                            title,
                            artist,
                            download: downloadLinks,
                            ...musicInfo
                        }
                    ]
                };
            }

            const results = await Promise.all(
                $(".row.dlvideos")
                    .map(async (index, element) => {
                        const image = $(element).find("img").attr("src");
                        const title = $(element)
                            .find("h3[itemprop=name] .hover-underline")
                            .text()
                            .trim();
                        const artist = $(element)
                            .find("p")
                            .text()
                            .trim()
                            .replace(/ · | · |\s/g, "")
                            .trim();
                        const jwtToken = $(element)
                            .find("input[name=data]")
                            .val();
                        const base = $(element).find("input[name=base]").val();
                        const tokens = $(element)
                            .find("input[name=token]")
                            .val();

                        const result = await this.getTrackData(
                            jwtToken,
                            base,
                            tokens,
                            cookie
                        );
                        const download = result.error
                            ? []
                            : this.getDownloadLinks(result.data);

                        return {
                            image,
                            title,
                            artist,
                            download: download.length ? download : result
                        };
                    })
                    .get()
            );

            const res = results.map(item => ({ ...item, ...musicInfo }));

            return {
                creator: "Danny",
                status: "success",
                code: 200,
                data: res
            };
        } catch {
            return {
                creator: "Danny",
                status: "error",
                code: 500,
                message: "Internal Server Error"
            };
        }
    },

    getInfo: async function getInfo(url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    "user-agent": this.userAgent
                        ? this.userAgent.toString()
                        : "Postify/1.0.0"
                }
            });
            const $ = cheerio.load(response.data);
            return {
                title: $("meta[property=og:title]").attr("content"),
                description: $("meta[property=og:description]").attr("content"),
                releaseDate: $("meta[property=music:release_date]").attr(
                    "content"
                ),
                imageUrl: $("meta[property=og:image]").attr("content"),
                genre: $("meta[property=music:genre]").attr("content"),
                duration: $("meta[property=music:song:duration]").attr(
                    "content"
                ),
                albumUrl: $("meta[property=music:album]").attr("content"),
                artistUrl: $("meta[property=music:musician]").attr("content"),
                albumTitle: $("meta[property=music:album]").attr("content")
            };
        } catch (error) {
            console.error(error);
            return {};
        }
    },

    getTrackData: async function getTrackData(jwtToken, base, tokens, cookie) {
        const form = new FormData();
        form.append("data", jwtToken);
        form.append("base", base);
        form.append("token", tokens);

        try {
            const response = await axios.post(
                "https://aplmate.com/action/track",
                form,
                {
                    headers: {
                        ...form.getHeaders(),
                        origin: "https://aplmate.com",
                        referer: "https://aplmate.com/",
                        cookie,
                        "user-agent": this.userAgent
                            ? this.userAgent.toString()
                            : "Postify/1.0.0"
                    }
                }
            );
            return response.data;
        } catch {
            return { error: true, message: "No response from API." };
        }
    },

    getDownloadLinks: html => {
        const $ = cheerio.load(html);
        return $(".aplmate-downloader .abuttons a")
            .map((index, element) => ({
                title: $(element).text().trim(),
                link: `https://aplmate.com${$(element).attr("href")}`
            }))
            .get()
            .filter(
                link =>
                    link.title === "Download Mp3" ||
                    link.title === "Download Cover [HD]"
            );
    },

    search: async function serach(term) {
        this.userAgent = new UserAgent();
        const searchUrl = encodeURI(
            `https://music.apple.com/us/search?term=${term}`
        );
        const response = await axios.get(searchUrl, {
            headers: {
                "User-Agent": this.userAgent.toString(),
                ...(this.appleMusicCookies
                    ? { Cookie: this.appleMusicCookies }
                    : {})
            }
        });
        const cookies = response.headers["set-cookie"];
        if (Array.isArray(cookies)) {
            this.appleMusicCookies = cookies
                .map(cookie => {
                    return cookie.split("; ")[0];
                })
                .join("; ");
        }
        const searchHTML = response.data;
        const $ = cheerio.load(searchHTML);
        const searchResults = $(".top-search-lockup");
        const results = searchResults.map((index, element) => {
            const $$ = $(element);
            const primaryTitle = $$.find(
                ".top-search-lockup__primary__title"
            ).text();
            const secondaryTitle = $$.find(
                ".top-search-lockup__secondary"
            ).text();
            const title = `${primaryTitle}${
                secondaryTitle ? " | " + secondaryTitle : ""
            }`;
            const url = $$.find(".top-search-lockup__action > a").attr("href");
            const thumbnails = $$.find(
                ".top-search-lockup__artwork picture > source[type='image/jpeg']"
            )
                .attr("srcset")
                ?.split(",")
                .map(src => {
                    const [url, size] = src.split(" ");
                    return {
                        url,
                        size
                    };
                });
            return { title, url, thumbnails };
        });
        return results.get();
    }
};

module.exports = appleMusic;
