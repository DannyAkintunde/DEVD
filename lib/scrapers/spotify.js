const axios = require("axios");
const playwright = require("./utils/playwrightrun");

const payload = url => {
    return `const playwright = require("playwright");

const url = "${url}";

(async () => {
    // Select a random browser type
    const browserType = [
        playwright.chromium,
        playwright.firefox,
        playwright.webkit
    ][Math.floor(Math.random() * 3)];

    const browser = await browserType.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to SpotifyMate
    await page.goto("https://spotifymate.com/en", (timeout = 100000));

    // Fill the URL input and submit the form
    await page.fill("input#url", url);
    await page.click("button#send");

    // Wait for the download section to appear
    await page.waitForSelector(".spotifymate-downloader-right.is-desktop-only");

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
    dl: async link => {
        const spotlink = /^((https|http):\/\/)?open\.spotify\.com\/.+/;
        if (!spotlink.test(link)) {
            return {
                success: false,
                message: "Invalid spotify link"
            };
        }
        try {
            const { success, output, error } = await playwright.run(
                payload(link)
            );
            if (!success) {
                throw new Error(
                    `An error occurred while extracting data from link ${link}`
                );
            }
            const { image: thumbnail, name, downloadLink } = JSON.parse(output);
            return {
                success: true,
                metadata: {
                    title: name?.trim(),
                    cover: thumbnail
                },
                link: downloadLink
            };
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

            const ft = data[0];
            return {
                success: true,
                name: ft.name,
                artist: ft.artist,
                release_date: ft.release_date,
                duration: ft.duration,
                link: ft.link,
                image_url: ft.image_url,
                dlink: async () => (await spotifyDL.dl(ft.link))?.link
            };
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
