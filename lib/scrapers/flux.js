const axios = require("axios");
const FormData = require("form-data");

const freeflux = {
    models: ["flux_1_schnell", "flux_1_dev", "sana_1_6b"],
    sizes: [
        "1_1",
        "1_1_HD",
        "1_2",
        "2_1",
        "2_3",
        "4_5",
        "9_16",
        "3_2",
        "4_3",
        "16_9"
    ],
    styles: [
        "no_style",
        "anime",
        "digital",
        "fantasy",
        "neon_punk",
        "dark",
        "low_poly",
        "line_art",
        "pixel_art",
        "comic",
        "analog_film",
        "surreal"
    ],
    colors: ["no_color", "cool", "muted", "vibrant", "pastel", "bw"],
    lightings: [
        "no_lighting",
        "lighting",
        "dramatic",
        "volumetric",
        "studio",
        "sunlight",
        "low_light",
        "golden_hour"
    ],

    create: async function (
        prompt,
        model = 1,
        size = 1,
        style = 1,
        color = 1,
        lighting = 1
    ) {
        const errors = [];
        if (!prompt?.trim())
            errors.push("Prompt nya kagak boleh kosong woyyyy 🫵");
        if (!this.models[model - 1])
            errors.push(
                `Index model nya kagak valid, harus pilih dari nomor 1 sampe ${this.models.length}`
            );
        if (!this.sizes[size - 1])
            errors.push(
                `Index size nya kagak valid, harus pilih dari nomor 1 sampe ${this.sizes.length}`
            );
        if (!this.styles[style - 1])
            errors.push(
                `Index style nya kagak valid, harus pilih dari nomor 1 sampe ${this.styles.length}`
            );
        if (!this.colors[color - 1])
            errors.push(
                `Index color nya kagak valid, harus pilih dari nomor 1 sampe ${this.colors.length}`
            );
        if (!this.lightings[lighting - 1])
            errors.push(
                `Index lighthing nya kagak valid, harus pilih dari nomor 1 sampe ${this.lightings.length}`
            );

        if (errors.length > 0) {
            return { errors };
        }

        try {
            const formData = new FormData();
            formData.append("prompt", prompt);
            formData.append("model", this.models[model - 1]);
            formData.append("size", this.sizes[size - 1]);
            formData.append("style", this.styles[style - 1]);
            formData.append("color", this.colors[color - 1]);
            formData.append("lighting", this.lightings[lighting - 1]);

            const response = await axios.post(
                "https://api.freeflux.ai/v1/images/generate",
                formData,
                {
                    headers: {
                        accept: "application/json, text/plain, */*",
                        "content-type": "multipart/form-data",
                        origin: "https://freeflux.ai",
                        priority: "u=1, i",
                        referer: "https://freeflux.ai/",
                        "user-agent": "Postify/1.0.0"
                    }
                }
            );

            const {
                id,
                status,
                result,
                processingTime,
                width,
                height,
                nsfw,
                seed
            } = response.data;
            return {
                data: {
                    id,
                    status,
                    result,
                    processingTime,
                    width,
                    height,
                    nsfw,
                    seed
                }
            };
        } catch (error) {
            console.error(error);
            return {
                errors: error.message
            };
        }
    }
};

module.exports = freeflux;
