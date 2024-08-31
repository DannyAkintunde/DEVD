const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mimes = require("mime-types");
const { fileTypeFromBuffer, fromBuffer } = require("file-type");
const { img2url } = require("@blackamda/telegram-image-url");

const getBuffer = async (url, options) => {
    try {
        options ? options : {};
        var res = await axios({
            method: "get",
            url,
            headers: {
                DNT: 1,
                "Upgrade-Insecure-Request": 1
            },
            ...options,
            responseType: "arraybuffer"
        });
        return res.data;
    } catch (e) {
        console.log(e);
    }
};

const getGroupAdmins = participants => {
    var admins = [];
    for (let i of participants) {
        i.admin !== null ? admins.push(i.id) : "";
    }
    return admins;
};

const getRandom = ext => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};

const h2k = eco => {
    var lyrik = ["", "K", "M", "B", "T", "P", "E"];
    var ma = (Math.log10(Math.abs(eco)) / 3) | 0;
    if (ma == 0) return eco;
    var ppo = lyrik[ma];
    var scale = Math.pow(10, ma * 3);
    var scaled = eco / scale;
    var formatt = scaled.toFixed(1);
    if (/\.0$/.test(formatt)) formatt = formatt.substr(0, formatt.length - 2);
    return formatt + ppo;
};

const isUrl = url => {
    return url.match(
        new RegExp(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/,
            "gi"
        )
    );
};

const Json = string => {
    return JSON.stringify(string, null, 2);
};

const runtime = seconds => {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
};

const sleep = async ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const fetchJson = async (url, options) => {
    try {
        options ? options : {};
        const res = await axios({
            method: "GET",
            url: url,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
            },
            ...options
        });
        return res.data;
    } catch (err) {
        return err;
    }
};

async function getsize(fx) {
    function formatBytes(x) {
        let units = ["B", "KB", "MB", "GB", "TB"];
        let bytes = x;
        let i;

        for (i = 0; bytes >= 1024 && i < 4; i++) {
            bytes /= 1024;
        }

        return bytes.toFixed(2) + " " + units[i];
    }
    return formatBytes((await axios.head(fx)).headers["content-length"]);
}

function formatBytes(x) {
    let units = ["B", "KB", "MB", "GB", "TB"];
    let bytes = x;
    let i;

    for (i = 0; bytes >= 1024 && i < 4; i++) {
        bytes /= 1024;
    }

    return bytes.toFixed(2) + " " + units[i];
}

async function formatSize(bytes, si = true, dp = 2) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return `${bytes} B`;
    }

    const units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
    );

    return `${bytes.toFixed(dp)} ${units[u]}`;
}

async function getFile(url) {
    try {
        const fileType = require("file-type");
        const response = await getBuffer(url);
        let type = await fileType.fromBuffer(response);
        let savepath = "./" + getRandom("." + type.ext);
        await fs.promises.writeFile(savepath, response);
        return savepath;
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}
async function fetchBuffer(string, options = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            if (/^https?:\/\//i.test(string)) {
                let data = await axios.get(string, {
                    headers: {
                        ...(!!options.headers ? options.headers : {})
                    },
                    responseType: "arraybuffer",
                    ...options
                });
                let buffer = await data?.data;
                let name = /filename/i.test(
                    data.headers?.get("content-disposition")
                )
                    ? data.headers
                          ?.get("content-disposition")
                          ?.match(/filename=(.*)/)?.[1]
                          ?.replace(/["';]/g, "")
                    : "";
                let mime =
                    mimes.lookup(name) ||
                    data.headers.get("content-type") ||
                    (await fileTypeFromBuffer(buffer))?.mime;
                resolve({
                    data: buffer,
                    size: Buffer.byteLength(buffer),
                    sizeH: formatSize(Buffer.byteLength(buffer)),
                    name,
                    mime,
                    ext: mimes.extension(mime)
                });
            } else if (/^data:.*?\/.*?;base64,/i.test(string)) {
                let data = Buffer.from(string.split`,`[1], "base64");
                let size = Buffer.byteLength(data);
                resolve({
                    data,
                    size,
                    sizeH: formatSize(size),
                    ...((await fileTypeFromBuffer(data)) || {
                        mime: "application/octet-stream",
                        ext: ".bin"
                    })
                });
            } else if (fs.existsSync(string) && fs.statSync(string).isFile()) {
                let data = fs.readFileSync(string);
                let size = Buffer.byteLength(data);
                resolve({
                    data,
                    size,
                    sizeH: formatSize(size),
                    ...((await fileTypeFromBuffer(data)) || {
                        mime: "application/octet-stream",
                        ext: ".bin"
                    })
                });
            } else if (Buffer.isBuffer(string)) {
                let size = Buffer?.byteLength(string) || 0;
                resolve({
                    data: string,
                    size,
                    sizeH: formatSize(size),
                    ...((await fileTypeFromBuffer(string)) || {
                        mime: "application/octet-stream",
                        ext: ".bin"
                    })
                });
            } else if (/^[a-zA-Z0-9+/]={0,2}$/i.test(string)) {
                let data = Buffer.from(string, "base64");
                let size = Buffer.byteLength(data);
                resolve({
                    data,
                    size,
                    sizeH: formatSize(size),
                    ...((await fileTypeFromBuffer(data)) || {
                        mime: "application/octet-stream",
                        ext: ".bin"
                    })
                });
            } else {
                let buffer = Buffer.alloc(20);
                let size = Buffer.byteLength(buffer);
                resolve({
                    data: buffer,
                    size,
                    sizeH: formatSize(size),
                    ...((await fileTypeFromBuffer(buffer)) || {
                        mime: "application/octet-stream",
                        ext: ".bin"
                    })
                });
            }
        } catch (e) {
            reject(new Error(e?.message || e));
        }
    });
}

