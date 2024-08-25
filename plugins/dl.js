const config = require("../config");
const fg = require("api-dylux");
const { cmd, commands } = require("../command");
const {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson
} = require("../lib/functions");
const cheerio = require("cheerio");
const axios = require("axios");
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
const vm = require("vm");
const { mediafireDl } = require("mfiredlcore-vihangayt");
const { Download } = require("nima-threads-dl-api");
const { Tiktok } = require("../lib/tiktok");
var { subsearch, subdl } = require("@sl-code-lords/si-subdl");

cmd(
    {
        pattern: "fmmods",
        alias: ["wamod", "wamods", "fmmod"],
        react: "📲",
        desc: "Download all fmmods.",
        category: "download",
        use: ".fmmods",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            prefix,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            let response = (
                await fetchJson("https://vihangayt.me/download/fmmods")
            ).data;
            var buttons = [
                {
                    buttonId:
                        prefix +
                        "dmod " +
                        response.com_whatsapp.link +
                        "+" +
                        response.com_whatsapp.name,
                    buttonText: { displayText: response.com_whatsapp.name },
                    type: 1
                },
                {
                    buttonId:
                        prefix +
                        "dmod " +
                        response.com_fmwhatsapp.link +
                        "+" +
                        response.com_fmwhatsapp.name,
                    buttonText: { displayText: response.com_fmwhatsapp.name },
                    type: 1
                },
                {
                    buttonId:
                        prefix +
                        "dmod " +
                        response.com_gbwhatsapp.link +
                        "+" +
                        response.com_gbwhatsapp.name,
                    buttonText: { displayText: response.com_gbwhatsapp.name },
                    type: 1
                },
                {
                    buttonId:
                        prefix +
                        "dmod " +
                        response.com_yowhatsapp.link +
                        "+" +
                        response.com_yowhatsapp.name,
                    buttonText: { displayText: response.com_yowhatsapp.name },
                    type: 1
                }
            ];

            const buttonMessage = {
                caption: `「 ${config.BOT} 」
      
*Foud Whatsapp Mod Downloader 📲*
`,
                footer: config.FOOTER,
                buttons: buttons,
                headerType: 1
            };
            return await conn.buttonMessage(from, buttonMessage, mek);
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "dmod",
        dontAddCommandList: true,
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            await conn.sendMessage(from, {
                react: { text: "📥", key: mek.key }
            });
            let [modlink, modname] = q.split`+`;
            await conn.sendMessage(
                from,
                {
                    document: { url: modlink },
                    fileName: modname + ".apk",
                    mimetype: "application/vnd.android.package-archive"
                },
                { quoted: mek }
            );
            await conn.sendMessage(from, {
                react: { text: "✔", key: mek.key }
            });
        } catch (e) {
            m.sendError(e);
        }
    }
);

