const axios = require("axios");
const cheerio = require("cheerio");
const UserAgent = require("user-agents");
const FormData = require("form-data");
const { Proxy } = require("../config");
const playwright = require("./utils/playwrightrun");

const makeProxyPostRequest = (formData, cookie, agent) => {
    `const { firefox } = require("playwright");

    async function makePostRequest() {
        const browser = await firefox.launch();
        const page = await browser.newPage();

        const body = "${formData[0].key}=${formData[0].value}&${formData[1].key}=${formData[1].value}"; // Replace with your actual form parameters

        const response = await page.request.post(
            "https://spotifymate.com/action",
            {
                data: body, // Raw body data as a string
                headers: {
                    Cookie: cookie,
                    "User-Agent": "${agent}", // Replace with your actual user-agent
                    Referer: "https://spotifymate.com",
                    Origin: "https://spotifymate.com",
                    "Content-Type": "application/x-www-form-urlencoded" // Content-Type for form data
                }
            }
        );

        const responseBody = await response.text(); // Get the response as text
        console.log(responseBody); // Log the raw response body

        await browser.close();
    }

    makePostRequest();`;
};

const payload = url => {
    return `const playwright = require("playwright");

const url = "https://open.spotify.com/track/5uuJruktM9fMdN9Va0DUMl:";

(async () => {
    // Select a random browser type
    const browserType = [
        //playwright.chromium,
        playwright.firefox,
        //playwright.webkit
    ][Math.floor(Math.random() * 1)];

    const browser = await browserType.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to SpotifyMate
    await page.goto("https://spotifymate.com/en", (timeout = 100000));
    await page.screenshot({path:"before.png"})
    // Fill the URL input and submit the form
    await page.fill("input#url", url);
    await page.click("button#send");
    await page.screenshot({path:"aftet.png"})
    // Wait for the download section to appear
    // await page.waitForSelector(".spotifymate-downloader");

    // Extract information from the page
    const info = await page.evaluate(() => {
        const infoDiv = document.getElementById("download-section");
        return {
            image:
                infoDiv?.getElementsByTagName("img")[0]?.getAttribute("src") ||
                null,
            name:
                infoDiv?.querySelector('h3[itemprop="name"]')?.innerText ||
                null,
            downloadLink:
                infoDiv?.getElementsByTagName("a")[0]?.getAttribute("href") ||
                null
        };
    });

    // Output the result
    console.log(JSON.stringify(info));

    // Close the browser
    await browser.close();
})();
`;
};

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

            // const { success, output, error } = await playwright.run(
            //     makeProxyPostRequest(formData, cookie, this.userAgent)
            // );
            // console.log(success, output, error);
            // const response = output;

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
            console.log(response.data);
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
spotifyDL.play("believer").then(async o => {
    console.log(o);
    console.log(await o.songs[0].dlink());
});
// playwright.run(payload()).then(console.log);
