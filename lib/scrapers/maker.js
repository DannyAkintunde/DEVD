const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");

class CustomFormData extends FormData {
    constructor() {
        super();
        this.fields = {}; // Store entries manually
        this.possibleValues = {}; // Store possible values for radio/checkbox fields
    }

    append(key, value, options) {
        if (!this.fields[key]) {
            this.fields[key] = [];
        }
        this.fields[key].push(value);
        super.append(key, value, options);
    }

    remove(key) {
        if (this.fields[key]) {
            delete this.fields[key];
        }
        const temp = new FormData();
        for (const field in this.fields) {
            for (const val of this.fields[field]) {
                temp.append(field, val);
            }
        }
        Object.assign(this, temp);
    }

    replace(key, value, options) {
        this.remove(key);
        this.fields[key] = [value];
        super.append(key, value, options);
    }
}

function deepMerge(obj1, obj2) {
    let result = {};

    for (let key in obj1) {
        if (obj2.hasOwnProperty(key)) {
            if (
                typeof obj1[key] === "object" &&
                typeof obj2[key] === "object"
            ) {
                result[key] = deepMerge(obj1[key], obj2[key]);
            } else {
                result[key] = obj2[key];
            }
        } else {
            result[key] = obj1[key];
        }
    }

    for (let key in obj2) {
        if (!obj1.hasOwnProperty(key)) {
            result[key] = obj2[key];
        }
    }

    return result;
}

class Maker {
    static uploadRoute = "/upload";
    static createRoute = "/effect/create-image";