async function fbDownloader(url) {
    try {
        const response1 = await axios({
            method: "POST",
            url: "https://snapsave.app/action.php?lang=vn",
            headers: {
                accept: "*/*",
                "accept-language": "vi,en-US;q=0.9,en;q=0.8",
                "content-type": "multipart/form-data",
                "sec-ch-ua":
                    '"Chromium";v="110", "Not A(Brand";v="24", "Microsoft Edge";v="110"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                Referer: "https://snapsave.app/vn",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            data: {
                url
            }
        });

        let html;
        const evalCode = response1.data.replace(
            "return decodeURIComponent",
            "html = decodeURIComponent"
        );
        eval(evalCode);
        html = html
            .split('innerHTML = "')[1]
            .split('";\n')[0]
            .replace(/\\"/g, '"');

        const $ = cheerio.load(html);
        const download = [];

        const tbody = $("table").find("tbody");
        const trs = tbody.find("tr");

        trs.each(function (i, elem) {
            const trElement = $(elem);
            const tds = trElement.children();
            const quality = $(tds[0]).text().trim();
            const url = $(tds[2]).children("a").attr("href");
            if (url != undefined) {
                download.push({
                    quality,
                    url
                });
            }
        });

        return {
            success: true,
            download
        };
    } catch (err) {
        return {
            success: false
        };
    }
}
function fbreg(url) {
    const fbRegex =
        /(?:https?:\/\/)?(?:www\.)?(m\.facebook|facebook|fb)\.(com|me|watch)\/(?:(?:\w\.)*#!\/)?(?:groups\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/;
    return fbRegex.test(url);
}

var desc = "";
if (config.LANG === "SI") desc = "Facebook වෙතින් වීඩියෝ බාගත කරයි.";
else desc = "Download videos from Facebook.";

var N_FOUND = "";
if (config.LANG === "SI") N_FOUND = "*මට කිසිවක් සොයාගත නොහැකි විය :(*";
else N_FOUND = "*I couldn't find anything :(*";

var urlneed = "";
if (config.LANG === "SI")
    urlneed = "*කරුණාකර facebook video url එකක් ලබා දෙන්න*";
else urlneed = "*Please give me facebook video url..*";

cmd(
    {
        pattern: "fb",
        react: "#️⃣",
        alias: ["fbdl"],
        desc: desc,
        category: "download",
        use: ".fb <Fb video link>",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            prefix,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            if (!fbreg(q)) return await reply(urlneed);
            let data = await fbDownloader(q);
            let l = data.download;
            let dat = `「 ${config.BOT} 」

   *𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗗𝗘𝗥*

*📎 Url:* ${q}`;
            if (!l[0]) return await reply(N_FOUND);
            var buttons;
            if (!l[1]) {
                var buttons = [
                    {
                        buttonId: prefix + "dvideo " + l[0].url,
                        buttonText: { displayText: l[0].quality + " VIDEO" },
                        type: 1
                    }
                ];
            } else {
                var buttons = [
                    {
                        buttonId: prefix + "dvideo " + l[0].url,
                        buttonText: { displayText: l[0].quality + " VIDEO" },
                        type: 1
                    },
                    {
                        buttonId: prefix + "dvideo " + l[1].url,
                        buttonText: { displayText: l[1].quality + " VIDEO" },
                        type: 1
                    }
                ];
            }
            const buttonMessage = {
                image: {
                    url: "https://media.idownloadblog.com/wp-content/uploads/2022/04/Download-Facebook-data.jpg"
                },
                caption: dat,
                footer: config.FOOTER,
                buttons: buttons,
                headerType: 4
            };
            return await conn.buttonMessage(from, buttonMessage, mek);
        } catch (e) {
            m.sendError(e, N_FOUND);
        }
    }
);

cmd(
    {
        pattern: "dvideo",
        dontAddCommandList: true,
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            await conn.sendMessage(from, {
                react: { text: "📥", key: mek.key }
            });
            await conn.sendMessage(
                from,
                { video: { url: q }, caption: config.FOOTER },
                { quoted: mek }
            );
            await conn.sendMessage(from, {
                react: { text: "✔", key: mek.key }
            });
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "gdrive",
        alias: ["googledrive'"],
        react: "📑",
        desc: "Download googledrive files.",
        category: "download",
        use: ".gdrive <googledrive link>",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            if (!q) return await reply("*Please give me googledrive url !!*");
            let res = await fg.GDriveDl(q);
            reply(`*📃 File name:*  ${res.fileName}
*💈 File Size:* ${res.fileSize}
*🕹️ File type:* ${res.mimetype}`);
            conn.sendMessage(
                from,
                {
                    document: { url: res.downloadUrl },
                    fileName: res.fileName,
                    mimetype: res.mimetype
                },
                { quoted: mek }
            );
        } catch (e) {
            m.sendError(e);
        }
    }
);

async function Insta(match) {
    const result = [];
    const form = {
        url: match,
        submit: ""
    };
    const { data } = await axios(`https://downloadgram.org/`, {
        method: "POST",
        data: form
    });
    const $ = cheerio.load(data);
    $("#downloadhere > a").each(function (a, b) {
        const url = $(b).attr("href");
        if (url) result.push(url);
    });
    return result;
}

