const axios = require("axios");
const cheerio = require("cheerio");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const mimes = require("mime-types");
const fileType = require("file-type");
const UserAgent = require("user-agents");
const sharp = require("sharp");

const getBuffer = async (url, options) => {
    try {
        options ? options : {};
        var res = await axios({
            method: "get",
            url,
            headers: {
                DNT: 1,
                "Upgrade-Insecure-Request": 1,
                "User-Agent": new UserAgent().toString()
            },
            ...options,
            responseType: "arraybuffer"
        });
        return res.data;
    } catch (e) {
        console.error(e);
        return e.response;
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
    return `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}${ext}`;
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

/*
 * Checks if the provided string is a valid URL.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function isUrl(url) {
    const pattern = new RegExp(
        "^((https|http)?:\\/\\/)?" + // protocol
            "((([a-z0-9]+([\\-\\.][a-z0-9]+)*\\.)+[a-z]{2,}|localhost|" + // domain name
            "(([0-9]{1,3}\\.){3}[0-9]{1,3}))" + // OR ip (v4) address
            "(\\:[0-9]{1,5})?)" + // optional port
            "(\\/.*)?$"
    ); // path
    return pattern.test(url);
}

const Json = string => {
    return JSON.stringify(string, null, 2);
};

async function fetchSocialPreview(url) {
    if (!isUrl(url)) throw new Error("Invalid url");
    try {
        const $ = await cheerio.fromURL(url);
        const socialPreview =
            $("meta[property='og:image']").attr("content") ||
            "https://picsum.photos/512/512";
        return socialPreview;
    } catch {
        throw new Error("Error fetching social preview");
    }
}

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
                "User-Agent": new UserAgent().toString()
            },
            ...options
        });
        return res.data;
    } catch (err) {
        console.error(err);
        return err.response;
    }
};

async function getsize(fx) {
    return formatSize((await axios.head(fx)).headers["content-length"]);
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
        const response = await getBuffer(url);
        let type = await fileType.fromBuffer(response);
        let savepath = getFullFilePath(getRandom("." + type.ext));
        await fs.promises.writeFile(savepath, response);
        return savepath;
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}

async function fetchBuffer(string, options = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            if (isUrl(string)) {
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
                    (await fileType.fileTypeFromBuffer(buffer))?.mime;
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
                    ...((await fileType.fileTypeFromBuffer(data)) || {
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
                    ...((await fileType.fileTypeFromBuffer(string)) || {
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
                    ...((await fileType.fileTypeFromBuffer(data)) || {
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
                    ...((await fileType.fileTypeFromBuffer(buffer)) || {
                        mime: "application/octet-stream",
                        ext: ".bin"
                    })
                });
            }
        } catch (e) {
            console.error(e);
            reject(e.response);
        }
    });
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

const randomInt = (start = 0, end = 5) => {
    return Math.floor(start + Math.random() * end);
};

const randChoice = choices => {
    if (!choices) return;
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
    const type = await fileType.fromBuffer(buff);
    const extention = type ? type.ext : "jpg";
    let savepath = path.join(__dirname, getRandom("." + extention));
    await fs.promises.writeFile(savepath, buff);
    return path.resolve(savepath);
}

function convertBufferToJpeg(buff) {
    return new Promise((resolve, reject) => {
        sharp(buff)
            .jpeg()
            .toBuffer()
            .then(outputBuffer => {
                const outputPath = path.join(__dirname, getRandom("." + jpg));
                fs.writeFile(outputPath, outputBuffer, err => {
                    if (err) {
                        console.error("Error saving JPEG image:", err);
                        reject(err);
                    } else {
                        console.log("JPEG image saved successfully!");
                        resolve(path.resolve(outputPath));
                    }
                });
            })
            .catch(err => {
                console.error("Error converting image to JPEG:", err);
                reject(err);
            });
    });
}

// Function to resolve the filename
const getFullFilePath = filename => {
    // If filename is provided, resolve it; otherwise, use 'undefined'
    const resolvedFilename = filename || "undefined";
    return path.resolve(path.join(global.mediaPath, resolvedFilename));
};

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
    fetchBuffer,
    saveBuffer,
    formatSize,
    getFile,
    trans,
    randomInt,
    randChoice,
    convertTemplateToES6,
    isValidLangCode,
    convertBufferToJpeg,
    getFullFilePath,
    fetchSocialPreview
};
