const axios = require("axios");

const playwright = {
    avLang: ["javascript", "python", "java", "csharp"],

    run: async function (code, language = "javascript") {
        if (!this.avLang.includes(language.toLowerCase())) {
            throw new Error(
                `Language "${language}" not supported pleas selecte one ot the following: ${this.avLang.join(
                    ", "
                )}`
            );
        }

        const url = "https://try.playwright.tech/service/control/run";
        const headers = {
            authority: "try.playwright.tech",
            accept: "*/*",
            "content-type": "application/json",
            origin: "https://try.playwright.tech",
            referer: "https://try.playwright.tech/?l=playwright-test",
            "user-agent": "Postify/1.0.0"
        };

        const data = {
            code: code,
            language: language
        };

        try {
            const response = await axios.post(url, data, { headers });
            const { success, error, version, duration, output, files } =
                response.data;
            return { success, error, version, duration, output, files };
        } catch (error) {
            if (error.response) {
                const {
                    success,
                    error: errMsg,
                    version,
                    duration,
                    output,
                    files
                } = error.response.data;
                return {
                    success,
                    error: errMsg,
                    version,
                    duration,
                    output,
                    files
                };
            } else {
                throw new Error(error.message);
            }
        }
    }
};

module.exports = playwright;