var needus = "";
if (config.LANG === "SI") needus = "*කරුණාකර මට Instagram url එකක් දෙන්න !!*";
else needus = "*Please give me Instagram url !!*";
var cantf = "";
if (config.LANG === "SI") cantf = "*මට මෙම වීඩියෝව සොයාගත නොහැක!*";
else cantf = "*I cant find this video!*";
cmd(
    {
        pattern: "ig",
        alias: ["igstory"],
        react: "🎀",
        desc: "Download instagram videos/photos.",
        category: "download",
        use: ".ig <Instagram link>",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            if (!q) return await reply(needus);
            let response = await fetchJson(
                "https://vihangayt.me/download/instagram?url=" + q
            );
            for (let i = 0; i < response.data.data.length; i++) {
                if (response.data.data[i].type === "image")
                    await conn.sendMessage(
                        from,
                        {
                            image: { url: response.data.data[i].url },
                            caption: config.FOOTER
                        },
                        { quoted: mek }
                    );
                else
                    await conn.sendMessage(
                        from,
                        {
                            video: { url: response.data.data[i].url },
                            caption: config.FOOTER
                        },
                        { quoted: mek }
                    );
            }
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "mediafire",
        alias: ["mfire"],
        react: "📁",
        desc: "Download mediafire files.",
        category: "download",
        use: ".mediafire <mediafire link>",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            if (!q) return await reply("*Please give a url*");
            if (!q.includes("mediafire.com"))
                return await reply("*Please give me mediafire url*");
            if (!q.includes("/file"))
                return await reply("*Please give me valid mediafire file url*");
            const baby1 = await mediafireDl(q);
            if (
                baby1.size.includes("MB") &&
                baby1.size.replace("MB", "") > config.MAX_SIZE
            )
                return await reply("*This file is too big !!*");
            if (baby1.size.includes("GB"))
                return await reply("*This file is too big !!*");
            const mfile = conn.sendMessage(
                from,
                {
                    document: { url: baby1.link },
                    fileName: baby1.name,
                    mimetype: baby1.mime,
                    caption: `*📁 Name* : ${baby1.name}
*📊 Size* : ${baby1.size}
*🕹️ Mime* : ${baby1.mime}`
                },
                { quoted: mek }
            );
            await conn.sendMessage(from, {
                react: { text: "📁", key: mfile.key }
            });
        } catch (e) {
            m.sendError(e);
        }
    }
);

var N_FOUND = "";
if (config.LANG === "SI") N_FOUND = "*මට කිසිවක් සොයාගත නොහැකි විය :(*";
else N_FOUND = "*I couldn't find anything :(*";

var urlneed = "";
if (config.LANG === "SI")
    urlneed = "එය androidapksfree වෙතින් mod apps බාගත කරයි.";
else urlneed = "It downloads mod apps from androidapksfree.";

var imgmsg = "";
if (config.LANG === "SI") imgmsg = "```කරුණාකර වචන කිහිපයක් ලියන්න!```";
else imgmsg = "```Please write a few words!```";

cmd(
    {
        pattern: "modapk",
        react: "📱",
        alias: ["androidapksfree", "mod"],
        desc: urlneed,
        category: "download",
        use: ".modapk whatsapp",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            prefix,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            if (!q)
                return await conn.sendMessage(
                    from,
                    { text: imgmsg },
                    { quoted: mek }
                );
            const era = await axios.get(`https://androidapksfree.com/?s=${q}`, {
                withCredentials: true
            });

            var sedarch = [];
            const $gs = cheerio.load(era.data);
            $gs(
                "html > body > div.main-wrap > div.main.wrap.cf > div > div > div > div > div.boxed-content > div.devapk-apps-list > section"
            ).each(function (a, b) {
                const link = $gs(b).find("h1 > a").attr("href");
                const title = $gs(b).find("h1").text();
                const update = $gs(b)
                    .find("div.date-on-tax")
                    .text()
                    .replaceAll("\n", "");
                sedarch.push({ link, title, update });
            });
            const data = sedarch;
            if (data.length < 1)
                return await conn.sendMessage(
                    from,
                    { text: N_FOUND },
                    { quoted: mek }
                );
            var srh = [];
            for (var i = 0; i < data.length; i++) {
                srh.push({
                    title: data[i].title,
                    rowId:
                        prefix + "dapk2 " + data[i].link + "+" + data[i].title
                });
            }
            const sections = [
                {
                    title: "_[Result from androidapksfree.]_",
                    rows: srh
                }
            ];
            const listMessage = {
                text: `「 ${config.BOT} 」

   *MOD APK DOWNLOADER*

*📱 Enterd Name:* ${q}`,
                footer: config.FOOTER,
                title: "Result from androidapksfree. 📲",
                buttonText: "*🔢 Reply below number*",
                sections
            };
            await conn.listMessage(from, listMessage, mek);
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "dapk2",
        dontAddCommandList: true,
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            await conn.sendMessage(from, {
                react: { text: "📥", key: mek.key }
            });
            if (!q)
                return await conn.sendMessage(
                    from,
                    { text: "*Need apk link...*" },
                    { quoted: mek }
                );
            let [link, title] = q.split("+");
            const era = await axios.get(link + `download/`, {
                withCredentials: true
            });
            const $g = cheerio.load(era.data);
            const linkdl = $g(
                "html > body > div.main-wrap > div.main.wrap.cf > div > div > div > div > div.post-container.cf > div > div > div.box > div.boxed-content.boxed-content-mobile > div > div > div.download-button-main.centered-element > a"
            ).attr("href");
            const icon = $g("div.app-icon-new > img").attr("src");
            const size = $g(
                "html > body > div.main-wrap > div.main.wrap.cf > div > div > div > div > div.post-container.cf > div > div > div.box > div.boxed-content.boxed-content-mobile > div > div > div.download-button-main.centered-element > a"
            )
                .text()
                .split("(")[1]
                .replaceAll(")", "");
            let listdata = `*📚 Name :* ${title}
*📥 Size :* ${size}`;
            await conn.sendMessage(
                from,
                { image: { url: icon }, caption: listdata },
                { quoted: mek }
            );
            if (size.includes("GB"))
                return await conn.sendMessage(
                    from,
                    { text: "*File size is too big...*" },
                    { quoted: mek }
                );
            if (
                size.includes("MB") &&
                size.replace(" MB", "") > config.MAX_SIZE
            )
                return await conn.sendMessage(
                    from,
                    { text: "*File size is too big...*" },
                    { quoted: mek }
                );
            let sendapk = await conn.sendMessage(
                from,
                {
                    document: { url: linkdl },
                    mimetype: "application/vnd.android.package-archive",
                    fileName: title + "." + "apk",
                    caption: ""
                },
                { quoted: mek }
            );
            await conn.sendMessage(from, {
                react: { text: "📁", key: sendapk.key }
            });
            await conn.sendMessage(from, {
                react: { text: "✔", key: mek.key }
            });
        } catch (e) {
            m.sendError(e, cantf);
        }
    }
);

