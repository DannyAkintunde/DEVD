const config = require("../config");
const { cmd, commands } = require("../command");
const {
    getBuffer,
    getRandom,
    isUrl,
    Json,
    sleep,
    fetchJson,
    randChoice,
    trans
} = require("../lib/functions");
const { getImageFromMsg } = require("../lib/msg");
const {
    fileUploader,
    text2prompt,
    turboseek,
    midjourney,
    stablediff
} = require("../lib/scrapers");
const parseCommand = require("../lib/commands/commandParser");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

cmd(
    {
        pattern: "tkm",
        alias: ["ai", "bot"],
        react: "📡",
        desc: "A simple chatbot AI chat",
        category: "ai",
        use: ".tkm <prompt>",
        filename: __filename
    },
    async (conn, mek, m, { q, reply, l, pushname, from }) => {
        const payload = `you are an ai chatbot created by TKM INC,
            your developers are Akintunde Daniel popularly known as Danny and Takudzwa popularly know as Tkm ,lord tkm or Cod3Uchiha,
            you are implimented into a whatsapp bot named DEVD-BOT,
            your name is DEVD ai,
            the name of the current user is ${pushname} use it to your will,
            if a question us beyond your intelect make sure to let the user know,
            your dev contact info are Danny: +2348098309204[whatsapp number] and TKM: +263785028126[whatsapp number],
            you are to act like ${global.THEME.ai.identity}, you are also to show chracter similar to ${global.THEME.ai.character} also try to put some emojis in your response similar to that of this character when required,
            for updates about you or DEVD-BOT check our whatsapp channel ${global.link}`;
        if (!q) return reply(randChoice(global.THEME.ai.responses.noquery));
        try {
            fetch(
                global.getApi("itzpire", "/ai/gpt-logic", {
                    q,
                    logic: payload,
                    chat_id: from,
                    realtime: false
                })
            )
                .then(response => response.json())
                .then(data => {
                    const botResponse = data.result;
                    m.react("🤖");
                    return reply(botResponse);
                })
                .catch(error => {
                    m.sendError(error, "*Error generating response*");
                });
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "bard",
        alias: ["bardai", "gbard", "googlebard", "googleai", "ai2"],
        react: "👾",
        desc: "It search on bard ai for what you provided.",
        category: "ai",
        use: ".bard hey",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        { from, prefix, quoted, args, q, sender, pushname, isMe, isdev, reply }
    ) => {
        try {
            if (!q)
                return reply("*Please give me words to search on bard ai !*");
            let response = await fetchJson(
                global.getApi("yanz", "/api/ai/bard", {
                    query: q,
                    apiKey: randChoice(global.APIKEYS.yanz)
                })
            );
            if (response?.status == 200) {
                return await reply(response.result);
            } else {
                if (isMe || isdev)
                    m.sendError(
                        new Error("Invalid ApiKey"),
                        "can't get response check *Apikey*.\n> apikey limit could have been reached"
                    );
                else
                    m.sendError(
                        new Error("Invalid ApiKey"),
                        "*Server is busy. Try again later.!*"
                    );
            }
        } catch (e) {
            m.sendError(e, "*Server is busy. Try again later.!*");
        }
    }
);

cmd(
    {
        pattern: "bingai",
        alias: ["bing", "copilot"],
        desc: "Bing AI chat bot.",
        react: "👾",
        category: "ai",
        use: ".bing hi there?",
        filename: __filename
    },
    async (conn, msg, m, { q, reply, isMe, isdev }) => {
        try {
            if (!q)
                return reply("*Please give me words to search on bard ai !*");
            let response = await fetchJson(
                global.getApi("yanz", "/api/ai/bing", {
                    query: q,
                    model: "Balance",
                    apiKey: randChoice(global.APIKEYS.yanz)
                })
            );
            if (response?.status == 200) {
                m.react(global.THEME.reactions.success);
                return await reply(response.result);
            } else {
                if (isMe || isdev)
                    m.sendError(
                        new Error("Invalid ApiKey"),
                        "can't get response check *Apikey*.\n> apikey limit could have been reached"
                    );
                else
                    m.sendError(
                        new Error("Invalid ApiKey"),
                        "*Server is busy. Try again later.!*"
                    );
            }
        } catch (e) {
            m.sendError(e, "*Server is busy. Try again later.!*");
        }
    }
);

cmd(
    {
        pattern: "blackbox",
        alias: ["bb"],
        react: "👾",
        desc: "Blackbox ai chat",
        category: "ai",
        use: ".blackbox hey",
        filename: __filename
    },
    async (conn, mek, m, { q, reply }) => {
        try {
            if (!q) return reply("*Please give me words!*");
            let response = await fetchJson(
                global.getApi("itzpire", `/ai/blackbox-ai`, { q })
            );
            if (response?.status == "success") {
                return await reply(response.result);
            } else {
                m.sendError(
                    new Error("Check api endpiont"),
                    "*Server is busy. Try again later.!*"
                );
            }
        } catch (e) {
            m.sendError(e, "*Server is busy. Try again later.!*");
        }
    }
);

cmd(
    {
        pattern: "gemini",
        react: "📡",
        category: "ai",
        desc: "Gemini AI chat",
        use: ".gemini hey there",
        filename: __filename
    },
    async (conn, mek, m, { q, reply }) => {
        let question = q || m.quoted?.body;
        if (!question) return reply("Ask a question");
        let image = await getImageFromMsg(m);
        const mode = image ? "image" : "text";
        let sessionId;
        async function handleResponse(response) {
            if (response.status) {
                sessionId = sessionId ? sessionId : response.ids;
                await conn.sendMessage(
                    from,
                    {
                        text: response.result
                        //edit: msg.key
                    },
                    { quoted: mek }
                );
                mek.react("🤖");
            } else if (response.status == 429) {
                m.sendError(
                    new Error("Too Many Requests"),
                    "Too many requests within 1 minute/daily/monthly. Please try again later"
                );
            } else {
                m.sendError(
                    new Error("Check api endpiont"),
                    "*Server is busy. Try again later.!*"
                );
            }
        }
        try {
            switch (mode) {
                case "text":
                    {
                        let response = await fetchJson(
                            global.getApi("nyxs", "/ai/gemini-advance-image", {
                                text: question,
                                ...(sessionId ? { sessionId } : {})
                            })
                        );
                        await handleResponse(response);
                    }
                    break;
                case "image":
                    {
                        const url = await fileUploader.uploadFileWithMimeType(
                            image,
                            null,
                            "image/jpeg"
                        );
                        let response = fetchJson(
                            global.getApi("nyxs", "/ai/gemini-advance-image", {
                                text: question,
                                url,
                                ...(sessionId ? { sessionId } : {})
                            })
                        );
                        await handleResponse(response);
                    }
                    break;
            }
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "gpt",
        alias: ["chatgpt"],
        react: "📡",
        desc: "ChatGPT AI chat",
        category: "ai",
        use: ".gpt <prompt>",
        filename: __filename
    },
    async (conn, mek, m, { q, reply, l }) => {
        try {
            if (!q) {
                return reply(`Please ask a question.`);
            }
            const response = await axios.get(
                global.getApi("itzpire", `/ai/gpt`, {
                    model: "gpt-3.5-turbo",
                    q
                })
            );

            const data = response.data.data;
            if (data) {
                reply(data.response);
            } else {
                m.sendError(
                    new Error("Error during response generation."),
                    "Error during response generation."
                );
            }
        } catch (error) {
            m.sendError(
                error,
                "Oops, an error occurred while processing your request."
            );
        }
    }
);

cmd(
    {
        pattern: "gpt4",
        alias: ["chatgpt4"],
        react: "📡",
        desc: "ChatGPT4 AI chat",
        category: "ai",
        use: ".gpt4 <prompt>",
        filename: __filename
    },
    async (conn, mek, m, { reply, from, q, isMe, isdev }) => {
        try {
            if (!q) return await reply("ask something");
            const msg = await conn.sendMessage(
                from,
                { text: "thinking......" },
                { quoted: mek }
            );
            res = await fetchJson(
                global.getApi("itzpire", "/ai/gpt", {
                    model: "gpt-4-32k-0314",
                    q
                })
            );
            if (res.status === "success") {
                await conn.sendMessage(
                    from,
                    { text: res.response, edit: msg.key },
                    { quoted: mek }
                );
                await mek.react("🤖");
            } else if (res.status == 403) {
                if (isMe || isdev)
                    m.sendError(
                        new Error("Invalid ApiKey"),
                        "can't get response check *Apikey*.\n> apikey limit could have been reached",
                        msg.key
                    );
                else
                    m.sendError(
                        new Error("Invalid ApiKey"),
                        "*Server is busy. Try again later.!*",
                        msg.key
                    );
            } else {
                await m.sendError(
                    new Error("an error occured generation response at gpt4"),
                    "an error occred generating resopnce",
                    msg.key
                );
            }
        } catch (e) {
            m.sendError(
                e,
                `An error occored when generating responce: ${e.message}`
            );
        }
    }
);

cmd(
    {
        pattern: "gpt-4o",
        alias: ["gpt4o", "chatgpt-4o"],
        react: "📡",
        desc: "chatgpt-4o ai chat",
        category: "ai",
        use: ".gpt-4o hi",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            prefix,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isMe,
            isdev,
            isOwner,
            reply
        }
    ) => {
        try {
            if (!q) return reply("*Please give me words !*");
            const msg = await conn.sendMessage(
                from,
                { text: "thinking......" },
                { quoted: mek }
            );
            let response = await fetchJson(
                global.getApi("yanz", "/api/ai/gpt-4o", {
                    query: q,
                    system: "YanzBotz-MD",
                    apiKey: randChoice(global.APIKEYS.yanz),
                    id: from
                })
            );
            m.react(global.THEME.reactions.success);
            if (response?.status == 200) {
                trans(response.result, {
                    to: config.LANG.toLowerCase()
                })
                    .then(res => {
                        conn.sendMessage(
                            from,
                            {
                                text: res,
                                edit: msg.key
                            },
                            { quoted: mek }
                        );
                        mek.react("🤖");
                    })
                    .catch(e =>
                        m.sendError(e, "*Error translating response*", msg.key)
                    );
            } else {
                if (isMe || isdev)
                    m.sendError(
                        new Error("Invalid ApiKey"),
                        "can't get response check *Apikey*.\n> apikey limit could have been reached",
                        msg.key
                    );
                else
                    m.sendError(
                        new Error("Invalid ApiKey"),
                        "*Server is busy. Try again later.!*",
                        msg.key
                    );
            }
        } catch (e) {
            m.sendError(e, "*Server is busy. Try again later.!*");
        }
    }
);

cmd(
    {
        pattern: "turboseek",
        alias: ["turbi", "turbo"],
        react: "📡",
        desc: "Turboseek AI chat",
        category: "ai",
        use: ".turboseek <prompt>",
        filename: __filename
    },
    async (conn, mek, m, { q, reply }) => {
        try {
            if (!q) {
                return reply(`Please ask a question.`);
            }
            turboseek(q).then(response => {
                if (response) {
                    m.react(global.reactions.success);
                    reply(response.prompt);
                } else {
                    m.sendError(
                        new Error("Error during response generation."),
                        "Error during response generation."
                    );
                }
            });
        } catch (error) {
            m.sendError(
                error,
                "Oops, an error occurred while processing your request."
            );
        }
    }
);

cmd(
    {
        pattern: "text2prompt",
        alias: [
            "t2p",
            "promptgen",
            "prompt-gen",
            "generate-prompt",
            "texttoprompt"
        ],
        react: "📡",
        desc: "Generate AI prompts from text",
        category: "ai",
        use: ".text2prompt <prompt>",
        filename: __filename
    },
    async (conn, mek, m, { from, q, reply, prefix }) => {
        if (!q)
            return await reply(
                `text argument is required \n> try ${prefix}text2prompt a sad cat`
            );
        const text = await trans(q, { to: "en" });
        try {
            const response = await text2prompt(text);
            if (response.status) {
                const result = response.result
                    ? trans(response.result, { to: config.LANG?.toLowerCase() })
                    : null;
                await m.react(global.reactions.success);
                return await conn.buttonMessage(
                    from,
                    {
                        text: `*Qurey*: ${args.join("")}\n*Prompt*: ${result}`,
                        footer: config.FOOTER,
                        ...(config.BUTTON
                            ? {
                                  buttons: [
                                      {
                                          type: 4,
                                          buttonId: "result_prompt",
                                          buttonText: {
                                              text: result,
                                              displayText: "Copy prompt 📋"
                                          }
                                      }
                                  ]
                              }
                            : {})
                    },
                    mek
                );
            } else {
                m.sendError(
                    new Error("check endpoint"),
                    "*an error occoured genrating prompt*"
                );
            }
        } catch (e) {
            m.sendError(e, "*an error occoured genrating prompt*");
        }
    }
);

cmd(
    {
        pattern: "dalle",
        react: "📷",
        desc: "Generate images using DALLE",
        category: "ai",
        use: ".dalle <prompt>",
        filename: __filename
    },
    async (conn, mek, m, { q, reply, l, from, prefix }) => {
        try {
            if (!q && !m.quoted?.body) {
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            }
            let image = q;
            if (m.quoted) {
                image = m.quoted.body;
            }
            //m.react(global.THEME.reactions.loading)
            const response = await axios.get(
                global.getApi("itzpire", `/ai/dalle`, { prompt: image })
            );

            const data = response.data;
            let caption = `*Prompt:* ${image}`;

            if (data.result && data.code === 200) {
                const imageUrl = data.result;
                await conn.buttonMessage(
                    from,
                    {
                        image: { url: imageUrl },
                        caption: caption,
                        footer: config.FOOTER,
                        contextInfo: {
                            isForwarded: false
                        },
                        ...(config.BUTTON
                            ? {
                                  buttons: [
                                      {
                                          type: 1,
                                          buttonId: `${prefix}dalle ${image}`,
                                          buttonText: {
                                              displayText: "Regenerate 🔁"
                                          }
                                      }
                                  ]
                              }
                            : {})
                    },
                    { quoted: mek }
                );
                await m.react(global.THEME.reactions.success);
            } else {
                m.sendError(
                    new Error("Status 404 when making request"),
                    "Error during image generation."
                );
            }
        } catch (error) {
            m.sendError(
                error,
                "Oops, an error occurred while processing your request"
            );
        }
    }
);

cmd(
    {
        pattern: "dalle3",
        alias: ["dalle-3"],
        react: "📷",
        desc: "Generate images using DALLE-3",
        category: "ai",
        use: ".dalle3 <prompt>",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            prefix,
            quoted,
            body,
            args,
            q,
            isGroup,
            sender,
            isMe,
            isdev,
            reply
        }
    ) => {
        try {
            if (!q && !m.quoted?.body)
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            let text = q;
            if (m.quoted) {
                text = m.quoted.body;
            }

            let image = await getBuffer(
                global.getApi("yanz", "/api/text2img/dalle-3"),
                {
                    params: {
                        prompt: text,
                        apiKey: randChoice(global.APIKEYS.yanz)
                    }
                }
            );
            let caption = `*Prompt:* ${q}`;
            if (image && image?.status != 404) {
                //const imagePath = await saveBuffer(image);
                //image = fs.readFileSync(imagePath);
                conn.buttonMessage(
                    from,
                    {
                        image,
                        caption: caption,
                        footer: config.FOOTER,
                        contextInfo: {
                            isForwarded: false
                        },
                        ...(config.BUTTON
                            ? {
                                  buttons: [
                                      {
                                          type: 1,
                                          buttonId: `${prefix}dalle3 ${q}`,
                                          buttonText: {
                                              displayText: "Regenerate 🔁"
                                          }
                                      }
                                  ]
                              }
                            : {})
                    },
                    { quoted: mek }
                );
                m.react(global.THEME.reactions.success);
                //fs.unlinkSync(imagePath);
            } else {
                if (isMe || isdev)
                    m.sendError(
                        new Error("Invalid ApiKey"),
                        "can't get response check *Apikey*.\n> apikey limit could have been reached"
                    );
                else
                    m.sendError(
                        new Error("Invalid ApiKey"),
                        "*Server is busy. Try again later.!*"
                    );
            }
        } catch (e) {
            m.sendError(e, "Error during image generation.");
        }
    }
);

