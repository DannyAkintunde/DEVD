const config = require("../config");
const { cmd, commands } = require("../command");
var os = require("os");

cmd(
    {
        pattern: "test",
        react: "👨‍💻",
        desc: "to test the bot",
        category: "main",
        use: ".test",
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
                                description: "QUEEN-IZUMI-MD SPEED"
                            }
                        ]
                    }
                ];
                const listMessage = {
                    caption: `test`,
                    image: { url: config.LOGO },
                    footer: config.FOOTER,
                    buttonText: "🔢 Reply below number,",
                    sections,
                    contextInfo: {
                        externalAdReply: {
                            title: `「 ${config.BOT} 」`,
                            body: "🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲ᴘ",
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
                                description: "QUEEN-IZUMI-MD SPEED"
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
                            body: "🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲ᴘ",
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
            m.sendError(e);
        }
    }
);

cmd({ pattern: "ttf" }, async (conn, mek, m, opt) => {
    let x = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    contextInfo: {
                        mentionedJid: [m.sender],
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "0@newsletter",
                            newsletterName: global.responses.by,
                            serverMessageId: 1
                        }
                    },
                    header: {
                        title: "header"
                    },
                    body: {
                        text: "body"
                    },
                    footer: {
                        text: "⿻ fotter ⿻"
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                buttonId: prefix + "menu",
                                buttonText: { displayText: "COMMAND MENU" },
                                type: 1
                            },
                            {
                                name: "single_select",
                                buttonParamsJson: `{ "title": "⿻Kyoja+⿻", "sections": [{ "title": "# !-Choose One Of Them", "highlight_label": "🌏General Commands🗨️", "rows": [{ "header": "ALL COMMAND", "title": "Show All Command", "id": ".allmenu" }, { "header": "Owner", "title": "Displays Owner Number", "id": ".owner" }, { "header": "Bot Info", "title": "Displays Information About Bots", "id": ".botstatus" }] }, { "title": "🦠 SpeCiaL - ComManD ❌", "highlight_label": " #SpeCial ", "rows": [{ "header": "Special - Menu", "title": "displays all special commands", "id": ".spesialmenu" }] }] }`
                            },
                            {
                                name: "cta_url",
                                buttonParamsJson:
                                    '{"display_text":"Saluran WhatsApp","url":"https://whatsapp.com/channel/0029VadBczKI1rcayqzQ2n0e","merchant_url":"https://whatsapp.com/channel/0029VadBczKI1rcayqzQ2n0e"}'
                            }
                        ],
                        messageParamsJson: ""
                    }
                }
            }
        }
    };
    conn.relayMessage(opt.from, x, {});
});

cmd({ pattern: "ttm" }, async (conn, mek, m, opt) => {
    let x = {
        interactiveMessage: {
            contextInfo: {
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "0@newsletter",
                    newsletterName: global.responses.by,
                    serverMessageId: 1
                }
            },
            header: {
                title: "header"
            },
            body: {
                text: "body"
            },
            footer: {
                text: "⿻ fotter ⿻"
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        buttonId: prefix + "menu",
                        buttonText: { displayText: "COMMAND MENU" },
                        type: 1
                    },
                    {
                        name: "single_select",
                        buttonParamsJson: `{ "title": "⿻Kyoja+⿻", "sections": [{ "title": "# !-Choose One Of Them", "highlight_label": "🌏General Commands🗨️", "rows": [{ "header": "ALL COMMAND", "title": "Show All Command", "id": ".allmenu" }, { "header": "Owner", "title": "Displays Owner Number", "id": ".owner" }, { "header": "Bot Info", "title": "Displays Information About Bots", "id": ".botstatus" }] }, { "title": "🦠 SpeCiaL - ComManD ❌", "highlight_label": " #SpeCial ", "rows": [{ "header": "Special - Menu", "title": "displays all special commands", "id": ".spesialmenu" }] }] }`
                    },
                    {
                        name: "cta_url",
                        buttonParamsJson:
                            '{"display_text":"Saluran WhatsApp","url":"https://whatsapp.com/channel/0029VadBczKI1rcayqzQ2n0e","merchant_url":"https://whatsapp.com/channel/0029VadBczKI1rcayqzQ2n0e"}'
                    }
                ],
                messageParamsJson: ""
            }
        }
    };
    conn.sendMessage(opt.from, x, {});
});
