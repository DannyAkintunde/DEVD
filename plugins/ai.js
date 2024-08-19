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
    fetchJson
} = require("../lib/functions");
const cheerio = require("cheerio");
const axios = require("axios");
const vm = require("vm");
const { trans, gpt4 } = require("../lib/functions.js");
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

var desct = "BARD AI chat";
if (config.LANG === "SI") desct = "එය ඔබ ලබා දුන් දේ සඳහා bard AI මත සොයයි.";
else desct = "It search on bard ai for what you provided.";
var needus = "";
if (config.LANG === "SI")
    needus = "*කරුණාකර මට bard AI හි සෙවීමට වචන ලබා දෙන්න !*";
else needus = "*Please give me words to search on bard ai !*";
var cantf = "";
if (config.LANG === "SI")
    cantf = "*Server එක කාර්යබහුලයි. පසුව නැවත උත්සාහ කරන්න. !*";
else cantf = "*Server is busy. Try again later.!*";

cmd(
    {
        pattern: "bard",
        alias: ["bardai", "gbard", "googlebard", "googleai", "ai2"],
        react: "👾",
        desc: desct,
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
            if (!q) return reply(needus);
            let apilist = await fetchJson(
                "https://gist.githubusercontent.com/vihangayt0/7dbb65f6adfe21538f7febd13982569a/raw/apilis.json"
            );
            let list = apilist.users;
            let apikey = list[Math.floor(Math.random() * list.length)];
            const dataget = await fetchJson(
                apilist.xz + "api/bard?text=" + q + "&apikey=" + apikey
            );
            return await reply(dataget.content);
        } catch (e) {
            try {
                const dataget = await fetchJson(
                    "https://api.akuari.my.id/ai/gbard?chat=" + q
                );
                return await reply(dataget.respon);
            } catch (e) {
                reply(cantf);
                l(e);
            }
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
            if (!q) return reply("Need a keyword");
            var res = (
                await fetchJson(
                    "https://api.yanzbotz.my.id/api/ai/blackbox?query=" + q
                )
            ).result;

            return await reply(res);
        } catch (e) {
            reply("Unable to generate");
            l(e);
        }
    }
);

cmd(
    {
        pattern: "bingimgai",
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
            if (!q) return await reply("*Give me a prompt to generate images*");
            let response = await fetchJson(
                "https://api.yanzbotz.my.id/api/text2img/bing-image?prompt=" +
                    q +
                    "&apiKey=vihangayt0"
            );
            if (
                response &&
                response.result &&
                Array.isArray(response.result) &&
                response.result.length > 0
            ) {
                for (let i = 0; i < response.result.length; i++) {
                    await conn.sendMessage(
                        from,
                        {
                            image: { url: response.result[i] },
                            caption:
                                `┃powered by ⬡〘${config.BOT}〙⬡┃` +
                                `\n${config.FOOTER}`
                        },
                        { quoted: mek }
                    );
                }
            } else {
                reply("No images found for the given prompt");
            }
        } catch (e) {
            reply("Unable to generate images to the given prompt");
            l(e);
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
    async (conn, mek, m, { args, reply, l }) => {
        if (!args) return reply("Yes, i'm listening to you.");
        try {
            const message = await trans(args.join(" "), {
                to: "en"
            });
            l(message);
            fetch(
                `http://api.brainshop.ai/get?bid=182418&key=UQXAO1yyrPLRnhf6&uid=[uid]&msg=${message}`
            )
                .then(response => response.json())
                .then(data => {
                    const botResponse = data.cnt;
                    l(botResponse);

                    trans(botResponse, { to: config.LANG.toLowerCase() })
                        .then(translatedResponse => {
                            reply(translatedResponse);
                        })
                        .catch(error => {
                            console.error(
                                "Error when translating into " +
                                    config.LANG +
                                    " :",
                                error
                            );
                            reply(`Error when translating into ${config.LANG}`);
                        });
                })
                .catch(error => {
                    console.error("Error requesting BrainShop :", error);
                    reply("Error requesting BrainShop");
                });
        } catch (e) {
            reply("oops an error : " + e);
            console.error("oops an error :", e);
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
    async (conn, mek, m, { args, reply, l, from }) => {
        try {
            if (!args || args.length === 0) {
                return reply(
                    `Please enter the necessary information to generate the image.`
                );
            }
            const image = args.join(" ");
            const response = await axios.get(
                `https://itzpire.com/ai/dalle?prompt=${image}`
            );

            const data = response.data;
            let caption = `┃powered by ⬡〘TKM MD〙⬡┃`;
            +`\n${config.FOOTER}`;

            if (data.code == 200) {
                const imageUrl = data.result;
                conn.sendMessage(
                    from,
                    { image: { url: imageUrl }, caption: caption },
                    { quoted: mek }
                );
            } else {
                reply("Error during image generation.");
            }
        } catch (error) {
            console.error(
                "Error:",
                error.message ||
                    "An error occorred while processing your request"
            );
            m.react(global.THEME.reactions.error)
            reply("Oops, an error occurred while processing your request");
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
            console.error(
                "Error:",
                error.message ||
                    "An error occorred while processing your request"
            );
            reply("Oops, an error occurred while processing your request.");
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
    async (conn, mek, m, { args, reply, from }) => {
        try {
            if (!args[0]) return await reply("ask something");
            const msg = await conn.sendMessage(
                from,
                { text: "thinking......" },
                { quoted: mek }
            );
            res = await gpt4(args.join(" "));
            if (res.status === 200) {
                await conn.sendMessage(
                    from,
                    { text: res.reply, edit: msg.key },
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
            reply(`An error occored when generating responce: ${e}`);
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
            l(`an error occoured at :${e}`);
            return reply("an error occoured genrating prompt");
        }
    }
);

var desct = "";
if (config.LANG === "SI")
    desct = "එය ලබා දී ඇති text එකක් ai image එකක් බවට පරිවර්තනය කරයි.";
else desct = "It convert given text to ai image.";
var imgmsg = "";
if (config.LANG === "SI")
    imgmsg = "*උදාහරණයක්: .imagine woman,hair cut collor red,full body,bokeh*";
else imgmsg = "*Example: .imagine woman,hair cut collor red,full body,bokeh*";
var cantf = "";
if (config.LANG === "SI")
    cantf = "*Server එක කාර්යබහුලයි. පසුව නැවත උත්සාහ කරන්න. !*";
else cantf = "*Server is busy. Try again later.!*";

cmd(
    {
        pattern: "imagine",
        alias: ["texttoimage", "toimage", "aiimage"],
        react: "🤖",
        desc: desct,
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
            if (!q) return reply(imgmsg);
            let prompt = q;
            let negative_prompt = "";
            if (q.split("|").lenght > 1) {
                prompt = q.split("|")[0].trim();
                negative_prompt = q.split("|")[1].trim();
            }
            let result = await fetchJson(
                `https://itzpire.com/ai/stablediffusion-2.1?prompt=${prompt}&negative_prompt=${negative_prompt}`
            );
            if (result.status === "success") {
                return await conn.sendMessage(
                    from,
                    {
                        image: { url: result.result },
                        caption: `*Prompt:* ${prompt}\n${config.FOOTER}`
                    },
                    { quoted: mek }
                );
            } else reply(cantf);
        } catch (e) {
            reply(global.THEME.responses.error);
            l(e);
        }
    }
);