cmd(
    {
        pattern: "flux",
        alias: ["flux-gen"],
        react: "📷",
        desc: "Generate images using flux",
        category: "ai",
        use: ".flux <prompt>",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        { from, prefix, quoted, body, isCmd, command, args, q, reply }
    ) => {
        try {
            if (!q && !m.quoted?.body)
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            let text = q;
            if (m.quoted) {
                text = m.quoted.body;
            }

            let image = await getBuffer(
                global.getApi("astral", "/api/images/flux"),
                {
                    params: {
                        prompt: text
                    }
                }
            );
            let caption = `*Prompt:* ${text}`;
            if (image && image?.status != 404) {
                conn.buttonMessage(
                    from,
                    {
                        image,
                        caption: caption,
                        footer: config.FOOTER,
                        contextInfo: {
                            isForwarded: false
                        },
                        ...(config.BUTTON
                            ? {
                                  buttons: [
                                      {
                                          type: 1,
                                          buttonId: `${prefix}flux ${q}`,
                                          buttonText: {
                                              displayText: "Regenerate 🔁"
                                          }
                                      }
                                  ]
                              }
                            : {})
                    },
                    { quoted: mek }
                );
                m.react(global.THEME.reactions.success);
            }
        } catch (e) {
            m.sendError(e, "Error during image generation.");
        }
    }
);