    constructor(grecaptcharesponse) {
        const defualtgrecaptcharesponse =
            "03AFcWeA7xNxnFWGBXb9cWBEmG_LmcyApQweWDDY4cYfleMi6tRYJVShugeaw_wMRoc9IGX1zsBBd4t0ZkXqxJaHbcJSn9MJ2qWVrQbAJiyUbscGf9Gr_okUDMKZHLK8baiVXD9B596stL8VDc8oQ0TjRQXXhUvJnYHB4e8Sx2sqtd07eE2VPP96pzGT_-Iu758tFuG4l5-qE8kMu9B1kg4chUHjQ_KTw-43HnF6KAvy7pM3l8aVXbHOIvzkuYT7NntFHiZajKGFlNBWbl-uf_WgYw9qACqqNtPrBkulWXfxe3puzfbCRHzQxUpyrPw8er5YEElLMsDj_kcH20nPEx-FlaDAWzK7MnKZ1ZFgGc9deavVGQErlc6mlCBHfW9dyWf8v32weTC0WOpzJP0NeATMV4Ub2hwi3t7vtSlK_OYY2a04QhbFG4SMyJVZnppBTgUuK1pmRMxEwnQUJVa_MkBhiAjDCoZQVQvhgCtMsjnBJKmetOWO7VzhHE7JM9Gs70zEVZpm05tKsBhfJXaLffNRiBN3efk3FXxq3PZkJ_YtWkNiRB-EzaMWoFEbAzN1SURAgjIQ_1oj8lOpMdQ1jsoQ8ThOQANc60KG30tVlrXqRSq-jjd5AblxVmA3nN__LSEc3NfbsGeSGeKXa2Nbn8Cwb7McHnI4TNqjUqSHeMNtEgafjuAGH9CsnsGcmJP776PZ92JzCx8Pas7t7VXc1DhdVyGP7SENntNTF0F1g29ZRniEZMjj3OKCYpYywfu7VaRdltieXqZD8YoBlnmOrvTV9fxaW-a0pkeUsbbsbJul5D68iahZ7h8MFbMRjQj6CmLMUYLVxyYpmOjGvuQxShxBQ9GXF6lWiCXl9u2NPiPOBW-H6Kgrq-t_P-k9IYFDX3Db8mPgqUd3RHhpSTI6ArfdldYBT8u6UsAcYSQMXEodPI8NqA0Z4jBZxXcplqSwcA0oANAMzdmaJ2zEE1BB_HiYaFKEBmGDALUpdS0jFY2tWgbAjFI9oGfwUaw7pQxEOv_3JPxJXaqwcFlMJdic2cUCKmjt-BV-bOa-mEYVLKeKaUGsrY569aS16IU8aLM4v9ZmaKmxxu9RtyHKlW-RE_0ub7ntkANXRyhM6ZmuDpljDQ6fgqa0ey3CQoAvuAc6SW908sNpgFq4vYAzUz4UNwyR6-kjyIM-zEjyCij8B-WIvYjTSjWWY_vDwt1yVjCpyr5iTR12UP9LRFGyU1Ka2qP6CJHSMc9H7r5eyhAL8Yb1YfasJWmMGAA6ULSmMy3XEbA8to7cne-cjVXGQljmrmYeUemUhoYiCeIX0_0bXt2IdZuQT8ElwTAZ5d6fvNxQaosouxiBT9eGwyd9y73hjukmnLrB6s-J0Wn3_TMHttDarqpnsa6QLhPU9hXFsuHaFtO9sbRTal4eAQD9s8aeZe2oCDR1pl55PSE9yaZiKMP5WjuN7eH7GyrZedzrW5ORpqrJHFQBnT5ancNlJm_EQ5lfzgbDtOsJX4sXj4-KeZzgL0JZxTQwWreMHLXlVBsmPrq6Goq2PNPUwJpQ5xP9z0wxJF7r4B1ojkID6-cQqoKQoWg7_1nU7ttgnAWRS1SezWi4qUw2Maw0OVuK8xu8Wla-sH2hI_mCk_grAXdkVOBrg45pxOeIQbg7uBBQ91KWQkAgR9D3vRbi2mKFon4kIgUUoikoCnTR8e-icEcZXtYhjgxxyoZMxOu4VQje6-w9dnYzEG8_gabDsZpVcUB4Tj0taCY5kFv5OMRkCNE_3sO4Ku2Z-O7ORfU8Fo8DF0Xhq4UXESEX9ubzePCu8x0qcVvb6VKgZ5zs4jQFEEHax3nUmY2ifJrGzVX_Xt_wBa_ScAby8oN98qyUFle3zXIfz0Tr7kiQPizlCbyUjkJUEdKv6JA34aT-vxCApZIH-hgIW2PK6mxK4bK6lW";
        this.grecaptcharesponse =
            grecaptcharesponse || defualtgrecaptcharesponse;
    }
    async request(data) {
        const request = deepMerge(data, {
            headers: {
                ...(this.cookie ? { Cookie: this.cookie } : {}),
                "User-Agent": "Reqable/2.28.0"
            }
        });
        const response = await axios(request);
        const cookies = response.headers["set-cookie"];
        if (Array.isArray(cookies)) {
            this.cookie = cookies
                .map(cookie => {
                    return cookie.split("; ")[0];
                })
                .join("; ");
        }
        return response;
    }
    async getForm(url) {
        try {
            const formResponse = await this.request({
                method: "get",
                url: url
            });
            const formHTML = formResponse.data;

            const $ = cheerio.load(formHTML);
            const form = $("form[method='post']");

            if (!form.length) {
                console.error("Form not found!");
                return;
            }

            const action = form.attr("action");
            const method = form.attr("method") || "GET";
            const formData = new CustomFormData();

            form.find("input, select, textarea").each((_, element) => {
                const type = $(element).attr("type");
                const name = $(element).attr("name");
                const value = $(element).attr("value") || "";

                if (name) {
                    if (type === "radio" || type === "checkbox") {
                        if (!formData.possibleValues[name]) {
                            formData.possibleValues[name] = [];
                        }
                        formData.possibleValues[name].push(value);

                        if ($(element).is(":checked")) {
                            formData.append(name, value);
                        }
                    } else {
                        formData.append(name, value);
                    }
                }
            });

            return { form: formData, method, action };
        } catch (error) {
            console.error("Error fetching form data:", error.message);
        }
    }
    async uploadImage(api, imagePath) {
        const imageStream = fs.createReadStream(imagePath);
        const form = new FormData();
        form.append("file", imageStream);

        try {
            const response = await this.request({
                method: "post",
                url: api,
                data: form,
                headers: form.getHeaders()
            });
            const data = response.data;
            if (!data.success) throw new Error("Unable to upload image");
            return data;
        } catch (error) {
            throw new Error(`Image upload failed: ${error.message}`);
        }
    }
    async fillForm(form, values) {
        // Step 3: Fill form
        const buildServer = form.fields?.build_server[0];
        Maker.uploadRoute = "/upload";
        if (!buildServer) throw new Error("build_server not found in form");

        // Destructure specific fields
        const { "text[]": text, "image[]": image, ...rest } = form.fields;

        // Extract radio fields dynamically into an object
        const radios = Object.keys(rest)
            .filter(key => key.startsWith("radio") && key.endsWith("[radio]"))
            .reduce((acc, key) => {
                acc[key] = rest[key];
                return acc;
            }, {});

        console.log({ text, image, radios });

        // Replace text[] field values
        if (text !== undefined) {
            if (values.text === undefined)
                throw new Error("Text is a required field");
            if (Array.isArray(text)) {
                if (text.length !== values.text.length)
                    throw new Error(
                        `Invalid text input amount expected ${text.length} but was provided with ${values.text.length}`
                    );
                form.replace("text[]", values.text[0]);
                //form.replace("text[]", values.text[0]);
                let i = 1;
                text.slice(i).forEach((text, index) => {
                    form.append("text[]", values.text[index + 1]);
                });
            }
        }

        // Replace radioN[radio] fields
        if (radios !== undefined && values.radio) {
            let i = 0;
            const radioAmount = Object.keys(radios).length;
            if (radioAmount !== values.radio.length)
                throw new Error(
                    `Invalid radio input amount expected ${radioAmount} but was provided with ${values.radio.length}`
                );
            for (const field in radios) {
                const value = form.possibleValues[field][values.radio[i]];
                if (value === undefined)
                    throw new Error(
                        `Radio value at index ${i++} is out of bounds. Index shoud be in range of 0-${
                            form.possibleValues[field].length - 1
                        }`
                    );
                form.replace(field, value);
            }
        }

        // Upload and replace image[] field values
        if (image !== undefined) {
            if (values.image === undefined)
                throw new Error("Image is a required field");
            try {
                if (Array.isArray(image)) {
                    if (image.length !== values.image.length)
                        throw new Error(
                            `Invalid image input amount expected ${image.length} but was provided with ${values.image.length}`
                        );
                    const uploadApi = new URL(Maker.uploadRoute, buildServer)
                        .href;
                    const {
                        uploaded_file: imageFile,
                        thumb_file,
                        icon_file
                    } = await this.uploadImage(uploadApi, values.image[0]);
                    const defaultImgJson = {
                        x: 0,
                        y: 0,
                        width: 500,
                        height: 500,
                        rotate: values.rotate || 0,
                        scaleX: 1,
                        scaleY: 1,
                        thumb_width: 500
                    };
                    const firstImageJson = {
                        image: imageFile,
                        thumb_file,
                        icon_file,
                        ...defaultImgJson
                    };
                    form.replace("image[]", JSON.stringify(firstImageJson));

                    for (let i = 1; i < image.length; i++) {
                        const { uploaded_file, thumb_file, icon_file } =
                            await this.uploadImage(uploadApi, values.image[i]);
                        const imageJson = {
                            image: uploaded_file,
                            thumb_file,
                            icon_file,
                            ...defaultImgJson
                        };
                        form.append("image[]", JSON.stringify(imageJson));
                    }
                }
            } catch (error) {
                console.error("Error uploading images:", error.message);
            }
        }
        return form;
    }
    async summitForm(formData, action, method, url) {
        // step 4: summit the form
        const formActionURL = new URL(action, url).href; // Resolve relative URLs
        const submitResponse = await this.request({
            method: method.toLowerCase(),
            url: formActionURL,
            data: formData,
            headers: formData.getHeaders() // Include form-data headers
        });
        //console.log(submitResponse.data);

        console.log("Form submission response received.");

        // Step 5: Parse the response HTML to extract JSON from #form_value
        const responseHTML = submitResponse.data;
        const $$ = cheerio.load(responseHTML);

        let jsonText = $$("#form_value").first().text();
        jsonText = jsonText || $$("#form_value_input").attr("value");
        console.log(jsonText);
        if (!jsonText.trim()) {
            console.error("No JSON data found in #form_value.");
            return;
        }

        let parsedData;
        try {
            parsedData = JSON.parse(jsonText);
            console.log("Parsed JSON:", parsedData);

            return parsedData;
        } catch (error) {
            console.error(
                "Error parsing JSON from #form_value:",
                error.message
            );
            throw error;
        }
    }
    async createEffect(baseUrl, form) {
        // step 6: creat the effect
        const createEndPoint = new URL(Maker.createRoute, baseUrl).href;
        const response = await this.request({
            method: "post",
            url: createEndPoint,
            data: form,
            headers: form.getHeaders() // Include form-data headers
        });
        return response.data;
    }
    async create(url, value, recaptcha = false) {
        const urlObj = new URL(url);
        const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        const form = await this.getForm(url);
        const filledForm = await this.fillForm(form.form, value);
        const {
            id = "",
            sign = "",
            token = ""
        } = await this.summitForm(filledForm, form.action, form.method, url);
        filledForm.append("id", id);
        filledForm.append("sign", sign);
        filledForm.replace("token", token);
        if (recaptcha)
            filledForm.replace("grecaptcharesponse", this.grecaptcharesponse);
        // else filledForm.replace("grecaptcharesponse", "");
        console.log(filledForm.fields);
        const createdEffect = await this.createEffect(baseUrl, filledForm);
        if (!createdEffect.success)
            throw new Error("Error during image creation");
        const buildServer = filledForm.fields.build_server;
        return {
            build_server: buildServer[0],
            ...createdEffect,
            directURL:
                createdEffect.image && buildServer[0]
                    ? new URL(createdEffect.image, buildServer[0]).href
                    : ""
        };
    }
    textpro(htmlURL, value, re) {
        const textProRegrex =
            /(http(s)?:\/\/)?textpro\.me\/.+((\.html)(#.+)?)$/;
        if (!textProRegrex.test(htmlURL))
            throw new Error("Invalid textpro url");
        return this.create(htmlURL, value, re);
    }
    photooxy(htmlURL, value, re) {
        const photooxyRegrex =
            /(http(s)?:\/\/)?photooxy\.com\/.+((\.html)(#.+)?)$/;
        if (!photooxyRegrex.test(htmlURL))
            throw new Error("Invalid photooxy url");
        return this.create(htmlURL, value, re);
    }
    ephoto360(htmlURL, value, re) {
        const ephoto360Regrex =
            /(http(s)?:\/\/)?en\.ephoto360\.com\/.+((\.html)(#.+)?)$/;
        if (!ephoto360Regrex.test(htmlURL))
            throw new Error("Invalid ephoto360 url");
        return this.create(htmlURL, value, re);
    }
}

module.exports = { Maker };