var needus = "";
if (config.LANG === "SI") needus = "*කරුණාකර මට threads url එකක් දෙන්න !!*";
else needus = "*Please give me threads url !!*";
var cantf = "";
if (config.LANG === "SI") cantf = "*මට මෙම වීඩියෝව සොයාගත නොහැක!*";
else cantf = "*I cant find this video!*";

cmd(
    {
        pattern: "threads",
        alias: ["thread"],
        react: "🧵",
        desc: "Download threads videos/photos.",
        category: "download",
        use: ".threads <threads link>",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            if (!q) return await reply(needus);
            let response = await Download(q);
            for (let i = 0; i < response.download.length; i++) {
                if (response.download[i].type === "image")
                    await conn.sendMessage(
                        from,
                        {
                            image: { url: response.download[i].url },
                            caption: config.FOOTER
                        },
                        { quoted: mek }
                    );
                else
                    await conn.sendMessage(
                        from,
                        {
                            video: { url: response.download[i].url },
                            caption: config.FOOTER
                        },
                        { quoted: mek }
                    );
            }
        } catch (e) {
            m.sendError(e, cantf);
        }
    }
);

function regtik(url) {
    return url.includes("tiktok.com");
}

var desc = "";
if (config.LANG === "SI") desc = "Tiktok වෙතින් වීඩියෝ බාගත කරයි.";
else desc = "Download videos from Tiktok.";

var N_FOUND = "";
if (config.LANG === "SI") N_FOUND = "*මට කිසිවක් සොයාගත නොහැකි විය :(*";
else N_FOUND = "*I couldn't find anything :(*";

var urlneed = "";
if (config.LANG === "SI") urlneed = "*කරුණාකර Tiktok video url එකක් ලබා දෙන්න*";
else urlneed = "*Please give me tiktok video url..*";

