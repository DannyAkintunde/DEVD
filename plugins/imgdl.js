const config = require("../config");
const { cmd, commands } = require("../command");
const parseCommand = require("../lib/commands/commandParser");
const { sleep } = require("../lib/functions");
const { image: googleImage } = require("googlethis");
const { randomUUID } = require("crypto");

const googleImageSearchs = {};

cmd(
    {
        pattern: "img",
        alias: ["gimg", "googleimage"],
        react: "✔️",
        desc: "Google image search.",
        category: "search",
        use: ".wabeta"
    },
    async (
        conn,
        mek,
        m,
        { q, from, prefix, command, sender, isSuperUser, reply }
    ) => {
        let text = q;
        if (m.quoted) {
            text = m.quoted.body;
            text = text
                .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                .trim();
        }
        if (!text) return await reply("*Please give me a query to search !!*");
        const commandStr = `${prefix}${command} ${text}`;
        const parsedCommand = parseCommand(commandStr);
        const options = parsedCommand.options;
        const page = parseInt(options.page || options.p) || 0;
        if (isNaN(page) || page < 0)
            return reply("Page must be an integer greater than or equal to 0.");
        const resultLength = parseInt(options.l) || 5;
        if (isNaN(resultLength) || resultLength > 20 || resultLength < 1)
            return reply("Length must be an integer betwewn 1-20.");
        let unsafe = (options.unsafe || options.us) && !config.NSFW;
        if (unsafe && !isSuperUser) {
            unsafe = !unsafe;
            reply("You must be a superUser to use this option");
        }
        const safe = !(unsafe || config.NSFW);
        text = parsedCommand.args.join(" ");
        const images = await googleImage(text, { page, safe });
        const searchId = randomUUID();
        googleImageSearchs[searchId] = {
            range: resultLength,
            images: [...images],
            query: text.trim()
        };
        for (let i = 0; i < resultLength; i++) {
            const image = images[i];
            let caption = `*${image.origin?.title || "Here's your image"}*`;

            if (image.origin?.website) {
                const { width, height } = image;
                const { name, domain, url } = image.origin.website;
                caption += `\nFrom ${name || "Google"} ${
                    domain ? "[" + domain + "]" : ""
                }`;
                if (width && height) {
                    caption += `\n*Size*: ${width}x${height}`;
                }
                if (url) {
                    caption += `\n*Read more*: ${url}`;
                }
            }
            const imageMsg = await conn.sendMessage(
                from,
                {
                    contextInfo: {
                        mentionedJid: [sender]
                    },
                    image: { url: image.url },
                    caption
                },
                { quoted: mek }
            );
            await sleep(100);
        }
        const txt = `*Query*: ${text.trim()}\n*Results*: ${images.length}`;
        await conn.buttonMessage(
            from,
            {
                text: txt,
                contextInfo: {
                    isForwarded: false
                },
                footer: config.FOOTER,
                ...(true
                    ? {
                          buttons: [
                              {
                                  type: 1,
                                  buttonId: `${prefix}gimgm ${searchId} 1`,
                                  buttonText: {
                                      displayText: "More results"
                                  }
                              }
                          ]
                      }
                    : {})
            },
            { quoted: mek }
        );
    }
);

cmd(
    {
        pattern: "gimgm",
        dontAddCommandList: true,
        filename: __filename,
        category: "search"
    },
    async (conn, mek, m, { q, args, reply, from, sender, prefix }) => {
        if (!q) m.sendError(new Error("No query"));
        const [searchId, index] = args;
        if (!(searchId || parseInt(index)))
            return reply(global.responses.humanSpy);
        if (args.length > 2) reply(global.responses.humanSpy);
        const search = googleImageSearchs[searchId];
        if (!search) return reply("search expired start a new search.");
        const start = search.range * parseInt(index) - 1;
        const end = start + search.range + 1;
        const images = search.images.slice(start, end);
        images.forEach(async image => {
            let caption = `*${image.origin?.title || "Here's your image"}*`;

            if (image.origin?.website) {
                const { width, height } = image;
                const { name, domain, url } = image.origin.website;
                caption += `\nFrom ${name || "Google"} ${
                    domain ? "[" + domain + "]" : ""
                }`;
                if (width && height) {
                    caption += `\n*Size*: ${width}x${height}`;
                }
                if (url) {
                    caption += `\n*Read more*: ${url}`;
                }
            }
            const imageMsg = await conn.sendMessage(
                from,
                {
                    contextInfo: {
                        mentionedJid: [sender]
                    },
                    image: { url: image.url },
                    caption
                },
                { quoted: mek }
            );
            await sleep(100);
        });
        const txt = `*Query*: ${search.query}\n*Sent*: ${images.length}`;
        await conn.buttonMessage(
            from,
            {
                text: txt,
                contextInfo: {
                    isForwarded: false
                },
                footer: config.FOOTER,
                ...(true
                    ? {
                          buttons: [
                              {
                                  type: 1,
                                  buttonId: `${prefix}gimgm ${searchId} ${
                                      index + 1
                                  }`,
                                  buttonText: {
                                      displayText: "More results"
                                  }
                              }
                          ]
                      }
                    : {})
            },
            { quoted: mek }
        );
    }
);
