const config = require("../config");
const os = require("os");
const { cmd, commands, categories } = require("../command");
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

cmd(
    {
        pattern: "alive",
        react: "👨‍💻",
        alias: ["online", "test", "bot"],
        desc: "Check bot online or no.",
        category: "main",
        use: ".alive",
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
            var msg = mek;
            if (os.hostname().length == 12) hostname = "replit";
            else if (os.hostname().length == 36) hostname = "heroku";
            else if (os.hostname().length == 8) hostname = "koyeb";
            else hostname = os.hostname();
            let monspace = "```";
            let monspacenew = "`";
            if (config.ALIVE === "default") {
                const sections = [
                    {
                        title: "",
                        rows: [
                            {
                                title: "1",
                                rowId: prefix + "menu",
                                description: "COMMANDS MENU"
                            },
                            {
                                title: "2",
                                rowId: prefix + "ping",
                                description: "CHECK SPEED"
                            }
                        ]
                    }
                ];
                const listMessage = {
                    caption: `${monspace}👋 Hey ${pushname} I'm alive now${monspace}
    
*🚀Version:* ${require("../package.json").version}
*⌛Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
                        2
                    )}MB / ${Math.round(require("os").totalmem / 1024 / 1024)}MB
*🕒Runtime:* ${runtime(process.uptime())}
*📍Platform:* ${hostname}

                    `,
                    image: { url: config.LOGO },
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

                return await conn.replyList(from, listMessage, { quoted: msg });
            } else {
                const sections = [
                    {
                        title: "",
                        rows: [
                            {
                                title: "1",
                                rowId: prefix + "menu",
                                description: "COMMANDS MENU"
                            },
                            {
                                title: "2",
                                rowId: prefix + "ping",
                                description: "CHECK SPEED"
                            }
                        ]
                    }
                ];
                const listMessage = {
                    caption: config.ALIVE,
                    image: { url: config.LOGO },
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

                return await conn.replyList(from, listMessage, { quoted: msg });
            }
        } catch (e) {
            reply("*Error !!*");
            l(e);
        }
    }
);

cmd(
    {
        pattern: "ping",
        react: "📟",
        alias: ["speed"],
        desc: "Check bot's ping",
        category: "main",
        use: ".ping",
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
            var inital = new Date().getTime();
            let ping = await conn.sendMessage(
                from,
                { text: "```Pinging```" },
                { quoted: mek }
            );
            var final = new Date().getTime();
            return await conn.edite(
                ping,
                "*Pong*\n *" + (final - inital) + " ms* "
            );
        } catch (e) {
            reply("*Error !!*");
            l(e);
        }
    }
);

cmd(
    {
        pattern: "menu",
        react: "👨‍💻",
        alias: ["panel", "list", "commands"],
        desc: "Get bot's command list.",
        category: "main",
        use: ".menu",
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
            var msg = mek;
            if (os.hostname().length == 12) hostname = "replit";
            else if (os.hostname().length == 36) hostname = "heroku";
            else if (os.hostname().length == 8) hostname = "koyeb";
            else hostname = os.hostname();
            let monspace = "```";
            let monspacenew = "`";
                const sections = [
                    {
                        title: "Select Menu",
                        rows: [
                        ]
                    }
                ];
                for (let i=0; i < categories.length; i++) {
                    let cat = global.catInfo[categories[i].toUpperCase()];
                    let command = cat?.pattern || categories[i].toLowerCase() + "menu"
                    let row = { title: `${i + 1}`, rowId: `${prefix}${command}`, description: categories[i].charAt(0).toUpperCase() + categories[i].slice(1) + " Commands"}
                    sections[0].rows.push(row)
                }
                const listMessage = {
                    caption: `👋 ❤ Hey ${pushname} I'm alive now
    
*👾 ${config.BOT} commands menu...*
  
 *🚀Version:* ${require("../package.json").version}
 *⌛Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
     2
 )}MB / ${Math.round(require("os").totalmem / 1024 / 1024)}MB
 *🕒Runtime:* ${runtime(process.uptime())}
 *📍Platform:* ${hostname}`,
                    image: { url: config.LOGO },
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

                return await conn.replyList(from, listMessage, { quoted: msg });
        } catch (e) {
            reply("*Error !!*");
            l(e);
        }
    }
);
