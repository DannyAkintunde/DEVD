const config = require("../config");
const { cmd, commands } = require("../command");
var os = require("os");

var tmsg = "";
if (config.LANG === "SI") tmsg = "එය Bot link ලබා දෙයි.";
else tmsg = "Get bot source code.";

cmd(
    {
        pattern: "sc",
        react: "👨‍💻",
        alias: ["script", "repo"],
        desc: tmsg,
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
                            description: "QUEEN-IZUMI-MD SPEED"
                        }
                    ]
                }
            ];
            const listMessage = {
                caption: `Introducing TKM-BOT: Revolutionizing WhatsApp! 🎉📱

Discover TKM-BOT's extraordinary features: 🌟b

🎵 Download music and videos directly on WhatsApp 🎥

👥 Efficient group management: add/remove members, set permissions, and manage group settings 🚀

🔍 Instant information search: get the latest news, recipes, and answers to your questions 📰🍔❓

📲 Seamless media sharing: share music, videos, and more with ease 🎶📷

*TKM INC*
Channel: https://whatsapp.com/channel/0029VaKjSra9WtC0kuJqvl0g 
Script: *comming soon*

*Devs: 👨‍💻👩‍💻*
- DannyAkintunde • https://github.com/DannyAkintunde
- Cod3Uchiha • https://github.com/Cod3Uchiha

Experience the best with TKM-BOT! ✨`,
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
                        thumbnailUrl: conf.LOGO,
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