// old api yanz /api/text2img/midjourney
cmd(
    {
        pattern: "midjourney",
        alias: ["mj"],
        react: "📷",
        desc: "Generate images using Midjourney",
        category: "ai",
        use: ".midjourney <prompt>",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        { from, prefix, command, q, pushname, sender, reply }
    ) => {
        try {
            if (!q && !m.quoted?.body)
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            let text = q;
            if (m.quoted) {
                text = m.quoted.body;
                text = text
                    .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                    .trim();
            }
            const commandStr = `${prefix}mj ${text}`;
            const parsedCommand = parseCommand(commandStr);
            const options = parsedCommand.options;
            text = parsedCommand.args.join(" ");
            const [prompt, negative_prompt] =
                text.trim().split("|").length > 1
                    ? text.split("|")
                    : [text, options.negative_prompt || options.np];
            const style = options.style || options.s || "(No style)";
            const [width, height] = options.size?.split("x").map(Number) || [
                1024, 1024
            ];
            if (
                (options.g || options.guidancescale) &&
                !isNaN(Number(options.g || options.guidancescale))
            )
                conn.replyad(
                    `Invalid guidance scale specfied using 6 as default`
                );
            const guidanceScale = !isNaN(
                Number(options.g || options.guidancescale)
            )
                ? min(10, options.g || options.guidancescale)
                : 6;
            const availableStyles = [
                "Anime",
                "Photo",
                "Cinematic",
                "3D Model",
                "(No style)",
                "2560 x 1440"
            ];
            if (!availableStyles.includes(style))
                conn.replyad(
                    `Invalid style specfied using (No style)\n> Available styles are ${availableStyles.join(
                        ", "
                    )}`
                );
            m.react(global.reactions.loading);
            const infoMsg = conn.sendMessage(
                from,
                {
                    text: `Image generation process requsted by ${pushname}`,
                    contextInfo: { mentionedJid: [sender] }
                },
                { quoted: m }
            );
            midjourney
                .create(
                    prompt,
                    negative_prompt,
                    style,
                    width,
                    height,
                    guidanceScale
                )
                .then(images => {
                    if (images && images.length > 0) {
                        m.react(global.reactions.upload);
                        conn.edite(infoMsg, {
                            text: `Uploding Images generated images`
                        });
                        let i = 1;
                        images.forEach(image => {
                            conn.edite(infoMsg, {
                                text: `Uploding Images ${i++} of ${
                                    images.length
                                }`
                            });
                            conn.sendMessage(from, {
                                image: { url: image },
                                contextInfo: { mentionedJid: [sender] }
                            });
                        });
                        conn.edite(infoMsg, {
                            text: `Sucessfully generated ${
                                images.length
                            } image${images.length > 1 ? "s" : ""}`
                        });
                        const caption = `*Prompt:* ${prompt}${
                            negative_prompt
                                ? "\n*Negative Prompt:* " + negative_prompt
                                : ""
                        }${style ? "\n*Style:* " + style : "(No style)"}${
                            "\n*Guidance Scale* " + guidanceScale
                        }${"\n*Size:* " + width + "x" + height}`;
                        m.react(global.reactions.success);
                        return conn.buttonMessage(
                            from,
                            {
                                caption: caption,
                                footer: config.FOOTER,
                                contextInfo: {
                                    isForwarded: false
                                },
                                ...(config.BUTTON
                                    ? {
                                          buttons: [
                                              {
                                                  type: 1,
                                                  buttonId: `${prefix}mj ${q}`,
                                                  buttonText: {
                                                      displayText:
                                                          "Regenerate 🔁"
                                                  }
                                              }
                                          ]
                                      }
                                    : {})
                            },
                            { quoted: mek }
                        );
                    }
                    m.react(global.reactions.error);
                })
                .catch(err => {
                    if (
                        err.response &&
                        err.response.data.includes("exceeded your GPU quota")
                    ) {
                        m.react(global.reactions.overload);
                        return conn.replyad(global.responses.overload);
                    }
                    throw err;
                });
        } catch (e) {
            m.sendError(e, "Error during image generation.");
        }
    }
);