/**
@credit Tio
@ai chatgpt free
**/

const IP = () => {
    const octet = () => Math.floor(Math.random() * 256);
    return `${octet()}.${octet()}.${octet()}.${octet()}`;
};

async function gpt4(text) {
    try {
        const { data: res } = await axios.post(
            "https://chatgpt4online.org/wp-json/mwai/v1/start_session",
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-forwarded-for": await IP()
                }
            }
        );

        const url =
            "https://chatgpt4online.org/wp-json/mwai-ui/v1/chats/submit";
        const data = {
            botId: "default",
            customId: null,
            session: "N/A",
            messages: [
                {
                    role: "user",
                    content: text
                }
            ],
            newMessage: text,
            stream: false
        };

        const headers = {
            "Content-Type": "application/json",
            "X-WP-Nonce": res.restNonce,
            "x-forwarded-for": await IP()
        };

        const response = await axios.post(url, data, {
            headers: headers
        });

        if (response.status === 200) {
            return {
                creator: "Danny",
                status: 200,
                reply: response.data.reply
            };
        } else {
            console.error("Error:", response.statusText);
            return {
                creator: "Danny",
                status: response.status,
                reply: "server error"
            };
        }
    } catch (error) {
        console.error("Axios Error:", error);
    }
}

const translate = require("translate-google");

async function trans(text, options) {
    try {
        const result = await translate(text, options);
        return result;
    } catch (error) {
        throw error;
    }
}

async function isValidLangCode(langCode) {
    // Get the list of supported languages
    const supportedLanguages = Object.keys(translate.languages);

    // Check if the provided langCode is in the list of supported languages
    return supportedLanguages.includes(langCode);
}

async function text2prompt(text) {
    try {
        if (!text) return { status: false, message: "undefined reading text" };
        return await new Promise(async (resolve, reject) => {
            axios
                .post(
                    "https://api-v1.junia.ai/api/free-tools/generate",
                    JSON.stringify({
                        content: text,
                        op: "op-prompt"
                    })
                )
                .then(res => {
                    let prompt = res.data;
                    if (prompt.length <= 2) reject("failed generating prompt");
                    prompt = prompt.replace(`"`, ``);
                    resolve({
                        status: true,
                        prompt
                    });
                })
                .catch(reject);
        });
    } catch (e) {
        return { status: false, message: e };
    }
}

// text2prompt("sad cat try to find some food").then(console.log).catch(console.log)
// {
//   status: true,
//   prompt: "A forlorn, gray tabby cat with big, teary eyes desperately scavenges for food in a dimly lit alley, rain pouring down, reflecting the shimmering streetlights against the wet pavement. The cat's ribs are visible under its matted fur, conveying a sense of profound hunger and longing. The scene is captured in a realistic style, evoking empathy and compassion for the plight of this abandoned feline"
// }

const randomInt = (start = 0, end = 5) => {
    return Math.floor(start + Math.random() * end);
};

const randChoice = choices => {
    return choices[randomInt(0, choices.length - 1)];
};

function convertTemplateToES6(str, obj) {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return `${obj[key]}`;
    });
}

//async function bufferImg2Url(buff) {
//    await fs.promises.writeFile("./" + type.ext, buff);
//    img2url("./" + type.ext).then(url => {
//        fs.unlinkSync("./" + type.ext);
//    });
//}

async function saveBuffer(arrbuff) {
    const buff = Buffer.from(arrbuff);
    const type = await fromBuffer(buff);
    const extention = type ? type.ext : "png";
    let savepath = path.join(__dirname, getRandom("." + extention));
    await fs.promises.writeFile(savepath, buff);
    return path.resolve(savepath);
}

module.exports = {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
    getsize,
    formatBytes,
    fetchBuffer,
    saveBuffer,
    formatSize,
    getFile,
    gpt4,
    trans,
    text2prompt,
    randomInt,
    randChoice,
    convertTemplateToES6,
    isValidLangCode
};
