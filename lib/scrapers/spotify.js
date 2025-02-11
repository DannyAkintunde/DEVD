const axios = require("axios");
const cheerio = require("cheerio");
const UserAgent = require("user-agents");
const FormData = require("form-data");
// const playwright = require("./utils/playwrightrun");

// const payload = url => {
//     return `const playwright = require("playwright");

// const url = "${url}";

// (async () => {
//     // Select a random browser type
//     const browserType = [
//         //playwright.chromium,
//         playwright.firefox,
//         //playwright.webkit
//     ][Math.floor(Math.random() * 1)];

//     const browser = await browserType.launch();
//     const context = await browser.newContext();
//     const page = await context.newPage();

//     // Navigate to SpotifyMate
//     await page.goto("https://spotifymate.com/en", (timeout = 100000));

//     // Fill the URL input and submit the form
//     await page.fill("input#url", url);
//     await page.click("button#send");

//     // Wait for the download section to appear
//     await page.waitForSelector(".spotifymate-downloader-left");
    

//     // Extract information from the page
//     const info = await page.evaluate(() => {
//         const infoDiv = document.getElementById("download-section");
//         return {
//             image:
//                 infoDiv?.getElementsByTagName("img")[0]?.getAttribute("src") ||
//                 null,
//             name:
//                 infoDiv?.querySelector('h3[itemprop="name"]')?.innerText ||
//                 null,
//             downloadLink:
//                 infoDiv?.getElementsByTagName("a")[0]?.getAttribute("href") ||
//                 null
//         };
//     });

//     // Output the result
//     console.log(JSON.stringify(info));

//     // Close the browser
//     await browser.close();
// })();
// `;
// };

const spotifyDL = {
    userAgentGen: new UserAgent(),
    getToken: async function getToken() {
        this.userAgent = this.userAgentGen.random().toString() || "Postify/1.0";
        const response = await axios.get("https://spotifymate.com/", {
            headers: {
                "User-Agent": "Postify/1.0"
            }
        });
        const $ = cheerio.load(response.data);
        return {
            token: $("input[type=hidden]").attr("name"),
            id: $("input[type=hidden]").val(),
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
            const { token, id, cookie } = await this.getToken();
            console.log(token, id, cookie);
            const form = new FormData();
            form.append("url", link);
            form.append(token, id);

            const response = await axios.post(
                "https://spotifymate.com/action",
                form,
                {
                    headers: {
                        ...form.getHeaders(),
                        Cookie: cookie,
                        "User-Agent": "Postify/1.0",
                        Referer: "spotifymate.com",
                        Origin: "spotifymate.com"
                    }
                }
            );
            console.log(response.data);
            const $ = cheerio.load(response.data);
            const image = $(".spotifymate-downloader img").attr("src");
            const title = $(".spotifymate-downloader h3[itemprop=name]")
                .text()
                .trim();
            const artist = $(".spotifymate-downloader p")
                .text()
                .trim()
                .replace(/ · | · |\s/g, "")
                .trim();
            const dlLinks = $(".spotifymate-downloader .abuttons a")
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
            // const { success, output, error } = await playwright.run(
            //     payload(link)
            // );
            // if (!success) {
            //     throw new Error(
            //         `An error occurred while extracting data from link ${link}:${output}:${error}`
            //     );
            // }
            // const { image: thumbnail, name, downloadLink } = JSON.parse(output);
            // return {
            //     success: true,
            //     metadata: {
            //         title: name?.trim(),
            //         cover: thumbnail
            //     },
            //     link: downloadLink
            // };
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: `Unable to extract data from Spotify link ${link}`
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