// old api itzpire /ai/stablediffusion-2.1
cmd(
    {
        pattern: "imagine",
        alias: [
            "texttoimage",
            "toimage",
            "aiimage",
            "stablediffusion",
            "stablediff",
            "stablediff2.1"
        ],
        react: "📷",
        desc: "It convert given text to ai image.",
        category: "ai",
        use: ".imagine  <prompt> or imagine <prompt> | <nagative_prompt>",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        { from, prefix, command, q, pushname, sender, reply }
    ) => {
        try {
            if (!q && !m.quoted?.body)
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            let text = q;
            if (m.quoted) {
                text = m.quoted.body;
                text = text
                    .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                    .trim();
            }
            const commandStr = `${prefix}${command} ${text}`;
            const parsedCommand = parseCommand(commandStr);
            const options = parsedCommand.options;
            text = parsedCommand.args.join(" ");
            const [prompt, negative_prompt] =
                text.trim().split("|").length > 1
                    ? text.split("|")
                    : [text, options.negative_prompt || options.np];
            if (
                (options.g || options.guidancescale) &&
                !isNaN(Number(options.g || options.guidancescale))
            )
                conn.replyad(
                    `Invalid guidance scale specfied using 6 as default`
                );
            const guidanceScale = !isNaN(
                Number(options.g || options.guidancescale)
            )
                ? min(10, options.g || options.guidancescale)
                : 6;
            m.react(global.reactions.loading);
            const infoMsg = await conn.sendMessage(
                from,
                {
                    text: `Image generation process requsted by ${pushname}`,
                    contextInfo: { mentionedJid: [sender] }
                },
                { quoted: m }
            );
            stablediff
                .create(prompt, negative_prompt, guidanceScale)
                .then(images => {
                    if (images && images.length > 0) {
                        m.react(global.reactions.upload);
                        conn.edite(infoMsg, {
                            text: `Uploding Images generated images`
                        });
                        let i = 1;
                        images.forEach(image => {
                            conn.edite(infoMsg, {
                                text: `Uploding Images ${i++} of ${
                                    images.length
                                }`
                            });
                            reply(JSON.stringify(image));
                            conn.sendMessage(from, {
                                image: { url: image },
                                contextInfo: { mentionedJid: [sender] }
                            });
                        });
                        conn.edite(infoMsg, {
                            text: `Sucessfully generated ${
                                images.length
                            } image${images.length > 1 ? "s" : ""}`
                        });
                        const caption = `*Prompt:* ${prompt}${
                            negative_prompt
                                ? "\n*Negative Prompt:* " + negative_prompt
                                : ""
                        }`;
                        m.react(global.reactions.success);
                        return conn.buttonMessage(
                            from,
                            {
                                caption: caption,
                                footer: config.FOOTER,
                                contextInfo: {
                                    isForwarded: false
                                },
                                ...(config.BUTTON
                                    ? {
                                          buttons: [
                                              {
                                                  type: 1,
                                                  buttonId: `${prefix}imagine ${q}`,
                                                  buttonText: {
                                                      displayText:
                                                          "Regenerate 🔁"
                                                  }
                                              }
                                          ]
                                      }
                                    : {})
                            },
                            { quoted: mek }
                        );
                    }
                    m.react(global.reactions.error);
                })
                .catch(err => {
                    if (
                        err.response &&
                        err.response.data.includes("exceeded your GPU quota")
                    ) {
                        m.react(global.reactions.overload);
                        return conn.replyad(global.responses.overload);
                    }
                    throw err;
                });
        } catch (e) {
            m.sendError(e, "Error during image generation.");
        }
    }
);

