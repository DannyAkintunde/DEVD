const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    getDevice,
    fetchLatestBaileysVersion,
    jidNormalizedUser,
    getContentType,
    proto,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    Browsers
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const P = require("pino");
var os = require("os");
const config = require("./config");
const a_config = require("./lib/config");
const qrcode = require("qrcode-terminal");
const NodeCache = require("node-cache");
const util = require("util");
const {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
    fetchBuffer,
    getFile,
    translate
} = require("./lib/functions");
const { loadButtonMessage } = require("./lib/buttons.js");
const { sms, downloadMediaMessage } = require("./lib/msg");
const axios = require("axios");
const { File } = require("megajs");
const path = require("path");
const chalk = require("chalk");
const themeManager = require("./lib/themes/theme");
const parseCommand = require("./lib/commands/commandParser");
const Prefix = require("./lib/commands/Prefix");
const msgRetryCounterCache = new NodeCache();
// const prefix = config.PREFIX;
global.Prefix = new Prefix(config.PREFIX);
const ownerNumber = config.OWNER_NUMBER.split(",");
const l = console.log;
const lsuss = mess => console.log(chalk.green(mess));
var {
    updateCMDStore,
    isbtnID,
    getCMDStore,
    getCmdForCmdId,
    connectdb,
    input,
    get,
    updb,
    updfb
} = require("./lib/database");

//===================SESSION============================
if (!fs.existsSync(__dirname + "/session/creds.json")) {
    if (config.SESSION_ID) {
        const sessdata = config.SESSION_ID.replace("DEVD~", "");
        const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
        filer.download((err, data) => {
            if (err) throw err;
            fs.writeFile(__dirname + "/session/creds.json", data, () => {
                lsuss("Session download completed !!");
            });
        });
    }
} else console.log("using creds.json");
const store = makeInMemoryStore({
    logger: P().child({
        level: "silent",
        stream: "store"
    })
});