cmd(
    {
        pattern: "tiktok",
        alias: ["ttdl"],
        react: "🏷️",
        desc: desc,
        category: "download",
        use: ".tiktok <Tiktok link>",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            prefix,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            if (!regtik(q)) return await reply(urlneed);
            var l = "";
            let tiktok = await fetchJson(
                "https://api.sdbots.tech/tiktok?url=" + q
            );
            if (tiktok.msg == "OK") {
                let data = tiktok;
                l = {
                    title: data.result.desc,
                    nowm: data.result.withoutWaterMarkVideo,
                    watermark: data.result.waterMarkVideo,
                    audio: data.result.music,
                    thumbnail: data.result.cover,
                    author: data.result.author
                };
            } else {
                let data = await Tiktok(q);
                l = data;
            }

            let dat = `「 ${config.BOT} 」

*TIKTOK DOWNLOADER*

*📃 Title:* ${l.title}
*✍🏼 Author:* ${l.author}`;

            let sections = [
                {
                    title: "",
                    rows: [
                        {
                            title: "1",
                            rowId: `${prefix}dvideo ${l.nowm}`,
                            description: "video without Watermark"
                        },
                        {
                            title: "2",
                            rowId: `${prefix}dvideo ${l.watermark}`,
                            description: "Video with Watermark"
                        },
                        {
                            title: "3",
                            rowId: `${prefix}dau ${l.audio}`,
                            description: "Download audio"
                        }
                    ]
                }
            ];
            const listMessage = {
                image: { url: l.thumbnail },
                caption: dat,
                footer: config.FOOTER,
                buttonText: "🔢 Reply below number,",
                sections,
                contextInfo: {
                    externalAdReply: {
                        title: `「 ${config.BOT} 」`,
                        body: "🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲",
                        mediaType: 1,
                        sourceUrl: global.link,
                        thumbnailUrl: config.LOGO,
                        renderLargerThumbnail: false,
                        showAdAttribution: true
                    }
                }
            };

            await conn.replyList(from, listMessage, { quoted: mek });
        } catch (e) {
            m.sendError(e, N_FOUND);
        }
    }
);

cmd(
    {
        pattern: "dau",
        dontAddCommandList: true,
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            await conn.sendMessage(from, {
                react: { text: "📥", key: mek.key }
            });
            await conn.sendMessage(
                from,
                {
                    document: { url: q },
                    mimetype: "audio/mpeg",
                    fileName: "TikTok Audio" + ".mp3",
                    caption: config.FOOTER
                },
                { quoted: mek }
            );
            await conn.sendMessage(from, {
                react: { text: "✔", key: mek.key }
            });
        } catch (e) {
                        m.sendError(e);
        }
    }
);

var N_FOUND = "";
if (config.LANG === "SI") N_FOUND = "*මට කිසිවක් සොයාගත නොහැකි විය :(*";
else N_FOUND = "*I couldn't find anything :(*";

var urlneed = "";
if (config.LANG === "SI")
    urlneed = "එය Baiscopelk වෙතින් සිංහල උපසිරැසි බාගත කරයි.";
else urlneed = "It downloads sinhala subtitle from Baiscopelk.";

var imgmsg = "";
if (config.LANG === "SI") imgmsg = "```කරුණාකර වචන කිහිපයක් ලියන්න!```";
else imgmsg = "```Please write a few words!```";