cmd(
    {
        pattern: "bingimgai",
        alias: ["bingimg"],
        react: "📷",
        desc: "Generate Images using Bing AI",
        category: "ai",
        use: ".bingimgai <prompt>",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        { from, quoted, prefix, args, q, pushname, isMe, isdev, reply }
    ) => {
        try {
            if (!q && !m.quoted?.body)
                return await reply("*Give me a prompt to generate images*");
            let text = q;
            if (m.quoted) {
                text = m.quoted.body;
            }
            let response = await fetchJson(
                global.getApi("betabotz", "/api/search/bing-img", {
                    text,
                    apikey: randChoice(global.APIKEYS.betabotz)
                })
            );
            if (
                response &&
                response.result &&
                Array.isArray(response.result) &&
                response.result?.length > 0
            ) {
                m.react(global.reactions.upload);
                for (let i = 0; i < response.result.length; i++) {
                    await conn.sendMessage(
                        from,
                        {
                            image: { url: response.result[i] }
                            // caption: `${config.FOOTER}`
                        },
                        { quoted: mek }
                    );
                }
                m.react(global.reactions.success);
                const txt = `*Prompt*: ${q.trim()}\n*Results*: ${
                    response.result.length
                }`;
                await conn.buttonMessage(
                    from,
                    {
                        text: txt,
                        contextInfo: {
                            isForwarded: false
                        },
                        footer: config.FOOTER,
                        ...(config.BUTTON
                            ? {
                                  buttons: [
                                      {
                                          type: 1,
                                          buttonId: `${prefix}bingimgai ${q}`,
                                          buttonText: {
                                              displayText: "Regenerate 🔁"
                                          }
                                      }
                                  ]
                              }
                            : {})
                    },
                    { quoted: mek }
                );
            } else if (response.result.length == 0) {
                m.react(global.reactions.notFound);
                reply("No images found for the given prompt");
            } else if (!response.status) {
                if (isMe || isdev)
                    m.sendError(
                        new Error("Invalid ApiKey"),
                        "can't get response check *Apikey*.\n> apikey limit could have been reached"
                    );
                else
                    m.sendError(
                        new Error("Invalid ApiKey"),
                        "*Server is busy. Try again later.!*"
                    );
            }
        } catch (e) {
            m.sendError(e, "Unable to generate images to the given prompt");
        }
    }
);

