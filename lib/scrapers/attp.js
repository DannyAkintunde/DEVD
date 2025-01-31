const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");
const UserAgent = require("user-agents");

const fonts = {
    1: "porky_s"
};

const attp = {
    fonts,
    request: async ({
        text,
        font_id,
        glitter_id,
        size = 50,
        border_color = "000000",
        border_width = 2,
        shade_color = "000000",
        shade_width = 1,
        text_align = "center",
        angle = 0
    }) => {
        const host = "https://en.bloggif.com";
        // Validate size
        size = Number(size) || 50;

        // Validate font_id
        font_id =
            !Number(font_id) || !fonts[font_id]
                ? fonts[1]
                : fonts[Number(font_id)];

        // Validate glitter_id
        glitter_id =
            Number(glitter_id) > 0 && Number(glitter_id) <= 2812
                ? glitter_id
                : 59;

        // Create FormData
        const form = new FormData();
        form.append("target", 1);
        form.append("bg_color", "FFFFFF");
        form.append("transparent", 1);
        form.append("text", text);
        form.append("size", size);
        form.append("font_id", font_id);
        form.append("glitter_id", glitter_id);
        form.append("border_color", border_color);
        form.append("border_width", border_width);
        form.append("shade_color", shade_color);
        form.append("shade_width", shade_width);
        form.append("text_align", text_align);
        form.append("angle", angle);

        try {
            // Send request
            const res = await axios.post(`${host}/text`, form, {
                headers: {
                    ...form.getHeaders(),
                    "user-agent": new UserAgent().toString(),
                    Origin: host
                }
            });

            // Load response data with Cheerio
            const $ = cheerio.load(res.data);

            // Extract GIF URL
            const gifUrlPath = $(".box.center > a").attr("href");
            return host + gifUrlPath;
        } catch (error) {
            console.error("Error generating GIF:", error);
            throw error;
        }
    }
};

module.exports = attp;
