const config = require("../config");
const { cmd, commands } = require("../command");
const fileType = require("file-type");
const {
    getBuffer,
    fetchBuffer,
    getRandom,
    getFullFilePath
} = require("../lib/functions");
const {
    videoToWebp,
    addColoredBgToGif,
    addImageBgToGif,
    addVideoBgToGif
} = require("../lib/editor");
const { messageType } = require("../lib/msg");
const { attp } = require("../lib/scrapers");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

cmd(
    {
        pattern: "ttp",
        react: "✨",
        alias: ["ttp", "texttoimg"],
        desc: "it converts a text to sticker.",
        category: "convert",
        use: ".ttp HI",
        filename: __filename
    },
    async (conn, mek, m, { q, from, reply, pushname, parsedCommand }) => {
        try {
            if (!q) return await reply("*Please give me a text !*");
            const options = parsedCommand.options;
            const isCropped = options.cropped || options.c;
            const categories = options.categories?.split(",");
            const pack = options.pack;
            const text = parsedCommand.args.join(" ");
            let buff = await getBuffer(
                "https://text-artify-seven.vercel.app/api/v1/text-to-image",
                {
                    params: {
                        text,
                        color: options.color || "#FFFFFF",
                        bg_color: "#00000000" // transparent
                    }
                }
            );
            const sticker = new Sticker(Buffer.from(buff), {
                pack: pack || config.BOT, // The pack name
                author: pushname, // The author name
                type: isCropped ? StickerTypes.CROPPED : StickerTypes.FULL,
                categories
            });
            const buffer = await sticker.toBuffer();
            return conn.sendMessage(from, { sticker: buffer }, { quoted: mek });
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "attp",
        react: "✨",
        alias: ["texttogif"],
        desc: "it converts a text to gif sticker.",
        category: "convert",
        use: ".attp HI",
        filename: __filename
    },
    async (conn, mek, m, { q, parsedCommand, pushname, reply }) => {
        try {
            if (!q) return await reply("*Please give me a text !*");
            const options = parsedCommand.options;
            const isCropped = options.cropped || options.c;
            const categories = options.categories?.split(",");
            const pack = options.pack;
            const text = parsedCommand.args.join(" ");
            const gifUrl = await attp.request({ text });
            let buff = await getBuffer(gifUrl);
            buff = await videoToWebp(buff, 5);
            const sticker = new Sticker(buff, {
                pack: pack || config.BOT, // The pack name
                author: pushname, // The author name
                type: isCropped ? StickerTypes.CROPPED : StickerTypes.FULL,
                categories
            });
            await conn.sendMessage(from, await sticker.toMessage(), {
                quoted: mek
            });
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "aattp",
        react: "✨",
        desc: "it convert text to animated GIF",
        alias: ["avtext2gif"],
        category: "convert",
        use: ".aattp [options] <text>",
        filename: __filename
    },
    async (conn, mek, m, { q, from, parsedCommand, replyad, prefix }) => {
        const options = parsedCommand.options;
        const text = parsedCommand.args?.join(" ");

        if (options.help || options.h) {
            const helpMessage = `
✨ *Advanced Text to GIF Converter Help* ✨

📋 *Usage Instructions:*
1. *Text Mode*: Simply provide the text you want to convert into GIF.
2. *Image Mode*: Reply to an image with the command to convert it.
3. *Video Mode*: Reply to a video with the command to convert it.

🔧 *Options:*
- *time* or *t*: Duration of the GIF (default: 3 seconds)
- *padding* or *p*: Padding around the text (default: 10)
- *font*: Font ID (default: 1)
- *style*: Glitter ID (default: 1)
- *size* or *s*: Font size (default: 50)
- *bordercolor* or *bc*: Border color (default: #000000)
- *borderwidth* or *bw*: Width of the border (default: 2)
- *shadecolor* or *sc*: Shade color (default: #000000)
- *shadewidth* or *sw*: Width of the shade (default: 2)
- *textalign* or *ta*: Text alignment (default: center)
- *angle* or *a*: Angle of the text (default: 0)

💡 *Example Commands:*
- \`${prefix}aattp Your Text Here\`
- \`${prefix}aattp -t 5 -p 20 Your Text Here\`
- \`${prefix}aattp -t 10 -p 15 -f 1 -s 75 -bc #FF5733 -bw 3 -sc #C70039 -sw 2 -ta left -a 45 Your Text Here\`
`;

            return await conn.buttonMessage(
                from,
                {
                    ...(config.BUTTON
                        ? {
                              buttons: [
                                  {
                                      type: 4,
                                      buttonId: "attp_example_commands",
                                      buttonText: {
                                          text: `
${prefix}aattp Your Text Here
${prefix}aattp -t 5 -p 20 Your Text Here
${prefix}aattp -t 10 -p 15 -f 1 -s 75 -bc #FF5733 -bw 3 -sc #C70039 -sw 2 -ta left -a 45 Your Text Here`,
                                          displayText: "Copy Examples ✂️"
                                      }
                                  }
                              ]
                          }
                        : {})
                },
                mek
            );
        }

        if (!text) return await replyad("I need some text");
        let mode = "text";

        const isQuotedImage = m.quoted
            ? messageType(m.quoted) === "imageMessage"
            : false;
        const isQuotedVideo = m.quoted
            ? messageType(m.quoted) === "videoMessage"
            : false;
        const isImage = messageType(m) === "imageMessage";
        const isVideo = messageType(m) === "videoMessage";

        if (isImage || isQuotedImage) {
            mode = "image";
        } else if (isVideo || isQuotedVideo) {
            mode = "video";
        }

        let buff;
        if (["video", "image"].includes(mode)) {
            const filename = getRandom("");
            buff = await (m.download(filename) || m.quoted?.download(filename));
        }

        const time = options.time || options.t || 3;
        const padding = options.padding || options.p || 10;
        const font_id = Number(options.font) || 1;
        const glitter_id = Number(options.style) || 1;
        const size = Number(options.size || options.s) || 50;
        const border_color =
            options.bordercolor?.replace(/^#/, "") ||
            options.bc?.replace(/^#/, "") ||
            "000000";
        const border_width = Number(options.borderwidth || options.bw) || 2;
        const shade_color =
            options.shadecolor?.replace(/^#/, "") ||
            options.sc?.replace(/^#/, "") ||
            "000000";
        const shade_width = Number(options.shadewidth || options.sw) || 2;
        const text_align = options.textalign || options.ta || "center";
        const angle = Number(options.angle || options.a) || 0;

        let gifUrl;
        let buttons = [];

        function getButtons(data) {
            return [
                {
                    buttonId: `${prefix}aattpsticker ${mode} ${data} ${time} ${padding}`,
                    buttonText: { displayText: "Sticker 🏷️" },
                    type: 1
                },
                {
                    buttonId: `${prefix}aattpgif ${mode} ${data} ${time} ${padding}`,
                    buttonText: { displayText: "GIF 🎞️" },
                    type: 1
                },
                {
                    buttonId: `${prefix}aattpvideo ${mode} ${data} ${time} ${padding}`,
                    buttonText: { displayText: "Video 📹" },
                    type: 1
                },
                {
                    buttonId: `${prefix}aattp help`,
                    buttonText: { displayText: "Need help ❓" },
                    type: 1
                }
            ];
        }

        switch (mode) {
            case "text":
                {
                    const color =
                        options.color ||
                        options.c ||
                        options.bg ||
                        options.background ||
                        "#000000";
                    gifUrl = await attp.request({
                        text,
                        font_id,
                        glitter_id,
                        size,
                        border_color,
                        border_width,
                        shade_color,
                        shade_width,
                        text_align,
                        angle
                    });
                    buttons = getButtons(`${color} ${gifUrl}`);
                }
                break;
            case "image":
                {
                    const image = await fetchBuffer(buff);
                    const imagePath = getFullFilePath(
                        getRandom(`.${image.ext}`)
                    );
                    await fs.promises.writeFile(imagePath, image.data);
                    gifUrl = await attp.request({
                        text,
                        font_id,
                        glitter_id,
                        size,
                        border_color,
                        border_width,
                        shade_color,
                        shade_width,
                        text_align,
                        angle
                    });
                    buttons = getButtons(`${imagePath} ${gifUrl}`);
                }
                break;
            case "video":
                {
                    const video = await fetchBuffer(buff);
                    const videoPath = getFullFilePath(
                        getRandom(`.${video.ext}`)
                    );
                    await fs.promises.writeFile(videoPath, video.data);
                    gifUrl = await attp.request({
                        text,
                        font_id,
                        glitter_id,
                        size,
                        border_color,
                        border_width,
                        shade_color,
                        shade_width,
                        text_align,
                        angle
                    });
                    buttons = getButtons(`${videoPath} ${gifUrl}`);
                }
                break;
        }

        await conn.buttonMessage(
            from,
            {
                video: { url: gifUrl },
                gifPlayback: true,
                caption: `✨ *Advanced Text to GIF Converter* ✨

📋 *Instructions:*
Choose an *output format* below to style your text as a GIF, Sticker, or Video!

🎨 Customize your text with unique colors, fonts, and effects – and watch it come to life!

⏰ *Processing Time:* Just a few seconds!
`,
                footer: config.FOOTER,
                headerType: 4,
                buttons
            },
            mek
        );
    }
);

cmd(
    {
        pattern: "aattpgif",
        category: "convert",
        dontAddCommandList: true
    },
    async (conn, mek, m, { args, reply, from }) => {
        const mode = args[0];

        let gif;

        switch (mode) {
            case "text":
                {
                    if (args.length < 5) {
                        return await reply(
                            "Please provide all arguments: color, gif URL, time, padding."
                        );
                    }

                    const color = args[1];
                    const gifUrl = args[2];
                    const time = Number(args[3]);
                    const padding = Number(args[4]);

                    try {
                        const gifBuffer = (await fetchBuffer(gifUrl)).data;
                        gif = await addColoredBgToGif(
                            gifBuffer,
                            color,
                            time,
                            padding
                        );
                    } catch (error) {
                        return await reply(
                            "Failed to process the colored background for GIF."
                        );
                    }
                }
                break;

            case "image":
                {
                    if (args.length < 5) {
                        return await reply(
                            "Please provide all arguments: image path, gif URL, time, padding."
                        );
                    }

                    const imagePath = args[1];
                    const gifUrl = args[2];
                    const time = Number(args[3]);
                    const padding = Number(args[4]);

                    try {
                        const imageFile = await fetchBuffer(imagePath);
                        const gifBuffer = (await fetchBuffer(gifUrl)).data;

                        gif = await addImageBgToGif(
                            gifBuffer,
                            imageFile.data,
                            time,
                            padding,
                            null,
                            imageFile.ext
                        );
                    } catch (error) {
                        return await reply(
                            "Failed to process the image background for GIF."
                        );
                    }
                }
                break;

            case "video":
                {
                    if (args.length < 5) {
                        return await reply(
                            "Please provide all arguments: video path, gif URL, time, padding."
                        );
                    }

                    const videoPath = args[1];
                    const gifUrl = args[2];
                    const time = Number(args[3]);
                    const padding = Number(args[4]);

                    try {
                        const videoFile = await fetchBuffer(videoPath);
                        const gifBuffer = (await fetchBuffer(gifUrl)).data;

                        gif = await addVideoBgToGif(
                            gifBuffer,
                            videoFile.data,
                            time,
                            padding,
                            null,
                            videoFile.ext
                        );
                    } catch (error) {
                        return await reply(
                            "Failed to process the video background for GIF."
                        );
                    }
                }
                break;

            default: {
                await reply(global.responses.humanSpy);
                return; // Ensures the function exits after replying
            }
        }

        if (gif) {
            m.replyVid(gif, null, m.chat, { gif: true });
        }
    }
);

cmd(
    {
        pattern: "aattpvideo",
        category: "convert",
        dontAddCommandList: true
    },
    async (conn, mek, m, { args, reply, from }) => {
        const mode = args[0];

        let video;

        switch (mode) {
            case "text":
                {
                    if (args.length < 5) {
                        return await reply(
                            "Please provide all arguments: color, gif URL, time, padding."
                        );
                    }

                    const color = args[1];
                    const gifUrl = args[2];
                    const time = Number(args[3]);
                    const padding = Number(args[4]);

                    try {
                        const gifBuffer = (await fetchBuffer(gifUrl)).data;
                        video = await addColoredBgToGif(
                            gifBuffer,
                            color,
                            time,
                            padding,
                            null,
                            "buff",
                            "mp4"
                        );
                    } catch (error) {
                        return await reply(
                            "Failed to process the colored background for GIF."
                        );
                    }
                }
                break;

            case "image":
                {
                    if (args.length < 5) {
                        return await reply(
                            "Please provide all arguments: image path, gif URL, time, padding."
                        );
                    }

                    const imagePath = args[1];
                    const gifUrl = args[2];
                    const time = Number(args[3]);
                    const padding = Number(args[4]);

                    try {
                        const imageFile = await fetchBuffer(imagePath);
                        const gifBuffer = (await fetchBuffer(gifUrl)).data;

                        video = await addImageBgToGif(
                            gifBuffer,
                            imageFile.data,
                            time,
                            padding,
                            null,
                            imageFile.ext,
                            "buff",
                            "mp4"
                        );
                    } catch (error) {
                        return await reply(
                            "Failed to process the image background for GIF."
                        );
                    }
                }
                break;

            case "video":
                {
                    if (args.length < 5) {
                        return await reply(
                            "Please provide all arguments: video path, gif URL, time, padding."
                        );
                    }

                    const videoPath = args[1];
                    const gifUrl = args[2];
                    const time = Number(args[3]);
                    const padding = Number(args[4]);

                    try {
                        const videoFile = await fetchBuffer(videoPath);
                        const gifBuffer = (await fetchBuffer(gifUrl)).data;

                        video = await addVideoBgToGif(
                            gifBuffer,
                            videoFile.data,
                            time,
                            padding,
                            null,
                            videoFile.ext,
                            "buff",
                            "mp4"
                        );
                    } catch (error) {
                        return await reply(
                            "Failed to process the video background for GIF."
                        );
                    }
                }
                break;

            default: {
                await reply(global.responses.humanSpy);
                return; // Ensures the function exits after replying
            }
        }

        if (video) {
            m.replyVid(video);
        }
    }
);

cmd(
    {
        pattern: "aattpsticker",
        category: "convert",
        dontAddCommandList: true
    },
    async (conn, mek, m, { args, reply, from }) => {
        const mode = args[0];

        let gif;

        switch (mode) {
            case "text":
                {
                    if (args.length < 5) {
                        return await reply(
                            "Please provide all arguments: color, gif URL, time, padding."
                        );
                    }

                    const color = args[1];
                    const gifUrl = args[2];
                    const time = Number(args[3]);
                    const padding = Number(args[4]);

                    try {
                        const gifBuffer = (await fetchBuffer(gifUrl)).data;
                        gif = await addColoredBgToGif(
                            gifBuffer,
                            color,
                            time,
                            padding,
                            [512, 512],
                            "file"
                        );
                    } catch (error) {
                        return await reply(
                            "Failed to process the colored background for GIF."
                        );
                    }
                }
                break;

            case "image":
                {
                    if (args.length < 5) {
                        return await reply(
                            "Please provide all arguments: image path, gif URL, time, padding."
                        );
                    }

                    const imagePath = args[1];
                    const gifUrl = args[2];
                    const time = Number(args[3]);
                    const padding = Number(args[4]);

                    try {
                        const imageFile = await fetchBuffer(imagePath);
                        const gifBuffer = (await fetchBuffer(gifUrl)).data;

                        gif = await addImageBgToGif(
                            gifBuffer,
                            imageFile.data,
                            time,
                            padding,
                            [512, 512],
                            imageFile.ext,
                            "file"
                        );
                    } catch (error) {
                        return await reply(
                            "Failed to process the image background for GIF."
                        );
                    }
                }
                break;

            case "video":
                {
                    if (args.length < 5) {
                        return await reply(
                            "Please provide all arguments: video path, gif URL, time, padding."
                        );
                    }

                    const videoPath = args[1];
                    const gifUrl = args[2];
                    const time = Number(args[3]);
                    const padding = Number(args[4]);

                    try {
                        const videoFile = await fetchBuffer(videoPath);
                        const gifBuffer = (await fetchBuffer(gifUrl)).data;

                        gif = await addVideoBgToGif(
                            gifBuffer,
                            videoFile.data,
                            time,
                            padding,
                            [512, 512],
                            videoFile.ext,
                            "file"
                        );
                    } catch (error) {
                        return await reply(
                            "Failed to process the video background for GIF."
                        );
                    }
                }
                break;

            default: {
                await reply(global.responses.humanSpy);
                return;
            }
        }

        if (gif) {
            const sticker = new Sticker(gif, {
                pack: "Advanced Text to GIF",
                author: config.BOT
            });
            await conn.sendMessage(from, await sticker.toMessage(), {
                quoted: mek
            });
        }
    }
);
