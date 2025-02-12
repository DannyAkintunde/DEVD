const axios = require("axios");
const cheerio = require("cheerio");
const UserAgent = require("user-agents");
const FormData = require("form-data");

const spotifyDL = {
    userAgentGen: new UserAgent({ deviceCategory: "desktop" }),
    getToken: async function getToken() {
        this.userAgent = this.userAgentGen.random().toString() || "Postify/1.0";
        const response = await axios.get("https://spotidown.app/", {
            headers: {
                Referer: "https://spotidown.app",
                "User-Agent": this.userAgent,
                Origin: "https://spotidown.app",
                Authority: "spotidown.app/"
            }
        });
        const $ = cheerio.load(response.data);
        const tokens = $("input[type=hidden]")
            .map((index, element) => {
                return {
                    name: $(element).attr("name"),
                    value: $(element).val()
                };
            })
            .get();
        return {
            tokens,
            cookie: response.headers["set-cookie"]
                .map(cookie => cookie.split(";")[0])
                .join("; ")
        };
    },
    dl: async function (link) {
        const spotlink = /^((https|http):\/\/)?open\.spotify\.com\/.+/;
        if (!spotlink.test(link)) {
            return {
                success: false,
                message: "Invalid spotify link"
            };
        }
        try {
            const { tokens, cookie } = await this.getToken();
            console.log(tokens, cookie);
            const form = new FormData();
            form.append("url", link);
            tokens.forEach(({ name, value }) => {
                form.append(name, value || "");
            });
            const response = await axios.post(
                "https://spotidown.app/action",
                form,
                {
                    headers: {
                        ...form.getHeaders(),
                        Cookie: cookie,
                        Referer: "https://spotidown.app",
                        "User-Agent": this.userAgent,
                        Origin: "https://spotidown.app",
                        Authority: "spotidown.app"
                    }
                }
            );
            const $ = cheerio.load(response.data);
            const image = $(".spotidown-downloader img").attr("src");
            const title = $(".spotidown-downloader h3[itemprop=name]")
                .text()
                .trim();
            const artist = $(".spotidown-downloader p")
                .text()
                .trim()
                .replace(/ · | · |\s/g, "")
                .trim();
            const dlLinks = $(".spotidown-downloader .abuttons a")
                .map((index, element) => ({
                    title: $(element).text().trim(),
                    link: $(element).attr("href")
                }))
                .get()
                .filter(
                    link =>
                        link.title === "Download Mp3" ||
                        link.title === "Download Cover [HD]"
                );
            return {
                success: true,
                metadata: { cover: image, title, artist },
                dlLinks
            };
        } catch (error) {
            console.error(error.message);
            console.error(error.stack);
            return {
                success: false,
                message: `Unable to extract data from Spotify link ${link}:${error.message}`
            };
        }
    },

    play: async query => {
        const url = `https://www.bhandarimilan.info.np/spotisearch?query=${encodeURIComponent(
            query
        )}`;
        try {
            const { data } = await axios.get(url);
            if (!data || !Array.isArray(data) || data.length === 0) {
                return {
                    success: false,
                    message: `Pencarian ${query} tidak ditemukan.`
                };
            }
            const songs = data.map(ft => {
                return {
                    name: ft.name,
                    artist: ft.artist,
                    release_date: ft.release_date,
                    duration: ft.duration,
                    link: ft.link,
                    image_url: ft.image_url,
                    dlink: async () => await spotifyDL.dl(ft.link)
                };
            });

            return { success: true, songs };
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: `Tidak dapat menemukan pencarian ${query}`
            };
        }
    }
};

module.exports = spotifyDL;
