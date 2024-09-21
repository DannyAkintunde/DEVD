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
    saveBuffer,
    convertBufferToJpeg,
    trans
} = require("../lib/functions");
const fs = require("fs");
const fileType = require("file-type");
const path = require("path")
const cheerio = require("cheerio");
const axios = require("axios");
const vm = require("vm");
const { img2url } = require("@blackamda/telegram-image-url");
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

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
                `https://api.yanzbotz.live/api/ai/bard?query=${encodeURIComponent(q)}&apiKey=${randChoice(
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
        use: ".blackbox hey",
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
                `https://itzpire.com/ai/blackbox-ai?q=${encodeURIComponent(q)}`
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
            if (!q && !m.quoted?.body) return await reply("*Give me a prompt to generate images*");
            let text = q;
            if (m.quoted) {
                text = m.quoted.body;
            }
            let response = await fetchJson(
                `https://api.betabotz.eu.org/api/search/bing-img?text=${encodeURIComponent(text)}&apikey=${randChoice(
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
    async (conn, mek, m, { q, reply, l, pushname, from }) => {
        const payload = `you are an ai chatbot created by TKM INC,
            your developers are Akintunde Daniel popularly known as Danny and Takudzwa popularly know as Tkm ,lord tkm or Cod3Uchiha,
            you are implimented into a whatsapp bot named TKM-BOT,
            your name is TKM ai,
            the name of the current usser is ${pushname} use it to your will,
            if a question us beyond your intelect make sure to let the user know,
            your dev contact info are Danny: +2348098309204[whatsapp number] and TKM: +263785028126[whatsapp number],
            you are to act like ${global.THEME.ai.identity}, you are also to show chracter similar to ${global.THEME.ai.character} also try to put some emojis in your response similar to that of this character when required,
            for updates about you or TKM-BOT check our whatsapp channel ${global.link}`;
        if (!q) return reply("Yes, i'm listening to you.");
        try {
            const message = await trans(q, {
                to: "en"
            });
            fetch(
                `https://itzpire.com/ai/gpt-logic?q=${encodeURIComponent(message)}&logic=${payload}&chat_id=${from}&realtime=false`
            )
                .then(response => response.json())
                .then(data => {
                    const botResponse = data.result;
                    reply(botResponse);
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
    async (conn, mek, m, { q, reply, l, from, prefix }) => {
        try {
            if (!q && !m.quoted?.body) {
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            }
            let image = q
            if (m.quoted) {
                image = m.quoted.body;
            }
            //m.react(global.THEME.reactions.loading)
            const response = await axios.get(
                `https://itzpire.com/ai/dalle?prompt=${encodeURIComponent(image)}`
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
            if (!q && !m.quoted?.body)
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            let text = q
            if (m.quoted) {
                text = m.quoted.body;
            }

            let image = await getBuffer(
                `https://api.yanzbotz.live/api/text2img/dalle-3`,
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
            if (!q && !m.quoted?.body)
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            let text = q
            if (m.quoted) {
                text = m.quoted.body;
            }
            let image = await getBuffer(
                `https://api.yanzbotz.live/api/text2img/midjourney`,
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
                // image = fs.readFileSync(imagePath);
                await conn.buttonMessage(
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
                `https://itzpire.com/ai/gpt?model=gpt-3.5-turbo&q=${encodeURIComponent(q)}`
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
        use: ".gpt4 <prompt>",
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
                `https://fastrestapis.fasturl.cloud/ai/gpt4?prompt=${encodeURIComponent(q)}&sessionId=${from}`
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
                `https://api.yanzbotz.live/api/ai/gpt-4o?query=${encodeURIComponent(q)}&system=YanzBotz-MD&apiKey=${randChoice(
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
    async (conn, mek, m, { args, reply, l, prefix }) => {
        if (!args[0])
            return await reply(
                `text argument is required \n> try ${prefix}text2prompt a sad cat`
            );
        const text = await trans(args.join(" "), { to: "en" });
        try {
            let response;
            for (let key = 0; key < global.APIKEYS.zubair.length; key++) {
                response = await fetchJson(
                    `https://api.maher-zubair.xyz/ai/prompt-gen?apikey=${global.APIKEYS.zubair[key]}&prompt=${text}`
                );
                if (response && response.status == 200) break;
                reply(JSON.stringify(response));
            }
            if (response.status == 200) {
                const result = response.result
                    ? trans(response.result, { to: config.LANG?.toLowerCase() })
                    : null;
                conn.buttonMessage(
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
                                              displayText: "Copy prompt"
                                          }
                                      }
                                  ]
                              }
                            : {})
                    },
                    { quoted: mek }
                );
            } else if (response.status == 402) {
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
            if (!q && !m.quoted?.body)
                return reply(
                    "*Example: .imagine woman,hair cut collor red,full body,bokeh*"
                );
            let prompt = m.quoted?.body ? m.quoted.body : q
            let negative_prompt = "";
            if (q.split("|").length > 1) {
                prompt = q.split("|")[0].trim();
                negative_prompt = q.split("|")[1].trim();
            }
            //m.react(global.THEME.reactions.loading);
            let result = await fetchJson(
                `https://itzpire.com/ai/stablediffusion-2.1?prompt=${encodeURIComponent(prompt)}&negative_prompt=${encodeURIComponent(negative_prompt)}`
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

cmd(
  {
    pattern: "gemini",
    react: "📡",
    category: "ai",
    desc: "Gemini AI chat",
    use: ".gemini hey there",
    filename: __filename
  },
  async (conn, mek, m, {q, reply}) => {
    const downloadPath = path.join("../", "media", "temp")
    let filename = getRandom("")
    let question = q || m.quoted?.body
    if (!question) return reply("Ask a question")
    let image = m.download(path.resolve(path.join(downloadPath, filename))) || m.quoted?.download(path.resolve(path.join(downloadPath, filename)))
    const type = await fileType.fromBuffer(image)
    filename = filename + type.ext
    let mode = "text"
    if (image) mode = "image"
    const options = {
        "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
        ...(global.APIKEYS?.fastapi ? { "x-api-key": randChoice(global.APIKEYS.fastapi) } : {})
    }
    async function handleResponse(response){
      if (response?.status == 200) {
            await conn.sendMessage(
                from,
                {
                    text: response.answer,
                    //edit: msg.key
                },
                { quoted: mek }
            );
            mek.react("🤖");
          } else if (response.status == 403) {
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
          } else if (response.status == 429) {
            m.sendError(new Error("Too Many Requests"), "Too many requests within 1 minute/daily/monthly. Please try again later")
          }
    }
    try{
      switch (mode){
      case "text":
        {
          response = fetchJson(`https://fastrestapis.fasturl.cloud/ai/gemini/chat?ask=${encodeURIComponent(question)}`, options)
          await handleResponse(response)
        }
        break;
      case "image":
        {
          filePath = path.resolve(path.join(downloadPath, filename))
          img2url(filePath).then(async url => {
            response = fetchJson(`https://fastrestapis.fasturl.cloud/ai/gemini/chat?ask=${encodeURIComponent(question)}&image=${encodeURIComponent(url)}`, options)
            await handleResponse(response)
          })
        }
        break;
    }
    } catch (e) {
      m.sendError(e)
    }
  }
  )
