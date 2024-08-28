const config = require("../config");
const { cmd, commands } = require("../command");
var os = require("os");
const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");

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
                                name: "single_select",
                                buttonParamsJson: `{ "title": "⿻Kyoja+⿻", "sections": [{ "title": "# !-Choose One Of Them", "highlight_label": "🌏General Commands🗨️", "rows": [{ "header": "ALL COMMAND", "title": "Show All Command", "id": ".allmenu" }, { "header": "Owner", "title": "Displays Owner Number", "id": ".owner" }, { "header": "Bot Info", "title": "Displays Information About Bots", "id": ".botstatus" }] }, { "title": "🦠 SpeCiaL - ComManD ❌", "highlight_label": " #SpeCial ", "rows": [{ "header": "Special - Menu", "title": "displays all special commands", "id": ".spesialmenu" }] }] }`
                            },
                            {
                                name: "cta_url",
                                buttonParamsJson:
                                    '{"display_text":"Saluran WhatsApp","url":"https://whatsapp.com/channel/0029VadBczKI1rcayqzQ2n0e","merchant_url":"https://whatsapp.com/channel/0029VadBczKI1rcayqzQ2n0e"}'
                            },
                            {
                                name: "quick_reply",
                                buttonParamsJson: `{"display_text":"COMMAND MENU","id":"${
                                    opt.prefix + "menu"
                                }"}`
                            },
                            {
                                name: "quick_reply",
                                buttonParamsJson: `{"display_text":"CHECK PING","id":"${
                                    opt.prefix + "ping"
                                }"}`
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

cmd(
    { pattern: "test2", react: "🤕", category: "test" },
    async (conn, mek, m, opt) => {
        let convertedMessage = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        contextInfo: {
                            mentionedJid: [m.sender],
                            groupMentions: [],
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363220858658436@newsletter",
                                serverMessageId: 127,
                                newsletterName: global.responses.by
                            },
                            externalAdReply: {
                                title: `「 ${config.BOT} 」`,
                                body: "test",
                                mediaType: 1,
                                sourceUrl: global.link,
                                thumbnailUrl: config.LOGO,
                                renderLargerThumbnail: false,
                                showAdAttribution: true
                            }
                        },
                        header: {
                            title: `Introducing TKM-BOT: Revolutionizing WhatsApp! 🎉📱`,
                            contextInfo: {
                                mentionedJid: [m.sender],
                                groupMentions: [],
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid:
                                        "120363220858658436@newsletter",
                                    newsletterName: global.responses.by,
                                    serverMessageId: 127
                                },
                                externalAdReply: {
                                    title: `「 ${config.BOT} 」`,
                                    body: "test",
                                    mediaType: 1,
                                    sourceUrl: global.link,
                                    thumbnailUrl: config.LOGO,
                                    renderLargerThumbnail: false,
                                    showAdAttribution: true
                                }
                            },
                            ...(await prepareWAMessageMedia(
                                {
                                    contextInfo: {
                                        mentionedJid: [m.sender],
                                        groupMentions: [],
                                        forwardingScore: 1,
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid:
                                                "120363220858658436@newsletter",
                                            newsletterName: global.responses.by,
                                            serverMessageId: 127
                                        },
                                        externalAdReply: {
                                            title: `「 ${config.BOT} 」`,
                                            body: "test",
                                            mediaType: 1,
                                            sourceUrl: global.link,
                                            thumbnailUrl: config.LOGO,
                                            renderLargerThumbnail: false,
                                            showAdAttribution: true
                                        }
                                    },
                                    image: { url: config.LOGO },
                                    headerType: 9
                                }, // Assuming config.LOGO is the image
                                { upload: conn.waUploadToServer }
                            )),
                            hasMediaAttachment: true
                        },
                        body: {
                            contextInfo: {
                                mentionedJid: [m.sender],
                                groupMentions: [],
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid:
                                        "120363220858658436@newsletter",
                                    newsletterName: global.responses.by,
                                    serverMessageId: 127
                                },
                                externalAdReply: {
                                    title: `「 ${config.BOT} 」`,
                                    body: "test",
                                    mediaType: 1,
                                    sourceUrl: global.link,
                                    thumbnailUrl: config.LOGO,
                                    renderLargerThumbnail: false,
                                    showAdAttribution: true
                                }
                            },
                            text: `Discover TKM-BOT's extraordinary features: 🌟

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

Experience the best with TKM-BOT! ✨`
                        },
                        footer: {
                            text: config.FOOTER
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: `{"display_text":"COMMAND MENU","id":"${
                                        opt.prefix + "menu"
                                    }"}`
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: `{"display_text":"CHECK PING","id":"${
                                        opt.prefix + "ping"
                                    }"}`
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: `{"display_text":"WhatsApp Channel","url":"https://whatsapp.com/channel/0029VaKjSra9WtC0kuJqvl0g","merchant_url":"https://whatsapp.com/channel/0029VaKjSra9WtC0kuJqvl0g"}`
                                }
                            ],
                            messageParamsJson: ""
                        }
                    }
                }
            }
        };
        await conn.relayMessage(opt.from, convertedMessage, { quoted: mek });
        //await conn.sendMessage(opt.from, convertedMessage);
    }
);

cmd({ pattern: "test3", category: "test" , react: "🙃"}, async (conn, mek, m, opt) => {
    const listMessage = {
        text: "This is a list",
        footer: "Footer text",
        title: "List Title",
        buttonText: "Choose an option",
        sections: [
            {
                title: "Section 1",
                rows: [
                    { title: "Option 1", rowId: "option1" },
                    { title: "Option 2", rowId: "option2" }
                ]
            },
            {
                title: "Section 2",
                rows: [
                    { title: "Option 3", rowId: "option3" },
                    { title: "Option 4", rowId: "option4" }
                ]
            }
        ]
    };

    await conn.sendMessage(opt.from, listMessage);

    const templateMessage = {
        text: "Choose an option",
        footer: "Footer text",
        templateButtons: [
            {
                index: 1,
                quickReplyButton: { displayText: "Option 1", id: "id1" }
            },
            {
                index: 2,
                quickReplyButton: { displayText: "Option 2", id: "id2" }
            },
            {
                index: 3,
                urlButton: {
                    displayText: "Visit Website",
                    url: "https://example.com"
                }
            }
        ]
    };

    await conn.sendMessage(opt.from, templateMessage);

    const buttonMessage = {
        text: "Do you like Baileys?",
        footer: "Choose an option",
        buttons: [
            { buttonId: "id1", buttonText: { displayText: "Yes" }, type: 1 },
            { buttonId: "id2", buttonText: { displayText: "No" }, type: 1 }
        ],
        headerType: 1
    };

    await conn.sendMessage(opt.from, buttonMessage);
});
