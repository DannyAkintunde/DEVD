const fs = require("fs");
if (fs.existsSync("config.env"))
    require("dotenv").config();
function convertToBool(text, fault = "true") {
    return text === fault ? true : false;
}


module.exports = {
    SESSION_ID: process.env.SESSION_ID || "youre session id",
    POSTGRESQL_URL:
        process.env.POSTGRESQL_URL ||
        process.env.DATABASE_URL ||
        "youre POSTGRESQL url",
    LANG: process.env.BOT_LANG || "EN",
    PREFIX: process.env.PREFIX || ".",
    MODE: process.env.MODE? process.env.MODE.toLowerCase(): "private",
    BOT: process.env.BOT || "TKM-BOT",
    OWNER_NAME: process.env.OWNER_NAME || process.env.OWNER || "",
    OWNER_NUMBER:
        process.env.OWNER_NUMBER || process.env.OWNER_NUM || "2348098309204",
    ANTI_BAD: process.env.ANTI_BAD || "false",
    MAX_SIZE: process.env.MAX_SIZE || 300,
    ONLY_GROUP: process.env.ONLY_GROUP || "false",
    ANTI_LINK: process.env.ANTI_LINK || "false",
    ANTI_BOT: process.env.ANTI_BOT || "false",
    ALIVE: process.env.ALIVE || `default`,
    AUTHOR: process.env.AUTHOR || 'TKM',
    FOOTER: process.env.FOOTER || "𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚃𝙺𝙼-𝙱𝙾𝚃",
    LOGO:
        process.env.LOGO || `https://i.ibb.co/LhJXQYT/IMG-20240809-WA0027.jpg`,
    MENU_MEDIA: process.env.MENU_LINKS || '',
    PORT: parseInt(process.env.PORT) || 8000,
    BUTTON: convertToBool(process.env.BUTTON, fault="false")? false : true,
    PRESENCE: process.env.PRESENCE || 'avaliable',
   // PM_PERMIT: convertToBool(process.env.PM_PERMIT || process.env.PERMIT || true);
};
