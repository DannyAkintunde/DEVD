const config = require("../config");
const { cmd, commands } = require("../command");
const {
    getRandom,
    getFullFilePath,
    fetchJson,
    getBuffer,
    json
} = require("../lib/functions");
const { fileUploader } = require("../lib/scrapers");
const { getVideoDuration, toPTT } = require("../lib/editor");
const { Sticker, StickerTypes } = require("@shibam/sticker-maker");
const fs = require("fs");
const fileType = require("file-type");

cmd(
    {
        pattern: "img2url",
        react: "🔗",
        alias: ["tourl", "imgurl", "imgtourl"],
        desc: "uplode an image and return the url",
        category: "convert",
        use: ".img2url <reply image>",
        filename: __filename
    },
    async (conn, mek, m, { from, reply }) => {
        try {
            const imageBuffer = await m.getImage();
            if (imageBuffer) {
                fileUploader.uploadFromBuffer(imageBuffer).then(async url => {
                    reply(url);
                    conn.buttonMessage(
                        from,
                        {
                            text: `*Url*: ${url}`,
                            footer: config.FOOTER,
                            ...(config.BUTTON
                                ? {
                                      buttons: [
                                          {
                                              type: 4,
                                              buttonId: "image_url",
                                              buttonText: {
                                                  displayText: "Copy url 📋",
                                                  copy: url
                                              }
                                          },
                                          {
                                              type: 2,
                                              url
                                          }
                                      ]
                                  }
                                : {})
                        },
                        mek
                    );
                });
            } else return reply("*Reply to a photo !*");
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "sticker",
        react: "🙂",
        alias: ["s", "stic"],
        desc: "It converts your replied photo/video/sticker to sticker.",
        category: "convert",
        use: ".sticker <Reply to image/video/sticker>",
        filename: __filename
    },
    async (conn, mek, m, { from, pushname, reply, parsedCommand }) => {
        const options = parsedCommand.options;
        const isCropped = options.cropped || options.c;
        const categories = options.categories?.split(",");
        const pack = options.pack || parsedCommand.args.join(" ") || config.BOT;
        try {
            const image = await m.getImage();
            const video = await m.getVideo();
            const sticker = await m.getSticker();
            if (image) {
                // converts image to sticker
                const stickerImg = new Sticker(image, {
                    pack,
                    author: pushname,
                    type: isCropped
                        ? StickerTypes.CIRCLE
                        : StickerTypes.DEFAULT,
                    categories
                });
                const stickerBuffer = await stickerImg.toBuffer();
                return conn.sendMessage(
                    from,
                    { sticker: stickerBuffer },
                    {
                        quoted: mek
                    }
                );
            } else if (video) {
                // converts video to sticker
                const maxDuration = 3; // seconds
                if (getVideoDuration(video) > maxDuration) {
                    return reply(
                        `Use a video that has a duration less than or equal to ${maxDuration} seconds.`
                    );
                }
                const stickerGIF = new Sticker(video, {
                    pack,
                    author: pushname,
                    type: isCropped
                        ? StickerTypes.CIRCLE
                        : StickerTypes.DEFAULT,
                    categories
                });
                const stickerBuffer = await stickerGIF.toBuffer();
                return conn.sendMessage(
                    from,
                    { sticker: stickerBuffer },
                    {
                        quoted: mek
                    }
                );
            } else if (sticker) {
                // converts existing sticker tk sticker (purpost to ching meta data)
                const stickerObj = new Sticker(sticker, {
                    pack,
                    author: pushname,
                    type: isCropped
                        ? StickerTypes.CIRCLE
                        : StickerTypes.DEFAULT,
                    categories
                });
                const stickerBuffer = await stickerObj.toBuffer();
                return conn.sendMessage(
                    from,
                    { sticker: stickerBuffer },
                    {
                        quoted: mek
                    }
                );
            } else
                return await reply(
                    "*Please reply to a photo, video or existing sticker!*"
                );
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "toptt",
        react: "🔊",
        alias: ["toaudio", "audio"],
        desc: "It converts your replied video to audio [mp3].",
        category: "convert",
        use: ".toptt <Reply to video>",
        filename: __filename
    },
    async (conn, mek, m, { from, reply }) => {
        try {
            const video = await m.getVideo();
            if (!video) return await reply("*Reply to a video !*");
            let audio = await toPTT(video, "mp4");
            let sentMsg = await conn.sendMessage(
                m.chat,
                { audio: audio.options, mimetype: "audio/mpeg" },
                { quoted: m }
            );
            await conn.sendMessage(from, {
                react: { text: "🎼", key: sentMsg.key }
            });
        } catch (e) {
            m.sendError(e, "*I cant convert this video to audio :(*");
        }
    }
);

cmd(
    {
        pattern: "toimg",
        react: "🔮",
        alias: ["s", "stic"],
        desc: "It converts your replied sticker to img.",
        category: "convert",
        use: ".sticker <Reply to sticker>",
        filename: __filename
    },
    async (conn, mek, m, { from, reply }) => {
        try {
            const isQuotedSticker = m.quoted
                ? m.quoted.type === "stickerMessage"
                : false;
            if (isQuotedSticker) {
                const nameJpg = getRandom("");
                const buff = await m.quoted.download(nameJpg);
                // un-needed ? const type = await fileType.fromBuffer(buff);
                const path = getFullFilePath(nameJpg + ".webp");
                await fs.promises.writeFile(path, buff);
                await conn.sendMessage(
                    from,
                    {
                        image: fs.readFileSync(path),
                        caption: config.FOOTER
                    },
                    { quoted: mek }
                );
                fs.unlinkSync(path);
            } else return await reply("*Reply to a sticker !*");
        } catch (e) {
            m.sendError(e);
        }
    }
);