cmd(
    {
        pattern: "3dmodel",
        alias: [
            "imagine3d",
            "3dimage",
            "3ddiffusion",
            "3d-diffusion",
            "diffusion-3d"
        ],
        react: "📷",
        desc: "It convert given text to 3d image using AI.",
        category: "ai",
        use: ".3dmodel  <prompt> or .3dmodel <prompt> | <nagative_prompt>",
        filename: __filename
    },
    async (conn, mek, m, { from, l, prefix, quoted, args, q, isMe, reply }) => {
        try {
            if (!q && !m.quoted?.body)
                return reply(
                    `*Example: ${prefix}3dmodel cartoon woman,hair cut color red,full body*`
                );
            let prompt = m.quoted?.body ? m.quoted.body : q;
            let negative_prompt = "";
            if (q.split("|").length > 1) {
                prompt = q.split("|")[0].trim();
                negative_prompt = q.split("|")[1].trim();
            }
            //m.react(global.THEME.reactions.loading);
            let result = await fetchJson(
                global.getApi("itzpire", `/ai/3dmodel`, {
                    prompt,
                    negative_prompt
                })
            );
            if (result.status === "success") {
                await conn.buttonMessage(
                    from,
                    {
                        image: { url: result.result },
                        caption: `*Prompt:* ${prompt}${
                            negative_prompt
                                ? "\n*Negative prompt:* " + negative_prompt
                                : ""
                        }`,
                        footer: config.FOOTER,
                        contextInfo: {
                            isForwarded: false
                        },
                        ...(config.BUTTON
                            ? {
                                  buttons: [
                                      {
                                          type: 1,
                                          buttonId: `${prefix}imagine ${q}`,
                                          buttonText: {
                                              displayText: "Regenerate 🔁"
                                          }
                                      }
                                  ]
                              }
                            : {})
                    },
                    { quoted: mek }
                );
                await m.react(global.THEME.reactions.success);
            } else
                m.sendError(
                    new Error("Something wrong with endpoint."),
                    "*Server is busy. Try again later.!*"
                );
        } catch (e) {
            m.sendError(e, "*Server is busy. Try again later.!*");
        }
    }
);

