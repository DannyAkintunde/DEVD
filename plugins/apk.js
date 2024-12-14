const config = require("../config");
const { cmd, commands } = require("../command");
const apkdl = require("../lib/apkdl");
const cheerio = require("cheerio");
const axios = require("axios");

cmd(
    {
        pattern: "apksearch",
        react: "📱",
        alias: ["findapk"],
        desc: "It downloads apps from playstore.",
        category: "download",
        use: ".apk whatsapp",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        { from, prefix, quoted, args, q, isMe, isOwner, reply }
    ) => {
        try {
            if (!q)
                return await conn.sendMessage(
                    from,
                    { text: "```Please write a few words!```" },
                    { quoted: mek }
                );
            const data2 = await apkdl.search(q);
            const data = data2;
            if (data.length < 1)
                return await conn.sendMessage(
                    from,
                    { text: "*I couldn't find anything :(*" },
                    { quoted: mek }
                );
            var srh = [];
            for (var i = 0; i < data.length; i++) {
                srh.push({
                    description: data[i].name,
                    title: i + 1,
                    rowId: prefix + "dapk " + data[i].id
                });
            }
            const sections = [
                {
                    title: "_[Result from playstore.]_",
                    rows: srh
                }
            ];
            const listMessage = {
                text: `┌───[ {config.BOT} ]

   *APK DOWNLOADER*

*📱 Apk Name:* ${q}`,
                footer: config.FOOTER,
                title: "Result from playstore. 📲",
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
        pattern: "dapk",
        dontAddCommandList: true,
        filename: __filename
    },
    async (conn, mek, m, { from, args, q, isMe, isOwner, reply }) => {
        try {
            if (!q)
                return await conn.sendMessage(
                    from,
                    { text: "*Need apk link...*" },
                    { quoted: mek }
                );
            const data = await apkdl.download(q);
            let listdata = `*📚 Name :* ${data.name}        
*📦 Developer :* ${data.package}        
*⬆️ Last update :* ${data.lastup}        
*📥 Size :* ${data.size}
🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲`;
            await conn.sendMessage(
                from,
                { image: { url: data.icon }, caption: listdata },
                { quoted: mek }
            );
            if (
                data.size.includes("GB") &&
                Number(data.size.replace(" GB", "")) * 1000 > config.MAX_SIZE
            )
                return await conn.sendMessage(
                    from,
                    { text: "*File size is too big...*" },
                    { quoted: mek }
                );
            if (
                data.size.includes("MB") &&
                data.size.replace(" MB", "") > config.MAX_SIZE
            )
                return await conn.sendMessage(
                    from,
                    { text: "*File size is too big...*" },
                    { quoted: mek }
                );
            let sendapk = await conn.sendMessage(
                from,
                {
                    document: { url: data.dllink },
                    mimetype: "application/vnd.android.package-archive",
                    fileName: data.name + "." + "apk",
                    caption: ""
                },
                { quoted: mek }
            );
            await conn.sendMessage(from, {
                react: { text: global.reactions.file, key: sendapk.key }
            });
            await conn.sendMessage(from, {
                react: { text: global.reactions.done, key: mek.key }
            });
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "apkinfo",
        dontAddCommandList: true,
        filename: __filename
    },
    async (conn, mek, m, { from, q, reply }) => {
        try {
            m.react(global.reactions.download);
            if (!q) return reply("*Need apk link...*");
            const data = await apkdl.download(q);
            let listdata = `*📚 Name :* ${data.name}
├──────────────────        
*📦 Developer :* ${data.package}
├──────────────────        
*⬆️ Last update :* ${data.lastup}
├──────────────────        
*📥 Size :* ${data.size}
├──────────────────        
🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲`;
            const sendapk = await conn.sendMessage(
                from,
                { image: { url: data.icon }, caption: listdata },
                { quoted: mek }
            );
            await conn.sendMessage(from, {
                react: { text: global.reactions.file, key: sendapk.key }
            });
            m.react(global.reactions.done);
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "apk",
        react: "📥",
        desc: "It downloads apps from playstore.",
        category: "download",
        use: ".apk whatsapp",
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
            let dat = `
────────────────────────        

  𝗧𝗞𝗠-𝗠𝗗 𝗔𝗣𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗗𝗘𝗥
	
├───────────────────────┤`;

            const sections = [
                {
                    title: "",
                    rows: [
                        {
                            title: "1",
                            rowId: prefix + "dapk " + q,
                            description: "ᴅᴏᴡɴʟᴏᴀᴅ ʏᴏᴜʀ ᴀᴘᴋ 📥"
                        },
                        {
                            title: "2",
                            rowId: prefix + "apksearch " + q,
                            description: "ꜱɪᴍɪʟᴇʀ ᴛᴏ ᴛʜᴀᴛ ᴀᴘᴋ 📦"
                        },
                        {
                            title: "3",
                            rowId: prefix + "apkinfo " + q,
                            description: "ᴀᴘᴋ ɪɴꜰᴏᴍᴀᴛɪᴏɴ 📃"
                        }
                    ]
                }
            ];
            const listMessage = {
                text: dat,
                footer: config.FOOTER,
                buttonText: "🔢 Reply below number,",
                sections,
                contextInfo: {
                    externalAdReply: {
                        title: `「 ${config.BOT} 」`,
                        body: "🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲",
                        mediaType: 1,
                        sourceUrl: "",
                        thumbnailUrl: config.LOGO,
                        renderLargerThumbnail: false,
                        showAdAttribution: true
                    }
                }
            };

            return await conn.listMessage(from, listMessage, mek);
        } catch (e) {
            m.sendError(e);
        }
    }
);

// <============ps==============>
cmd(
    {
        pattern: "playstore",
        react: "📱",
        alias: ["ps"],
        desc: "It search apps from playstore.",
        category: "search",
        use: ".ps whatsapp",
        filename: __filename
    },
    async (conn, mek, m, { from, q, prefix, command, reply }) => {
        let text = q;
        if (m.quoted) {
            text = m.quoted.body;
            text = text
                .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                .trim();
        }
        if (!text) return reply("```Please write a few words!```");
        apkdl
            .playStore(text)
            .then(data => {
                let sections = {
                    title: "_[Result from playstore.]_",
                    rows: []
                };
                data.forEach(app => {
                    let row = {
                        description: `${app.name}:${app.rate2}/5⭐`,
                        rowId: `${prefix}psainfo ${JSON.stringify(app)}`
                    };
                    sections.rows.push(row);
                });
                const listMessage = {
                    text: `
   *PLAYYSTORE SEARCH*

*📱 Enterd Name:* ${text}`,
                    footer: config.FOOTER,
                    title: "Result from playstore. 📲",
                    buttonText: "*🔢 Reply below number*",
                    contextInfo: {
                        externalAdReply: {
                            title: `「 ${config.BOT} 」`,
                            body: "🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲",
                            mediaType: 1,
                            sourceUrl: `https://play.google.com/store/search?q=${text}&c=apps`,
                            thumbnailUrl:
                                data[0]?.img ||
                                "https://i.ibb.co/G7CrCwN/404.png",
                            renderLargerThumbnail: false,
                            showAdAttribution: true
                        }
                    },
                    sections
                };
                conn.replyList(from, listMessage, { quoted: mek });
            })
            .catch(e => m.sendError);
    }
);

cmd(
    {
        pattern: "psainfo",
        dontAddCommandList: true,
        filename: __filename
    },
    async (conn, mek, m, { from, q, reply }) => {
        try {
            if (!q) return reply("```Need json data.```");
            const appInfo = JSON.parse(q);
            let caption = `*📚 Name :* ${appInfo.name}
├──────────────────        
*📦 Developer :* ${appInfo.developer}
├──────────────────        
*⭐ Rating :* ${appInfo.rate}
├──────────────────        
*🔗 link :* ${appInfo.link}
├──────────────────        
*👨‍💻 Developer Link:* ${appInfo.link_dev}
├──────────────────        
🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲`;
            m.sendMessage(from, {
                image: { url: appInfo.img },
                caption,
                contextInfo: {
                    externalAdReply: {
                        title: `「 App Info 」`,
                        body: `${appInfo.name}:${appInfo.rate2}`,
                        mediaType: 1,
                        sourceUrl: appInfo.link,
                        thumbnailUrl:
                            appInfo.img || "https://i.ibb.co/G7CrCwN/404.png",
                        renderLargerThumbnail: true,
                        showAdAttribution: true
                    }
                }
            });
        } catch (err) {
            if (err instanceof SyntaxError)
                await m.sendError(e, global.responses.humanSpy);
            else await m.sendError(e);
        }
    }
);
// ==============================

// <============mods=============>
cmd(
    {
        pattern: "modapk",
        react: "📱",
        alias: ["androidapksfree", "mod"],
        desc: "It downloads mod apps from androidapksfree.",
        category: "download",
        use: ".modapk whatsapp",
        filename: __filename
    },
    async (conn, mek, m, { from, prefix, q, reply }) => {
        try {
            if (!q) m.reply("```Please write a few words!```");
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
                return m.reply("*I couldn't find anything :(*");
            var srh = [];
            for (var i = 0; i < data.length; i++) {
                srh.push({
                    title: data[i].title,
                    rowId:
                        prefix + "moddapk " + data[i].link + "+" + data[i].title
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
        pattern: "moddapk",
        dontAddCommandList: true,
        filename: __filename
    },
    async (conn, mek, m, { from, q, reply }) => {
        try {
            m.react(global.reactions.download);
            if (!q) return reply("*Need apk link...*");
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
            if (
                size.includes("GB") &&
                Number(size.replace(" GB", "")) * 1000 > config.MAX_SIZE
            )
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
            m.react(global.reactions.upload);
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
                react: { text: global.reactions.file, key: sendapk.key }
            });
            m.react(global.reactions.done);
        } catch (e) {
            m.sendError(e, "*I cant find this APK!*");
        }
    }
);
//==============================
