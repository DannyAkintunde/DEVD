const config = require("../config");
const { cmd, commands } = require("../command");
const got = require("got");
const {
    getBuffer,
    getRandom,
    getFullFilePath,
    fetchJson
} = require("../lib/functions");
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-toolkit");
const fs = require("fs");
let { unlink } = require("fs/promises");
const { promisify } = require("util");
const FormData = require("form-data");
const stream = require("stream");
const pipeline = promisify(stream.pipeline);
const fileType = require("file-type");

cmd(
    {
        pattern: "removebg",
        react: "🔮",
        alias: ["rmbg"],
        desc: "It remove background your replied photo.",
        category: "convert",
        use: ".removebg <Reply to image>",
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
            imageBuffer = await m.getImage();
            if (imageBuffer) {
                let type = await fileType.fromBuffer(imageBuffer);
                const imageFilePath = getFullFilePath(getRandom(".png"));
                await fs.promises.writeFile(imageFilePath, imageBuffer);
                var form = new FormData();
                form.append("image_file", fs.createReadStream(imageFilePath));
                form.append("size", "auto");

                var rbg = await got.stream.post(
                    "https://api.remove.bg/v1.0/removebg",
                    {
                        body: form,
                        headers: {
                            "X-Api-Key": config.RMBG_APIKEY
                        }
                    }
                );
                await pipeline(rbg, fs.createWriteStream(namePng + ".png"));
                let dat = `┌───[${config.BOT}]

   *🌆 BACKGROUND REMOVER*

`;
                const sections = [
                    {
                        title: "",
                        rows: [
                            {
                                title: "1",
                                rowId: prefix + "rbgi " + namePng + ".png",
                                description: "ɪᴍᴀɢᴇ"
                            },
                            {
                                title: "2",
                                rowId: prefix + "rebgs " + namePng + ".png",
                                description: "ꜱᴛɪᴄᴋᴇʀ"
                            },
                            {
                                title: "3",
                                rowId: prefix + "rbgd " + namePng + ".png",
                                description: "ᴅᴏᴄᴜᴍᴇɴᴛ"
                            }
                        ]
                    }
                ];
                const listMessage = {
                    caption: dat,
                    footer: config.FOOTER,
                    buttons: buttons,
                    headerType: 1
                };
                await conn.replyList(from, listMessage, { quoted: mek });
            } else return await reply("*Reply to a photo !*");
        } catch (e) {
            m.sendError(e, "I can't remove background on this image.");
        }
    }
);

cmd(
    {
        pattern: "rbgi",
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
                { image: fs.readFileSync(q), caption: config.FOOTER },
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
        pattern: "rebgs",
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
            let sticker = new Sticker(q, {
                pack: pushname, // The pack name
                author: "", // The author name
                type: q.includes("--crop" || "-c")
                    ? StickerTypes.CROPPED
                    : StickerTypes.FULL,
                categories: ["🤩", "🎉"], // The sticker category
                id: "12345", // The sticker id
                quality: 75, // The quality of the output file
                background: "transparent" // The sticker background color (only for full stickers)
            });
            const buffer = await sticker.toBuffer();
            await conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
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
        pattern: "rbgd",
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
                    document: fs.readFileSync(q),
                    mimetype: "image/x-png",
                    fileName: "Removebg" + ".png",
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