cmd(
    {
        pattern: "remini",
        react: "📷",
        category: "ai",
        desc: "remini AI image upscaler",
        use: ".remini",
        filename: __filename
    },
    async (conn, msg, m, { q, prefix, from }) => {
        const image = await getImageFromMsg(m);
        const url = q || m.quoted?.body;
        let imageUrl = url;
        if (!(image || isUrl(url)))
            return conn.replyad(
                "*Reply/quote an image or image url to upscale.*"
            );
        try {
            if (image) {
                const { url: imgUrl } =
                    await fileUploader.uploadFileWithMimeType(
                        image,
                        null,
                        "image/jpeg"
                    );
                imageUrl = imgUrl;
            }
            const res = await getBuffer(
                global.getApi("vreden", "/api/remini", { url: imageUrl })
            );
            const caption = `Upscaled Image`;
            if (res) {
                await conn.buttonMessage(
                    from,
                    {
                        image: res,
                        caption: caption,
                        footer: config.FOOTER,
                        contextInfo: {
                            isForwarded: false
                        },
                        ...(config.BUTTON
                            ? {
                                  buttons: [
                                      {
                                          type: 1,
                                          buttonId: `${prefix}remini ${imageUrl}`,
                                          buttonText: {
                                              displayText: "Regenerate 🔁"
                                          }
                                      }
                                  ]
                              }
                            : {})
                    },
                    msg
                );
                await m.react(global.THEME.reactions.success);
            }
        } catch (e) {
            m.sendError(e);
        }
    }
);

//<<---------todo: look for apis-------------->>