const restart = () => {
    console.log(chalk.yellow("restarting........"));
    const { exec } = require("child_process");
    exec("pm2 restart all");
};
// channel link
global.link = "https://whatsapp.com/channel/0029VaPwIObFXUua2VemtQ0x";
global.cid = "120363259578625665@newsletter";
// Create temp dir
if (!fs.existsSync(global.mediaPath)) {
    fs.promises
        .mkdir(global.mediaPath, { recursive: true })
        .then(() => console.log("Temp folder created"))
        .catch(e => console.error("Error occored creating temp folder."));
} else {
    console.log("Temp folder already exists");
}
// <<==========THEMES===========>>
process.emit("theme.update");
themeManager.load(config.THEME);
//====================================
async function connectToWA() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
    const { state, saveCreds } = await useMultiFileAuthState("./session/");
    const conn = makeWASocket({
        version,
        logger: P({ level: "fatal" }).child({ level: "fatal" }),
        printQRInTerminal: true,
        browser: Browsers.windows(
            config.INTERFACE.toLowerCase() === "web"
                ? "FireFox"
                : config.INTERFACE.toLowerCase() === "desktop"
                ? "Desktop"
                : config.INTERFACE
        ),
        syncFullHistory: config.INTERFACE.toLowerCase() === "web",
        generateHighQualityLinkPreview: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(
                state.keys,
                P({ level: "fatal" }).child({ level: "fatal" })
            )
        },
        markOnlineOnConnect: true,
        defaultQueryTimeoutMs: undefined,
        msgRetryCounterCache,
        getMessage: async key => {
            let jid = jidNormalizedUser(key.remoteJid);
            let msg = await store.loadMessage(jid, key.id);

            return msg?.message || "";
        },
        patchMessageBeforeSending: message => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );

            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {}
                            },
                            ...message
                        }
                    }
                };
            }
            return message;
        }
    });

    store.readFromFile("store.json");
    store.bind(conn.ev);
    setInterval(() => {
        store.writeToFile("store.json");
    }, 3000);
    conn.ev.on("connection.update", async update => {
        const { connection, lastDisconnect } = update;
        if (connection === "connecting") {
            console.log("ℹ️ Connection in progress...");
        } else if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.badSession) {
                console.log(
                    "bad session please get a new session id or creds.json asap !"
                );
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log(
                    "!!!  connection closed reconection in progress ..."
                );
                connectToWA();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log(
                    "connection to server lost 😞 ,,, reconnection in progress ... "
                );
                connectToWA();
            } else if (reason === DisconnectReason?.connectionReplaced) {
                console.log(
                    "connection replaced but session alread open please close it ASAP !!!"
                );
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(
                    "you've been disconnected please get a new session id ASAP"
                );
            } else if (reason === DisconnectReason.restartRequired) {
                console.log("Reboot in progress ▶️");
                restart();
            } else {
                console.log("Restarting immediatly after an error  ", reason);
                restart();
            }
        } else if (connection === "open") {
            const path = require("path");
            console.log(
                fs
                    .readFileSync(path.join(__dirname, "media", "well.txt"))
                    .toString()
            );
            global.MODE = config.MODE === "private" ? "private" : "public";
            console.log(chalk.green("✅ connection successfull! ☺️"));
            conn.sendMessage(conn.user.id, {
                text: "DEVD-BOT V3 connected sucessfully" // connection message
            });
            console.log(chalk.yellow("Installing plugins 🔌... "));
            fs.readdirSync("./plugins/").forEach(plugin => {
                if (path.extname(plugin).toLowerCase() == ".js") {
                    try {
                        let plug = require("./plugins/" + plugin);
                        process.emit("plugin.installed", conn, plugin);
                        lsuss("Sucessfully installed " + plugin + "");
                    } catch (e) {
                        console.error(
                            "An error occored while installing " +
                                plugin +
                                "Error: " +
                                e.message +
                                " :\n" +
                                e.stack
                        );
                    }
                }
            });
            process.emit("plugin.initilised", conn);
            lsuss("Plugins installed ✅");
            await connectdb();
            await updb();
            lsuss("DEVD-BOT connected ✅");
        }
    });

    conn.ev.on("creds.update", saveCreds);
    conn.ev.on("messages.upsert", async mek => {
        try {
            mek = mek.messages[0];
            if (!mek.message) return;
            var id_db = require("./lib/database/id_db");
            mek.message =
                getContentType(mek.message) === "ephemeralMessage"
                    ? mek.message.ephemeralMessage.message
                    : mek.message;
            if (mek.key && mek.key.remoteJid === "status@broadcast") return;
            const m = sms(conn, mek);
            var smg = m;
            const type = getContentType(mek.message);
            const content = JSON.stringify(mek.message);
            const from = mek.key.remoteJid;
            const quoted =
                type == "extendedTextMessage" &&
                mek.message.extendedTextMessage.contextInfo != null
                    ? mek.message.extendedTextMessage.contextInfo
                          .quotedMessage || []
                    : [];
            var body =
                type === "conversation"
                    ? mek.message.conversation
                    : mek.message?.extendedTextMessage?.contextInfo?.hasOwnProperty(
                          "quotedMessage"
                      ) &&
                      (await isbtnID(
                          mek.message?.extendedTextMessage?.contextInfo
                              ?.stanzaId
                      )) &&
                      getCmdForCmdId(
                          await getCMDStore(
                              mek.message?.extendedTextMessage?.contextInfo
                                  ?.stanzaId
                          ),
                          mek?.message?.extendedTextMessage?.text
                      )
                    ? getCmdForCmdId(
                          await getCMDStore(
                              mek.message?.extendedTextMessage?.contextInfo
                                  ?.stanzaId
                          ),
                          mek?.message?.extendedTextMessage?.text
                      )
                    : type === "extendedTextMessage"
                    ? mek.message.extendedTextMessage.text
                    : type == "imageMessage" && mek.message.imageMessage.caption
                    ? mek.message.imageMessage.caption
                    : type == "videoMessage" && mek.message.videoMessage.caption
                    ? mek.message.videoMessage.caption
                    : type == "buttonsResponseMessage" &&
                      mek.message.buttonsResponseMessage.selectedButtonId
                    ? mek.message.buttonsResponseMessage.selectedButtonId
                    : type == "listResponseMessage" &&
                      mek.message.listResponseMessage.singleSelectReply
                          .selectedRowId
                    ? mek.message.listResponseMessage.singleSelectReply
                          .selectedRowId
                    : type == "interactiveResponseMessage" &&
                      mek.message.interactiveResponseMessage
                          .nativeFlowResponseMessage.paramsJson
                    ? JSON.parse(
                          mek.message.interactiveResponseMessage
                              .nativeFlowResponseMessage.paramsJson
                      ).id
                    : type == "templateButtonReplyMessage" &&
                      mek.message.templateButtonReplyMessage.selectedId
                    ? mek.message.templateButtonReplyMessage.selectedId
                    : type == "messageContextInfo" &&
                      (mek.message.buttonsResponseMessage?.selectedButtonId ||
                          mek.message.listResponseMessage?.singleSelectReply
                              .selectedRowId ||
                          mek.message.InteractiveResponseMessage
                              .NativeFlowResponseMessage ||
                          mek.text)
                    ? mek.message.buttonsResponseMessage?.selectedButtonId ||
                      mek.message.listResponseMessage?.singleSelectReply
                          .selectedRowId ||
                      mek.message.InteractiveResponseMessage
                          .NativeFlowResponseMessage ||
                      mek.text
                    : "";
            var [, p, command = "", _] = global.Prefix.match(body);
            var prefix = p;
            var isCmd = Boolean(p);
            command = command.toLowerCase().trim();
            var args = _.trim().split(/ +/);
            var q = args.join(" ");
            if (
                smg.quoted &&
                smg.quoted.fromMe &&
                (await id_db.check(smg.quoted.id))
            ) {
                let cp_body = body; // copy the body variable
                if (global.Prefix.isPrefix(cp_body))
                    cp_body = cp_body.replace(global.Prefix.get(cp_body), "");
                var id_body = await id_db.get_data(smg.quoted.id, cp_body);
                if (id_body.cmd) {
                    isCmd = true;
                    var [, p, command = "", _] = global.Prefix.match(
                        id_body.cmd
                    );
                    command = command.toLowerCase().trim();
                    prefix = p;
                    args = _.trim().split(/ +/);
                    q = args.join(" ");
                }
            }
            console.log(command);
            const isGroup = from.endsWith("@g.us");
            const sender = mek.key.fromMe
                ? conn.user.id.split(":")[0] + "@s.whatsapp.net" || conn.user.id
                : mek.key.participant || mek.key.remoteJid;
            const senderNumber = sender.split("@")[0];
            const botNumber = conn.user.id.split(":")[0];
            const pushname = mek.pushName || "Nameless";
            const developers = ["2348098309204"];
            const isbot = botNumber.includes(senderNumber);
            const isdev = developers.includes(senderNumber);
            const isMe = isbot ? isbot : isdev;
            const superUser = [...ownerNumber, ...developers, botNumber];
            const isSuperUser = superUser.includes(senderNumber);
            const isOwner = ownerNumber.includes(senderNumber) || isMe;
            const botNumber2 = await jidNormalizedUser(conn.user.id);
            const groupMetadata = isGroup
                ? await conn.groupMetadata(from).catch(e => {})
                : "";
            const groupName = isGroup ? groupMetadata.subject : "";
            const participants = isGroup
                ? await groupMetadata.participants
                : "";
            const groupAdmins = isGroup
                ? await getGroupAdmins(participants)
                : "";
            const isBotAdmins = isGroup
                ? groupAdmins.includes(botNumber2)
                : false;
            const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
            var etat =
                config.PRESENCE || config.PRESENCE !== "available"
                    ? config.PRESENCE === "composing"
                        ? 2
                        : config.PRESENCE === "recording"
                        ? 3
                        : config.PRESENCE === "unavailable"
                        ? 4
                        : 1
                    : 1;
            if (etat == 1) {
                await conn.sendPresenceUpdate("available", from);
            } else if (etat == 2) {
                await conn.sendPresenceUpdate("composing", from);
            } else if (etat == 3) {
                await conn.sendPresenceUpdate("recording", from);
            } else {
                await conn.sendPresenceUpdate("unavailable", from);
            }
            const isAnti = teks => {
                let getdata = teks;
                for (let i = 0; i < getdata.length; i++) {
                    if (getdata[i] === from) return true;
                }
                return false;
            };

            const reply = async teks => {
                return await conn.sendMessage(
                    from,
                    { text: teks },
                    { quoted: mek }
                );
            };
            conn.replyad = async (
                teks,
                title = config.BOT,
                body = "🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲",
                src = global.link
            ) => {
                return await conn.sendMessage(
                    from,
                    {
                        text: teks,
                        contextInfo: {
                            mentionedJid: [""],
                            groupMentions: [],
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: global.cid,
                                serverMessageId: 127
                            },
                            externalAdReply: {
                                title: `「 ${title} 」`,
                                body: body,
                                mediaType: 1,
                                sourceUrl: src,
                                thumbnailUrl: config.LOGO,
                                renderLargerThumbnail: false,
                                showAdAttribution: true
                            }
                        }
                    },
                    { quoted: mek }
                );
            };
            const NON_BUTTON = !config.BUTTON; // Implement a switch to on/off this feature...
            conn.buttonMessage2 = async (jid, msgData, quotemek) => {
                if (!NON_BUTTON) {
                    await conn.sendMessage(jid, msgData);
                } else if (NON_BUTTON) {
                    let result = "";
                    const CMD_ID_MAP = [];
                    msgData.buttons
                        .filter(button => button.type == 1)
                        .forEach((button, bttnIndex) => {
                            const mainNumber = `${bttnIndex + 1}`;
                            result += `\n*${mainNumber} | ${button.buttonText.displayText}*\n`;

                            CMD_ID_MAP.push({
                                cmdId: mainNumber,
                                cmd: button.buttonId
                            });
                        });

                    if (msgData.headerType === 1) {
                        const buttonMessage = `${msgData.text}\n\n🔢 Reply you want number,${result}\n${msgData.footer}`;
                        const textmsg = await conn.sendMessage(
                            from,
                            {
                                text: buttonMessage,
                                contextInfo: {
                                    mentionedJid: [""],
                                    groupMentions: [],
                                    forwardingScore: 1,
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: global.cid,
                                        serverMessageId: 127
                                    },
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
                            },
                            { quoted: quotemek || mek }
                        );
                        await updateCMDStore(textmsg.key.id, CMD_ID_MAP);
                    } else if (msgData.headerType === 4) {
                        const buttonMessage = `${msgData.caption}\n\n🔢 Reply you want number,${result}\n${msgData.footer}`;
                        const imgmsg = await conn.sendMessage(
                            jid,
                            {
                                image: msgData.image,
                                caption: buttonMessage,
                                contextInfo: {
                                    mentionedJid: [""],
                                    groupMentions: [],
                                    forwardingScore: 1,
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: global.cid,
                                        serverMessageId: 127
                                    },
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
                            },
                            { quoted: quotemek || mek }
                        );
                        for (let i = 0; i < cmdArray.length; i++) {
                            await id_db.input_data(
                                cmdArray[i].rowId,
                                cmdArray[i].title,
                                imgmsg.key.id
                            );
                        }
                        // await updateCMDStore(imgmsg.key.id, CMD_ID_MAP);
                    }
                }
            };

            conn.replyList = async (from, list_reply, options) => {
                function convertNumberList(sections) {
                    let result = "";

                    sections.forEach((section, sectionIndex) => {
                        result += section.title ? `*${section.title}*\n` : "";

                        section.rows.forEach((row, rowIndex) => {
                            result += `*${row.title} || ${row.description}*`;
                            result +=
                                rowIndex === section.rows.length - 1
                                    ? ""
                                    : "\n"; // Add newline unless it's the last row
                        });

                        result +=
                            sectionIndex === sections.length - 1 ? "" : "\n\n"; // Add extra newline unless it's the last section
                    });

                    return result;
                }
                if (!list_reply.sections) return false;
                list_reply[list_reply.caption ? "caption" : "text"] =
                    (list_reply.title ? list_reply.title + "\n\n" : "") +
                    (list_reply.caption
                        ? list_reply.caption
                        : list_reply.text) +
                    "\n\n" +
                    list_reply.buttonText +
                    "\n\n" +
                    (await convertNumberList(list_reply.sections)) +
                    "\n\n" +
                    list_reply.footer;
                var t = { ...list_reply };
                delete list_reply.sections;
                delete list_reply.footer;
                delete list_reply.buttonText;
                delete list_reply.title;
                const sentMessage = await conn.sendMessage(
                    from,
                    list_reply,
                    options
                );
                const cmdArray = [];
                t.sections.forEach(section => {
                    section.rows.forEach(row => {
                        cmdArray.push({ rowId: row.rowId, title: row.title });
                    });
                });
                for (let i = 0; i < cmdArray.length; i++) {
                    await id_db.input_data(
                        cmdArray[i].rowId,
                        cmdArray[i].title,
                        sentMessage.key.id
                    );
                }
            };

            conn.buttonMessage = async (jid, msgData, quotemek) => {
                if (!NON_BUTTON) {
                    msgData.contextInfo
                        ? msgData.contextInfo.mentionedJid
                            ? null
                            : (msgData.contextInfo.mentionedJid = [jid])
                        : (msgData.contextInfo = { mentionedJid: [jid] });
                    const loaddedMessage = await loadButtonMessage(
                        msgData,
                        conn
                    );
                    await conn.relayMessage(jid, loaddedMessage, {});
                } else if (NON_BUTTON) {
                    let result = "";
                    const CMD_ID_MAP = [];
                    msgData.buttons
                        ?.filter(button => button.type == 1)
                        .forEach((button, bttnIndex) => {
                            const mainNumber = `${bttnIndex + 1}`;
                            result += `\n*${mainNumber} | ${button.buttonText.displayText}*\n`;

                            CMD_ID_MAP.push({
                                cmdId: mainNumber,
                                cmd: button.buttonId
                            });
                        });

                    if (msgData.headerType === 1) {
                        const buttonMessage = `${
                            msgData.text || msgData.caption
                        }\n🔢 Reply you want number,${result}\
\n\n${msgData.footer}`;
                        const textmsg = await conn.sendMessage(
                            from,
                            {
                                text: buttonMessage,
                                contextInfo: {
                                    mentionedJid: [""],
                                    groupMentions: [],
                                    forwardingScore: 1,
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: global.cid,
                                        serverMessageId: 127
                                    },
                                    externalAdReply: {
                                        title: `「 ${config.BOT} 」`,
                                        body: "🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲",
                                        mediaType: 1,
                                        sourceUrl: global.link,
                                        thumbnailUrl: config.LOGI,
                                        renderLargerThumbnail: false,
                                        showAdAttribution: true
                                    }
                                }
                            },
                            { quoted: quotemek || mek }
                        );
                        for (let i = 0; i < cmdArray.length; i++) {
                            await id_db.input_data(
                                cmdArray[i].rowId,
                                cmdArray[i].title,
                                textmsg.key.id
                            );
                        }
                        // await updateCMDStore(textmsg.key.id, CMD_ID_MAP);
                    } else if (msgData.headerType === 4) {
                        const buttonMessage = `${msgData.caption}\n\n🔢 Reply you want number,${result}\n${msgData.footer}`;
                        const imgmsg = await conn.sendMessage(
                            jid,
                            {
                                image: msgData.image,
                                caption: buttonMessage,
                                contextInfo: {
                                    mentionedJid: [""],
                                    groupMentions: [],
                                    forwardingScore: 1,
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: global.cid,
                                        serverMessageId: 127
                                    },
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
                            },
                            { quoted: quotemek || mek }
                        );
                        await updateCMDStore(imgmsg.key.id, CMD_ID_MAP);
                    }
                }
            };

            conn.listMessage2 = async (jid, msgData, quotemek) => {
                if (!NON_BUTTON) {
                    await conn.sendMessage(jid, msgData);
                } else if (NON_BUTTON) {
                    let result = "";
                    const CMD_ID_MAP = [];

                    msgData.sections.forEach((section, sectionIndex) => {
                        const mainNumber = `${sectionIndex + 1}`;
                        result += `\n*[${mainNumber}] ${section.title}*\n`;

                        section.rows.forEach((row, rowIndex) => {
                            const subNumber = `${mainNumber}.${rowIndex + 1}`;
                            const rowHeader = `   ${subNumber} | ${row.title}`;
                            result += `${rowHeader}\n`;
                            if (row.description) {
                                result += `   ${row.description}\n\n`;
                            }
                            CMD_ID_MAP.push({
                                cmdId: subNumber,
                                cmd: row.rowId
                            });
                        });
                    });

                    const listMessage = `${msgData.text}\n\n${msgData.buttonText},${result}\n${msgData.footer}`;
                    const text = await conn.sendMessage(
                        from,
                        {
                            text: listMessage,
                            contextInfo: {
                                mentionedJid: [""],
                                groupMentions: [],
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: global.cid,
                                    serverMessageId: 127
                                },
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
                        },
                        { quoted: quotemek || mek }
                    );
                    await updateCMDStore(text.key.id, CMD_ID_MAP);
                }
            };

            conn.listMessage = async (jid, msgData, quotemek) => {
                if (!NON_BUTTON) {
                    msgData.contextInfo
                        ? msgData.contextInfo.mentionedJid
                            ? null
                            : (msgData.contextInfo.mentionedJid = [jid])
                        : (msgData.contextInfo = { mentionedJid: [jid] });
                    const loaddedMessage = await loadButtonMessage(
                        msgData,
                        conn,
                        "sl"
                    );
                    await conn.relayMessage(jid, loaddedMessage, {});
                } else if (NON_BUTTON) {
                    let result = "";
                    // const CMD_ID_MAP = [];
                    const cmdArray = [];

                    msgData.sections.forEach((section, sectionIndex) => {
                        const mainNumber = `${sectionIndex + 1}`;
                        result += `\n*[${mainNumber}] ${section.title}*\n`;

                        section.rows.forEach((row, rowIndex) => {
                            const subNumber = `${mainNumber}.${rowIndex + 1}`;
                            const rowHeader = `   ${subNumber} | ${row.title}`;
                            result += `${rowHeader}\n`;
                            if (row.description) {
                                result += `   ${row.description}\n\n`;
                            }
                            cmdArray.push({
                                rowId: row.rowId,
                                title: subNumber
                            });
                            /*
                            CMD_ID_MAP.push({
                                cmdId: subNumber,
                                cmd: row.rowId
                            });
                            */
                        });
                    });

                    const listMessage = `${msgData.text}\n\n${msgData.buttonText},${result}\n${msgData.footer}`;
                    const text = await conn.sendMessage(
                        from,
                        {
                            text: listMessage,
                            contextInfo: {
                                mentionedJid: [""],
                                groupMentions: [],
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: global.cid,
                                    serverMessageId: 127
                                },
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
                        },
                        { quoted: quotemek || mek }
                    );
                    for (let i = 0; i < cmdArray.length; i++) {
                        await id_db.input_data(
                            cmdArray[i].rowId,
                            cmdArray[i].title,
                            text.key.id
                        );
                    }
                    // await updateCMDStore(text.key.id, CMD_ID_MAP);
                }
            };
            conn.edite = async (oldmg, newmg) => {
                await conn.relayMessage(
                    from,
                    {
                        protocolMessage: {
                            key: oldmg.key,
                            type: 14,
                            editedMessage: {
                                conversation: newmg.text
                            }
                        }
                    },
                    {}
                );
            };
            conn.sendFileUrl = async (
                jid,
                url,
                caption,
                quoted,
                options = {}
            ) => {
                let mime = "";
                let res = await axios.head(url);
                mime = res.headers["content-type"];
                if (mime.split("/")[1] === "gif") {
                    return conn.sendMessage(
                        jid,
                        {
                            video: await getBuffer(url),
                            caption: caption,
                            gifPlayback: true,
                            ...options
                        },
                        { quoted: quoted, ...options }
                    );
                }
                let type = mime.split("/")[0] + "Message";
                if (mime === "application/pdf") {
                    return conn.sendMessage(
                        jid,
                        {
                            document: await getBuffer(url),
                            mimetype: "application/pdf",
                            caption: caption,
                            ...options
                        },
                        { quoted: quoted, ...options }
                    );
                }
                if (mime.split("/")[0] === "image") {
                    return conn.sendMessage(
                        jid,
                        {
                            image: await getBuffer(url),
                            caption: caption,
                            ...options
                        },
                        { quoted: quoted, ...options }
                    );
                }
                if (mime.split("/")[0] === "video") {
                    return conn.sendMessage(
                        jid,
                        {
                            video: await getBuffer(url),
                            caption: caption,
                            mimetype: "video/mp4",
                            ...options
                        },
                        { quoted: quoted, ...options }
                    );
                }
                if (mime.split("/")[0] === "audio") {
                    return conn.sendMessage(
                        jid,
                        {
                            audio: await getBuffer(url),
                            caption: caption,
                            mimetype: "audio/mpeg",
                            ...options
                        },
                        { quoted: quoted, ...options }
                    );
                }
            };
            //============================================================================

            if (config.ONLY_GROUP && !isMe && !isGroup) return;
            if (from === "120363043598019970@g.us" && !isdev) return;
            if (global.MODE === "private" && !isSuperUser && !isbot) return;
            //==================================plugin map================================
            const events = require("./command");
            const cmdName = isCmd ? command : false;
            console.log(cmdName, body, command);
            if (isCmd) {
                const cmd =
                    events.commands.find(cmd => cmd.pattern === cmdName) ||
                    events.commands.find(
                        cmd => cmd.alias && cmd.alias.includes(cmdName)
                    );
                if (cmd) {
                    const parsedCommand = parseCommand(body);
                    if (cmd.react && config.AUTO_REACT)
                        conn.sendMessage(from, {
                            react: { text: cmd.react, key: mek.key }
                        });
                    if (cmd.unstable) reply(global.responses.unstable);

                    try {
                        cmd.function(conn, mek, m, {
                            from,
                            prefix,
                            l,
                            quoted,
                            body,
                            isCmd,
                            command,
                            parsedCommand,
                            args,
                            q,
                            isGroup,
                            sender,
                            senderNumber,
                            botNumber2,
                            botNumber,
                            pushname,
                            isMe,
                            isdev,
                            isOwner,
                            isSuperUser,
                            groupMetadata,
                            groupName,
                            participants,
                            groupAdmins,
                            isBotAdmins,
                            isAdmins,
                            reply
                        });
                    } catch (e) {
                        console.error("[PLUGIN ERROR] ", e);
                        m.sendError(e);
                    }
                }
            }
            events.commands.map(async command => {
                if (body && command.on === "body") {
                    try {
                        if (command.unstable) reply(global.responses.unstable);
                        command.function(conn, mek, m, {
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
                            isdev,
                            isOwner,
                            isSuperUser,
                            groupMetadata,
                            groupName,
                            participants,
                            groupAdmins,
                            isBotAdmins,
                            isAdmins,
                            reply
                        });
                    } catch (e) {
                        m.sendError(e);
                    }
                } else if (mek.q && command.on === "text") {
                    try {
                        if (command.unstable) reply(global.responses.unstable);
                        command.function(conn, mek, m, {
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
                            isdev,
                            isOwner,
                            isSuperUser,
                            groupMetadata,
                            groupName,
                            participants,
                            groupAdmins,
                            isBotAdmins,
                            isAdmins,
                            reply
                        });
                    } catch (e) {
                        m.sendError(e);
                    }
                } else if (
                    (command.on === "image" || command.on === "photo") &&
                    mek.type === "imageMessage"
                ) {
                    try {
                        if (command.unstable) reply(global.responses.unstable);
                        command.function(conn, mek, m, {
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
                            isdev,
                            isOwner,
                            isSuperUser,
                            groupMetadata,
                            groupName,
                            participants,
                            groupAdmins,
                            isBotAdmins,
                            isAdmins,
                            reply
                        });
                    } catch (e) {
                        m.sendError(e);
                    }
                } else if (
                    command.on === "sticker" &&
                    mek.type === "stickerMessage"
                ) {
                    try {
                        if (command.unstable) reply(global.responses.unstable);
                        command.function(conn, mek, m, {
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
                            isdev,
                            isOwner,
                            isSuperUser,
                            groupMetadata,
                            groupName,
                            participants,
                            groupAdmins,
                            isBotAdmins,
                            isAdmins,
                            reply
                        });
                    } catch (e) {
                        m.sendError(e);
                    }
                }
            });

            //============================================================================
            if (isAnti(config.ANTI_LINK) && isBotAdmins) {
                if (!isAdmins) {
                    if (!isMe) {
                        if (body.match(`chat.whatsapp.com`)) {
                            await conn.sendMessage(from, { delete: mek.key });
                        }
                    }
                }
            }
            //============================================================================
            var bad = []; // await fetchJson(
            //     "https://github.com/vihangayt0/server-/raw/main/xeonsl_bad.json"
            // );
            if (isAnti(config.ANTI_BAD) && isBotAdmins) {
                if (!isAdmins) {
                    for (word in bad) {
                        if (body.toLowerCase().includes(bad[word])) {
                            if (!body.includes("tent")) {
                                if (!body.includes("docu")) {
                                    if (!body.includes("http")) {
                                        if (groupAdmins.includes(sender))
                                            return;
                                        if (mek.key.fromMe) return;
                                        await conn.sendMessage(from, {
                                            delete: mek.key
                                        });
                                        await conn.sendMessage(from, {
                                            text: "*Bad word detected !*"
                                        });
                                        await conn.groupParticipantsUpdate(
                                            from,
                                            [sender],
                                            "remove"
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            }
            //====================================================================
            var check_id = id => {
                var data = {
                    is_bot: false,
                    device:
                        id.length > 21
                            ? "android"
                            : id.substring(0, 2) === "3A"
                            ? "ios"
                            : "web"
                };
                if (id.startsWith("BAE5")) {
                    data.is_bot = true;
                    data.bot_name = "bailyes";
                }
                if (/amdi|queen|black|amda|achiya|achintha/gi.test(id)) {
                    data.is_bot = true;
                    data.bot_name = "amdi";
                }
                return data;
            };
            async function antibot(Void, citel) {
                if (isAnti(config.ANTI_BOT)) return;
                if (isAdmins) return;
                if (!isBotAdmins) return;
                if (isOwner) return;
                if (isGroup) {
                    var user = check_id(mek.key.id);
                    if (user.is_bot) {
                        try {
                            await conn.sendMessage(from, {
                                text: `*Other bots are not allowed here !!*`
                            });
                            return await conn.groupParticipantsUpdate(
                                from,
                                [sender],
                                "remove"
                            );
                        } catch {}
                    }
                }
            }
            try {
                await antibot(conn, mek);
            } catch {}
            switch (command) {
                case "jid":
                    reply(from);
                    break;
                case "device":
                    {
                        let deviceq = getDevice(
                            mek.message.extendedTextMessage.contextInfo.stanzaId
                        );

                        reply(
                            "*He Is Using* _*Whatsapp " + deviceq + " version*_"
                        );
                    }
                    break;
                case "$":
                case "ex":
                    {
                        if (developers.includes(senderNumber)) {
                            m.react(global.reactions.loading);
                            const { exec } = require("child_process");
                            exec(q, (err, stdout) => {
                                if (err) {
                                    m.react(global.reactions.error);
                                    return reply(`-------\n\n` + err);
                                }
                                if (stdout) {
                                    m.react(global.reactions.success);
                                    return reply(`-------\n\n` + stdout);
                                }
                            });
                        } else {
                            reply("this command is for developers only");
                        }
                    }
                    break;
                case "apprv":
                    {
                        if (developers.includes(senderNumber)) {
                            let reqlist =
                                await conn.groupRequestParticipantsList(from);
                            for (let i = 0; i < reqlist.length; i++) {
                                if (reqlist[i].jid.startsWith("212")) {
                                    await conn.groupRequestParticipantsUpdate(
                                        from,
                                        [reqlist[i].jid],
                                        "reject"
                                    );
                                } else {
                                    await conn.groupRequestParticipantsUpdate(
                                        from,
                                        [reqlist[i].jid],
                                        "approve"
                                    );
                                }
                            }
                        }
                    }
                    break;
                case "restart":
                    {
                        if (isSuperUser) {
                            await m.react("🔄");
                            await reply("restarting....");
                            restart();
                        } else {
                            await reply("command is for owner and devs only");
                        }
                    }
                    break;
                case "rm212":
                    {
                        if (isSuperUser || isAdmins) {
                            if (!isBotAdmins) return;
                            for (let i = 0; i < participants.length; i++) {
                                if (participants[i].id.startsWith("212")) {
                                    await conn.groupParticipantsUpdate(
                                        from,
                                        [participants[i].id],
                                        "remove"
                                    );
                                }
                            }
                        }
                    }
                    break;
                case "rtf":
                    {
                        console.log(dsa);
                    }
                    break;
                case ">":
                case "<":
                case "ev":
                    {
                        m.react(global.reactions.loading);
                        let code = q
                            .replace("°", ".toString()")
                            .replace("ⁿ", "console.log");
                        if (command === "<") code = `(async () => {${code}})()`;
                        try {
                            let resultTest = await eval(code);
                            // if (typeof resultTest === "object") {
                            //     reply(util.format(resultTest));
                            // }
                            m.react(global.reactions.success);
                            reply(util.format(resultTest));
                        } catch (err) {
                            m.react(global.reactions.error);
                            reply(util.format(err));
                        }
                    }
                    break;
            }
        } catch (e) {
            const isError = String(e);
            console.error(isError);
        }
    });
    conn.ev.on("contacts.upsert", async contacts => {
        const insertContact = newContact => {
            for (const contact of newContact) {
                if (store.contacts[contact.id]) {
                    Object.assign(store.contacts[contact.id], contact);
                } else {
                    store.contacts[contact.id] = contact;
                }
            }
            return;
        };
        insertContact(contacts);
    });
}
// <<==========WEBSERVER===========>>
const express = require("express");
const app = express();
const port = config.PORT || 8000;
const sitePath = path.join(__dirname, "media", "site");
const staticFilesPath = path.join(sitePath, "static");

app.set("view engine", "ejs");
app.set("views", path.join(sitePath, "views"));
app.use(express.static(staticFilesPath));

app.get("/", (req, res) => {
    res.render("index", { config });
});
app.listen(port, () =>
    console.log(
        chalk.yellow(
            `ℹ️ Server listening on ${chalk.bold(port)} ${chalk.red.bgWhite(
                port
            )} view site at ${chalk.red.underline("http://localhost:" + port)}`
        )
    )
);
//====================================
setTimeout(async () => {
    await connectToWA();
}, 3000);

//catch exections
process.on("uncaughtException", function (err) {
    let e = String(err);
    if (e.includes("Socket connection timeout")) return;
    if (e.includes("item-not-found")) return;
    if (e.includes("rate-overlimit")) return;
    if (e.includes("Connection Closed")) return;
    if (e.includes("Timed Out")) return;
    if (e.includes("Value not found")) return;
    if (e.includes("Authentication timed out")) restart();
    console.log("Caught exception: ", err);
});
