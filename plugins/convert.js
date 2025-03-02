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
        // const { Sticker, StickerTypes } = await import("@shibam/sticker-maker");
        const {
            Sticker,
            StickerTypes,
            TextPositions
        } = require("wa-sticker-toolkit");
        const options = parsedCommand.options;
        const isCircle = options.circle || options.c;
        const isCropped = options.cropped || options.crop || options.cp;
        const isFill = options.fill || options.f;
        let type = options.type || options.t || StickerTypes.DEFAULT;
        if (isCircle) {
            type = StickerTypes.CIRCLE;
        } else if (isCropped) {
            type = StickerTypes.CROPPED;
        } else if (isFill) {
            type = StickerTypes.FILL;
        }
        const categories = options.categories?.split(",");
        const pack = options.pack || parsedCommand.args.join(" ") || config.BOT;
        const background =
            options.background ||
            options.backgroundcolor ||
            options.color ||
            options.bg;
        const borderWidth = options.borderwidth || options.bw;
        const borderColor = options.bordercolor || options.bc;
        const borderRadius =
            options.borderRadius || options.Radius || options.br || options.r;
        const textContent = options.text || options.caption || options.t;
        const textColor = options.textcolor || options.tc;
        const font = options.font || options.f;
        const fontSize = options.fontsize || options.fs;
        let textPosition = TextPositions.CENTER;
        switch (options.textposition || options.tp) {
            case "top":
                textPosition = TextPositions.TOP;
                break;
            case "center":
                textPosition = TextPositions.CENTER;
                break;
            case "bottom":
                textPosition = TextPositions.BOTTOM;
                break;
        }
        const stickerOptions = {
            metadata: {
                // id: "",
                author: options.author || options.a || pushname,
                pack
            },
            background,
            borderWidth,
            borderColor,
            borderRadius,
            text: {
                content: textContent,
                color: textColor,
                font,
                fontSize,
                position: textPosition
            }
        };
        try {
            const image = await m.getImage()//.catch(() => null);
            const video = await m.getVideo()//.catch(() => null);
            const sticker = await m.getSticker()//.catch(() => null);
            if (image) {
                // converts image to sticker
                const stickerImg = new Sticker(image, stickerOptions);
                const stickerBuffer = await stickerImg.toBuffer();
                m.replyS(stickerBuffer);
            } else if (video) {
                // converts video to sticker
                const maxDuration = 5; // seconds
                reply(getVideoDuration(video));
                if (getVideoDuration(video) > maxDuration) {
                    return reply(
                        `Use a video that has a duration less than or equal to ${maxDuration} seconds.`
                    );
                }
                const stickerGIF = new Sticker(video, stickerOptions);
                const stickerBuffer = await stickerGIF.toBuffer();
                m.replyS(stickerBuffer);
            } else if (sticker) {
                // converts existing sticker to sticker (purpost to change metadata)
                const stickerObj = new Sticker(sticker, stickerOptions);
                const stickerBuffer = await stickerObj.toBuffer();
                m.replyS(stickerBuffer);
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