cmd(
    {
        pattern: "colorize",
        react: "🎨",
        alias: ["colorizer", "tocolour", "colourize"],
        desc: "colourise a decolorised (black and white) image",
        category: "ai",
        use: ".colorize <reply black & white image>",
        filename: __filename
    },
    async (conn, mek, m, { from, q, reply }) => {
        try {
            const imageBuffer = await m.getImage();
            if (imageBuffer) {
                fileUploader.uploadFromBuffer(imageBuffer).then(async url => {
                    try {
                        await conn.sendMessage(
                            from,
                            {
                                image: await getBuffer(
                                    "https://vihangayt.me/tools/colorize?url=" +
                                        url
                                ),
                                caption: config.FOOTER
                            },
                            { quoted: mek }
                        );
                    } catch (e) {
                        m.sendError(e, "*Error occored uploading image*");
                    }
                });
            } else return reply("*Reply to a photo !*");
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "enhance",
        react: "↗️",
        alias: ["imgenhance", "quality", "qualityimage", "tohd"],
        desc: "imporve image quality",
        category: "ai",
        use: ".enhance <reply low quality image>",
        filename: __filename
    },
    async (conn, mek, m, { from, reply }) => {
        try {
            const imageBuffer = await m.getImage();
            if (imageBuffer) {
                fileUploader.uploadFromBuffer(imageBuffer).then(async url => {
                    await conn.sendMessage(
                        from,
                        {
                            image: await getBuffer(
                                "https://vihangayt.me/tools/enhance?url=" + url
                            ),
                            caption: config.FOOTER
                        },
                        { quoted: mek }
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
        pattern: "toanime",
        react: "🏮",
        alias: ["imgtoanime", "animeimg"],
        desc: "It convert given image to anime image.",
        category: "ai",
        use: ".toanime <reply image>",
        filename: __filename
    },
    async (conn, mek, m, { from, reply }) => {
        try {
            const imageBuffer = await m.getImage();
            if (imageBuffer) {
                fileUploader.uploadFromBuffer(imageBuffer).then(async url => {
                    try {
                        await conn.sendMessage(
                            from,
                            {
                                image: await getBuffer(
                                    "https://vihangayt.me/tools/toanime?url=" +
                                        url
                                ),
                                caption: config.FOOTER
                            },
                            { quoted: mek }
                        );
                    } catch (e) {
                        m.sendError(e, "*Error occored uploading image*");
                    }
                });
            } else return reply("*Reply to a photo !*");
        } catch (e) {
            m.sendError(e);
        }
    }
);

//--------------------------

// Unstable features
cmd(
    {
        pattern: "pixelart",
        alias: ["pixelart", "pixel"],
        react: "📷",
        desc: "Generate pixelart style images using AI - unstable",
        category: "ai",
        use: ".pixel <prompt>",
        unstable: true,
        filename: __filename
    },
    async (conn, mek, m, { from, prefix, q, reply }) => {
        try {
            if (!q && !m.quoted?.body)
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            let text = q;
            if (m.quoted) {
                text = m.quoted.body;
            }
            let image = await fetchJson(
                global.getApi("itzpire", "/ai/pixelart"),
                {
                    params: {
                        prompt: text
                    }
                }
            );
            let caption = `*Prompt:* ${text}`;
            if (image && image.status != "error") {
                //const imagePath = await saveBuffer(image);
                // image = fs.readFileSync(imagePath);
                await conn.buttonMessage(
                    from,
                    {
                        image: { url: image.result },
                        caption: caption,
                        footer: config.FOOTER,
                        contextInfo: {
                            isForwarded: false
                        },
                        ...(config.BUTTON
                            ? {
                                  buttons: [
                                      {
                                          type: 1,
                                          buttonId: `${prefix}pixel ${text}`,
                                          buttonText: {
                                              displayText: "Regenerate 🔁"
                                          }
                                      }
                                  ]
                              }
                            : {})
                    },
                    mek
                );
                await m.react(global.THEME.reactions.success);
                //fs.unlinkSync(imagePath);
            }
        } catch (e) {
            m.sendError(e, "Error during image generation. try again later");
        }
    }
);

// old enpoint: itzpire /ai/animediff2
cmd(
    {
        pattern: "animediff",
        alias: ["animediffusion", "anime-diffusion"],
        react: "📷",
        desc: "Generate anime style images using AI - unstable",
        category: "ai",
        use: ".animediff <prompt>",
        unstable: true,
        filename: __filename
    },
    async (conn, mek, m, { from, prefix, q, reply }) => {
        try {
            if (!q && !m.quoted?.body)
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            let text = q;
            if (m.quoted) {
                text = m.quoted.body;
            }
            let image = await getBuffer(
                global.getApi("nexoracle", "ai/anime-gen"),
                {
                    params: {
                        prompt: text,
                        apikey: randChoice(global.APIKEYS.nexoracle)
                    }
                }
            );
            let caption = `*Prompt:* ${text}`;
            if (Buffer.isBuffer(image)) {
                //const imagePath = await saveBuffer(image);
                // image = fs.readFileSync(imagePath);
                await conn.buttonMessage(
                    from,
                    {
                        image: image,
                        caption: caption,
                        footer: config.FOOTER,
                        contextInfo: {
                            isForwarded: false
                        },
                        ...(config.BUTTON
                            ? {
                                  buttons: [
                                      {
                                          type: 1,
                                          buttonId: `${prefix}animediff ${text}`,
                                          buttonText: {
                                              displayText: "Regenerate 🔁"
                                          }
                                      }
                                  ]
                              }
                            : {})
                    },
                    mek
                );
                await m.react(global.THEME.reactions.success);
                //fs.unlinkSync(imagePath);
            }
        } catch (e) {
            m.sendError(e, "Error during image generation. try again later");
        }
    }
);

// old endpoint itzpire /ai/mangadiff
cmd(
    {
        pattern: "mangadiff",
        alias: ["mangadiffusion", "manga-diffusion"],
        react: "📷",
        desc: "Generate anime manga style images using AI - unstable",
        category: "ai",
        use: ".manga <prompt>",
        unstable: true,
        filename: __filename
    },
    async (conn, mek, m, { from, prefix, q, reply }) => {
        try {
            if (!q && !m.quoted?.body)
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            let text = q;
            if (m.quoted) {
                text = m.quoted.body;
            }
            let image = await getBuffer(
                global.getApi("nexoracle", "/ai/manga-diffusion"),
                {
                    params: {
                        prompt: text,
                        apikey: randChoice(global.APIKEYS.nexoracle)
                    }
                }
            );
            let caption = `*Prompt:* ${text}`;
            if (Buffer.isBuffer(image)) {
                //const imagePath = await saveBuffer(image);
                // image = fs.readFileSync(imagePath);
                await conn.buttonMessage(
                    from,
                    {
                        image: image,
                        caption: caption,
                        footer: config.FOOTER,
                        contextInfo: {
                            isForwarded: false
                        },
                        ...(config.BUTTON
                            ? {
                                  buttons: [
                                      {
                                          type: 1,
                                          buttonId: `${prefix}mangadiff ${text}`,
                                          buttonText: {
                                              displayText: "Regenerate 🔁"
                                          }
                                      }
                                  ]
                              }
                            : {})
                    },
                    mek
                );
                await m.react(global.THEME.reactions.success);
                //fs.unlinkSync(imagePath);
            }
        } catch (e) {
            m.sendError(e, "Error during image generation. try again later");
        }
    }
);
