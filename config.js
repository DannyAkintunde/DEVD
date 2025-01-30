const fs = require("fs");
const path = require("path");
if (fs.existsSync("config.env")) require("dotenv").config();
function convertToBool(text, fault = "true") {
    return text === fault ? true : false;
}

global.mediaPath = path.join(__dirname, "media", "temp"); // Base directory

module.exports = {
    SESSION_ID: process.env.SESSION_ID || "youre session id",
    // POSTGRESQL_URL:
    //     process.env.POSTGRESQL_URL ||
    //     process.env.DATABASE_URL ||
    //     "youre POSTGRESQL url",
    LANG: process.env.BOT_LANG?.toUpperCase() || "EN",
    PREFIX: process.env.PREFIX || "/",
    MODE: process.env.MODE ? process.env.MODE.toLowerCase() : "private",
    BOT: process.env.BOT || "DEVD-BOT",
    OWNER_NAME: process.env.OWNER_NAME || process.env.OWNER || "",
    OWNER_NUMBER:
        process.env.OWNER_NUMBER || process.env.OWNER_NUM || "2348098309204",
    ANTI_BAD: process.env.ANTI_BAD || "false",
    MAX_SIZE: process.env.MAX_SIZE || 300, // max file download size in magabytes
    ONLY_GROUP: process.env.ONLY_GROUP || "false",
    ANTI_LINK: process.env.ANTI_LINK || "false",
    ANTI_BOT: process.env.ANTI_BOT || "false",
    AUTO_REACT: convertToBool(
        process.env.AUTO_REACT || process.env.REACT,
        "false"
    )
        ? false
        : true,
    ALIVE: process.env.ALIVE || `default`,
    // AUTHOR: process.env.AUTHOR || "TKM",
    FOOTER: process.env.FOOTER || "𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚃𝙺𝙼-𝙱𝙾𝚃",
    LOGO:
        process.env.LOGO || `https://telegra.ph/file/18d25675835c1486fc63e.jpg`,
    MENU_MEDIA: process.env.MENU_LINKS,
    PORT: parseInt(process.env.PORT) || 8000,
    BUTTON: convertToBool(process.env.BUTTON, (fault = "false")) ? false : true,
    PRESENCE: process.env.PRESENCE || "avaliable",
    THEME: process.env.THEME?.toUpperCase() || "DEFAULT",
    TZ: process.env.TZ || process.env.TIME_ZONE || "Etc/GMT",
    LOG: convertToBool(process.env.LOG) ? true : false,
    NSFW: convertToBool(process.env.NSFW) ? true : false,
    // PM_PERMIT: convertToBool(process.env.PM_PERMIT || process.env.PERMIT || true);,
    EFFECTS_CONFIG: process.env.EFFECTS_CONFIG || "",
    PLAYER: process.env.PLAYER || "soundcloud", // values are soundcloud, spotify, applemusic
    RMBG_HOST: process.env.RMBG_HOST,
    RMBG_APIKEY: process.env.RMBG_APIKEY || "fLYByZwbPqdyqkdKK6zcBN9H"
};
