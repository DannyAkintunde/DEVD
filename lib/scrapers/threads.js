const playwright = require("./utils/playwrightrun");

const payload = url => `// payload
const playwright = require("playwright");

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

    await page.goto("https://threadster.app");

    await page.fill("input#url", url);
    await page.click(".download__form > button");

    await page.waitForSelector(".download__items");

    // extract data
    const response = await page.evaluate(() => {
        let response = [];
        let medias = document.querySelectorAll(".download_item");
        medias.forEach(media => {
            let mediaObj = {};
            const userImg = media.querySelector(
                ".download__item__user_info img"
            );
            const profileName = userImg?.getAttribute("alt");
            const profileAvata = userImg?.getAttribute("src");
            mediaObj.user = {
                name: profileName,
                avata: profileAvata
            };
            mediaObj.caption = media.querySelector(
                ".download__item__caption__text"
            )?.innerText;
            const downloadLink = media
                .querySelector(".btn.download__item__info__actions__button")
                ?.getAttribute("href");
            const type = downloadLink?.includes("image") ? "image" : "video";
            mediaObj.downloadLink = downloadLink;
            mediaObj.type = downloadLink ? type : null;
            response.push(mediaObj);
        });
        return response;
    });
    console.log(JSON.stringify(response));
    await page.close();
    await browser.close();
})();
`;

const threads = {
    threadRegrex: /((http|https)\/\/)?www\.?threads\.net\/@.+\/post\/.+/,
    test(url) {
        return threads.threadRegrex.test(url) ?? false;
    },
    dl: async url => {
        const { success, output, error } = await playwright.run(payload(url));
        if (success !== true)
            throw new Error(
                `An error occurred while extracting data from link ${url}: ${error}`
            );
        try {
            // console.log(output);
            const data = JSON.parse(output);
            return { success: true, data };
        } catch {
            return {
                success: false,
                error: "can't parse data, not data from link"
            };
        }
    }
};

module.exports = threads
