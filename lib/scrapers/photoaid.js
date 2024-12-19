const axios = require("axios");
const fs = require("fs");

async function convert2Base64(url) {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary").toString("base64");
}

const headers = {
    authority: "photoaid.com",
    accept: "*/*",
    origin: "https://photoaid.com",
    "user-agent": "Postify/1.0.0"
};

const endpoints = {
    enlarger: {
        upload: "/ai-image-enlarger/upload",
        result: "/ai-image-enlarger/result",
        referer: "https://photoaid.com/en/tools/ai-image-enlarger"
    },
    relighting: {
        upload: "/relighting/upload",
        result: "/relighting/result",
        referer: "https://photoaid.com/en/tools/remove-shadow"
    },
    removebg: {
        upload: "/remove-background/upload",
        result: "/remove-background/result",
        referer: "https://photoaid.com/en/tools/remove-background"
    }
};

const photoaid = {
    getToken: async function () {
        const response = await axios.post(
            "https://photoaid.com/en/tools/api/tools/token",
            {},
            { headers: { ...headers, referer: "https://photoaid.com" } }
        );
        return response.data.token;
    },

    request: async function (imageInput, type) {
        try {
            const token = await this.getToken();
            const base64Image = await this.input2Base64(imageInput);
            const upRes = await this.upload(
                token,
                base64Image,
                endpoints[type]
            );
            return await this.result(token, upRes.request_id, endpoints[type]);
        } catch (error) {
            console.error(error);
        }
    },

    input2Base64: async function (imageInput) {
        if (typeof imageInput === "string" && imageInput.startsWith("http")) {
            return await convert2Base64(imageInput);
        } else if (Buffer.isBuffer(imageInput)) {
            return imageInput.toString("base64");
        } else if (
            typeof imageInput === "string" &&
            fs.existsSync(imageInput)
        ) {
            return fs.readFileSync(imageInput).toString("base64");
        } else if (typeof imageInput === "string") {
            return imageInput;
        } else {
            throw new Error(
                "Tipe input tidak valid! Harap upload image menggunakan link image, buffer, atau path file yak .."
            );
        }
    },

    upload: async function (token, base64Image, endpoint) {
        const response = await axios.post(
            "https://photoaid.com/en/tools/api/tools/upload",
            { base64: base64Image, token, reqURL: endpoint.upload },
            {
                headers: {
                    ...headers,
                    referer: endpoint.referer,
                    "content-type": "text/plain;charset=UTF-8",
                    cookie: `uuidtoken2=${token}`
                }
            }
        );
        return response.data;
    },

    result: async function (token, requestId, endpoint) {
        let final_result;
        do {
            final_result = await axios.post(
                "https://photoaid.com/en/tools/api/tools/result",
                { request_id: requestId, reqURL: endpoint.result },
                {
                    headers: {
                        ...headers,
                        referer: endpoint.referer,
                        "content-type": "text/plain;charset=UTF-8",
                        cookie: `uuidtoken2=${token}`
                    }
                }
            );
            if (final_result.data.statusAPI === "processing") {
                console.log("Processing your request.. ");
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        } while (final_result.data.statusAPI === "processing");
        return final_result.data;
    }
};

module.exports = photoaid;
