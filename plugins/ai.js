const config = require("../config");
const fg = require("api-dylux");
const { cmd, commands } = require("../command");
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
    randChoice,
    text2prompt,
    bufferImg2Url
} = require("../lib/functions");
const cheerio = require("cheerio");
const axios = require("axios");
const vm = require("vm");
const { trans } = require("../lib/functions.js");
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

cmd(
    {
        pattern: "bard",
        alias: ["bardai", "gbard", "googlebard", "googleai", "ai2"],
        react: "👾",
        desc: "It search on bard ai for what you provided.",
        category: "ai",
        use: ".bard ha",
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
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isdev,
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
            if (!q)
                return reply("*Please give me words to search on bard ai !*");
            let response = await fetchJson(
                `https://api.yanzbotz.my.id/api/ai/bard?query=${q}&apiKey=${randChoice(
                    global.APIKEYS.yanz
                )}`
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
        pattern: "blackbox",
        alias: ["bb"],
        react: "👾",
        desc: "Blackbox ai chat",
        category: "ai",
        use: ".blackbox ha",
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
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isdev,
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
            if (!q) return reply("*Please give me words!*");
            let response = await fetchJson(
                `https://itzpire.com/ai/blackbox-ai?q=${q}`
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
            isdev,
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
            if (!q) return await reply("*Give me a prompt to generate images*");
            let response = await fetchJson(
                `https://api.betabotz.eu.org/api/search/bing-img?text=${q}&apikey=${randChoice(
                    global.APIKEYS.betabotz
                )}`
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
        pattern: "tkm",
        alias: ["ai", "bot"],
        react: "📡",
        desc: "A simple chatbot AI chat",
        category: "ai",
        use: ".tkm <prompt>",
        filename: __filename
    },
    async (conn, mek, m, { args, reply, l, pushname, from }) => {
        const payload = `you are an ai chatbot created by TKM INC,
            your developers are Akintunde Daniel popularly known as Danny and Takudzwa popularly know as Tkm ,lord tkm or Cod3Uchiha,
            you are implimebted into a whatsapp bot named TKM-BOT,
            your name is TKM ai,
            you are currenty being asked a question by ${pushname},
            if a question us beyond your intelect give you user you debs contact,
            your dev contact info are Danny: +2348098309204[whatsapp number] and TKM: +263785028126[whatsapp number],
            you are to act like ${global.THEME.ai.identity}, you are also to shoy chracter similar to ${global.THEME.ai.character} also try to put some emojis in your response similar to that of this character when required,
            for updates about you or TKM-BOT check our whatsapp channel ${global.link}`;
        if (!args) return reply("Yes, i'm listening to you.");
        try {
            const message = await trans(args.join(" "), {
                to: "en"
            });
            fetch(
                `https://itzpire.com/ai/gpt-logic?q=${message}&logic=${payload}&chat_id=${from}&realtime=true`
            )
                .then(response => response.json())
                .then(data => {
                    const botResponse = data.result;
                    trans(botResponse, { to: config.LANG.toLowerCase() })
                        .then(translatedResponse => {
                            m.react("🤖");
                            reply(translatedResponse);
                        })
                        .catch(error => {
                            m.sendError(
                                error,
                                `Error when translating into ${config.LANG}`
                            );
                        });
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
        pattern: "dalle",
        react: "📷",
        desc: "Generate images using DALLE",
        category: "ai",
        use: ".dalle <prompt>",
        filename: __filename
    },
    async (conn, mek, m, { args, reply, l, from, prefix }) => {
        try {
            if (!args || args.length === 0) {
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            }
            const image = args.join(" ");
            //m.react(global.THEME.reactions.loading)
            const response = await axios.get(
                `https://itzpire.com/ai/dalle?prompt=${image}`
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
            l,
            prefix,
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
            if (!q)
                return reply(
                    `Please enter the necessary information to generate the image.`
                );

            let image = await getBuffer(
                `https://api.yanzbotz.my.id/api/text2img/dalle-3`,
                {
                    params: {
                        prompt: q,
                        apiKey: randChoice(global.APIKEYS.yanz)
                    }
                }
            );
            let caption = `*Prompt:* ${q}`;
            if (image && image?.status != 404) {
                await conn.buttonMessage(
                    from,
                    {
                        image: await bufferImg2Url(image),
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
                await m.react(global.THEME.reactions.success);
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
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isdev,
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
            if (!q)
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            let image = await getBuffer(
                `https://api.yanzbotz.my.id/api/text2img/midjourney`,
                {
                    params: {
                        prompt: q,
                        apiKey: randChoice(global.APIKEYS.yanz)
                    }
                }
            );
            let caption = `*Prompt:* ${q}\n${config.FOOTER}`;
            if (image && image?.status != 404) {
                await conn.buttonMessage(
                    from,
                    {
                        image: await bufferImg2Url(image),
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
        pattern: "gpt",
        alias: ["chatgpt"],
        react: "📡",
        desc: "ChatGPT AI chat",
        category: "ai",
        use: ".gpt <prompt>",
        filename: __filename
    },
    async (conn, mek, m, { args, reply, l }) => {
        try {
            if (!args || args.length === 0) {
                return reply(`Please ask a question.`);
            }
            const question = args.join(" ");
            const response = await axios.get(
                `https://itzpire.com/ai/gpt?model=gpt-3.5-turbo&q=${question}`
            );

            const data = response.data.data;
            if (data) {
                reply(data.response);
            } else {
                reply("Error during response generation.");
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
        use: ".gpt <prompt>",
        filename: __filename
    },
    async (conn, mek, m, { reply, from, q }) => {
        try {
            if (!q) return await reply("ask something");
            const msg = await conn.sendMessage(
                from,
                { text: "thinking......" },
                { quoted: mek }
            );
            res = await fetchJson(
                `https://itzpire.com/ai/gpt?model=gpt-4-32k-0314&q=${q}`
            );
            if (res.status === "success") {
                await conn.sendMessage(
                    from,
                    { text: res.data.response, edit: msg.key },
                    { quoted: mek }
                );
                await mek.react("🤖");
            } else {
                await conn.sendMessage(
                    from,
                    {
                        text: "an error occred generating resopnce",
                        edit: msg.key
                    },
                    { quoted: mek }
                );
                await mek.react("⚠️");
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
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isdev,
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
            if (!q) return reply("*Please give me words !*");
            const msg = await conn.sendMessage(
                from,
                { text: "thinking......" },
                { quoted: mek }
            );
            let response = await fetchJson(
                `https://api.yanzbotz.my.id/api/ai/gpt-4o?query=${q}&system=YanzBotz-MD&apiKey=${randChoice(
                    global.APIKEYS.yanz
                )}&id=${from}`
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
                    .catch(
                        e => m.sendError(e, "*Error translating response*"),
                        msg.key
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
        pattern: "text2prompt",
        alias: ["t2p"],
        react: "📡",
        desc: "Generate AI prompts from text",
        category: "ai",
        use: ".text2prompt <prompt>",
        filename: __filename
    },
    async (conn, mek, m, { args, reply, l, prefix }) => {
        if (!args[0])
            return await reply(
                `text argument is required \n> try ${prefix}text2prompt a sad cat`
            );

        const text = await trans(args.join(" "), { to: "en" });

        await text2prompt(text).then(sus).catch(err);

        function sus(res) {
            if (res.status)
                return reply(
                    trans(res.prompt),
                    config.LANG.toLocaleLowerCase()
                );
            else reply("an error occoured genrating prompt");
        }
        function err(e) {
            m.sendError(e, "an error occoured genrating prompt");
        }
    }
);

cmd(
    {
        pattern: "imagine",
        alias: ["texttoimage", "toimage", "aiimage", "stablediffusion"],
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
            if (!q)
                return reply(
                    "*Example: .imagine woman,hair cut collor red,full body,bokeh*"
                );
            let prompt = q;
            let negative_prompt = "";
            if (q.split("|").length > 1) {
                prompt = q.split("|")[0].trim();
                negative_prompt = q.split("|")[1].trim();
            }
            //m.react(global.THEME.reactions.loading);
            let result = await fetchJson(
                `https://itzpire.com/ai/stablediffusion-2.1?prompt=${prompt}&negative_prompt=${negative_prompt}`
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
            } else reply("*Server is busy. Try again later.!*");
        } catch (e) {
            m.sendError(e, "*Server is busy. Try again later.!*");
        }
    }
);