cmd(
    {
        pattern: "sub",
        react: "🎞️",
        alias: ["subtitle", "sinhalasub", "sisub", "sinhalasubtitle"],
        desc: urlneed,
        category: "download",
        use: ".sub spiderman",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            prefix,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            if (!q)
                return await conn.sendMessage(
                    from,
                    { text: imgmsg },
                    { quoted: mek }
                );
            const data2 = await subsearch(q);
            const data = data2.results;
            if (data.length < 1)
                return await conn.sendMessage(
                    from,
                    { text: N_FOUND },
                    { quoted: mek }
                );
            var srh = [];
            for (var i = 0; i < data.length; i++) {
                srh.push({
                    description: data[i].title,
                    title: i + 1,
                    rowId: prefix + "dsub " + data[i].link
                });
            }
            const sections = [
                {
                    title: "_[Result from Baiscopelk.com]_",
                    rows: srh
                }
            ];
            const listMessage = {
                text: `「 ${config.BOT} 」

   *SI SUB DOWNLOADER*

*📜 Entered Name:* ${q}`,
                footer: config.FOOTER,
                title: "Result from Baiscopelk.com 📲",
                buttonText: "*🔢 Reply below number*",
                sections
            };
            await conn.replyList(from, listMessage, { quoted: mek });
        } catch (e) {
                        m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "dsub",
        dontAddCommandList: true,
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            await conn.sendMessage(from, {
                react: { text: "📥", key: mek.key }
            });
            if (!q)
                return await conn.sendMessage(
                    from,
                    { text: "*Need sub link...*" },
                    { quoted: mek }
                );
            const dataq = await subdl(q);
            let data = dataq.results;
            let listdata = `*📚 Title :* ${data.title.trim()}
*💼 Creater :* ${data.creater}`;
            await conn.sendMessage(
                from,
                { image: { url: data.img }, caption: listdata },
                { quoted: mek }
            );
            let sendapk = await conn.sendMessage(
                from,
                {
                    document: { url: data.dl_link },
                    mimetype: "application/zip",
                    fileName: data.title.trim() + "." + "zip",
                    caption: ""
                },
                { quoted: mek }
            );
            await conn.sendMessage(from, {
                react: { text: "📁", key: sendapk.key }
            });
            await conn.sendMessage(from, {
                react: { text: "✔", key: mek.key }
            });
        } catch (e) {
                        m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "slsub",
        react: "📃",
        alias: ["srisub"],
        desc: "Search Sinhala Subtitles  from Web Site",
        category: "download",
        use: ".slsub",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isCreator,
            isDev,
            isAdmins,
            reply
        }
    ) => {
        try {
            if (!q)
                return reply(
                    "❗ *Please enter movie name to download Subtitles*"
                );
            const duka = await subsearch(q);
            const latest = await subdl(duka.results[0].link);
            const maru = `*TKM-BOT SINHALA SUB DOWNLOADER*

📊 *Movie Title - ${latest.results.title}*

🔒 Creator - ${latest.results.creater}

🖇️ _Link_ - ${duka.results[0].link}

`;
            await conn.sendMessage(
                from,
                {
                    image: { url: latest.results.img },
                    caption: maru + "\n " + config.FOOTER
                },
                { quoted: mek }
            );
            await conn.sendMessage(
                from,
                {
                    document: { url: latest.results.dl_link },
                    caption: latest.results.title,
                    mimetype: "application/zip",
                    fileName: `${latest.results.title}.zip`
                },
                { quoted: mek }
            );
        } catch (e) {
                        m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "slsubsearch",
        react: "🔎",
        desc: "Search All Subtitles  from Web Site",
        category: "search",
        use: ".technewsall",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isCreator,
            isDev,
            isAdmins,
            reply
        }
    ) => {
        try {
            if (!q)
                return reply(
                    "❗ *Please enter movie name to Search Subtitles*"
                );
            const vid = await subsearch(q);
            let yt =
                "\n❍⚯────────────────────⚯❍\n        🌐  *𝚂𝙻 𝚂𝚄𝙱 𝚂𝙴𝙰𝚁𝙲𝙷 𝙻𝙸𝚂𝚃*  🌐\n ⚡ *Qᴜᴇᴇɴ-ɪᴢᴜᴍɪ ꜱʟ ꜱᴜʙᴛɪᴛʟᴇ ꜱᴇᴀʀᴄʜᴇʀ* ⚡\n❍⚯────────────────────⚯❍\n\n\n";
            for (let i of vid.results) {
                yt += `📃 *${i.no} - ${i.title}*\n🔗 _Link : ${i.link}_ \n\n\n`;
            }
            await conn.sendMessage(
                from,
                {
                    image: {
                        url: "https://telegra.ph/file/ba8ea739e63bf28c30b37.jpg"
                    },
                    caption:
                        yt +
                        "*Qᴜᴇᴇɴ-ɪᴢᴜᴍɪ-ᴍᴅ ᴡʜᴀᴛꜱᴀᴘᴘ ᴜꜱᴇʀ ʙᴏᴛ*\n*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴇᴄʜɴɪᴄᴀʟ ᴄʏʙᴇʀꜱ*"
                },
                { quoted: mek }
            );
        } catch (e) {
                        m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "subdlfromlink",
        react: "📃",
        desc: "Download subtitles from Web Sites",
        category: "download",
        use: ".subdlfromlink",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isCreator,
            isDev,
            isAdmins,
            reply
        }
    ) => {
        try {
            if (!q)
                return reply(
                    "❗ Please enter movie Link to download Subtitles*"
                );
            if (!q.includes("baiscope"))
                return reply("🚫 *Please enter Valid Movie url*");
            const latest = await subdl(q);
            const maru = `*QUEEN-IZUMI-MD SL SUBTITLES DOWNLOADER*

📊 *Movie title - ${latest.results.title}*

🔒 Creator - ${latest.results.creater}

🖇️ _Link_ - ${q}

*Qᴜᴇᴇɴ-ɪᴢᴜᴍɪ-ᴍᴅ*
*ᴀʟʟ ʀɪɢʜᴛ ʀᴇꜱᴇʀᴠᴇᴅ - ʙʏ ᴠᴀᴊɪʀᴀ & ᴛᴀᴍɪꜱʜᴀ*`;
            await conn.sendMessage(from, { text: maru }, { quoted: mek });
            await conn.sendMessage(
                from,
                {
                    document: { url: latest.results.dl_link },
                    caption: latest.results.title,
                    mimetype: "application/zip",
                    fileName: `${latest.results.title}.zip`
                },
                { quoted: mek }
            );
        } catch (e) {
            m.sendError(e);
        }
    }
);
