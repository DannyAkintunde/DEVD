const config = require("../config");
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

cmd(
    {
        pattern: "anime",
        alias: ["animesearch", "sanime"],
        react: "⛩️",
        desc: "It gives details of given anime name.",
        category: "search",
        use: ".anime astro",
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
            if (!q) return reply("*Give me a anime name !*");
            const anu = await fetchJson(
                global.getApi("jikan", "/v4/anime", { q })
            );
            let sections = [];
            const list = {
                title: "",
                rows: []
            };
            for (let i of anu.data) {
                const row = {
                    title: `${i.title}`,
                    rowId: `${prefix}animeeg ${i.mal_id}`
                };
                list.rows.push(row);
            }
            sections.push(list);
            let listset = {
                text: `「 ${config.BOT} 」

  *ANIME SEARCH*
   
*Search Results From* ${q}`,
                footer: config.FOOTER,
                title: "",
                buttonText: "*🔢 Reply below number*",
                sections
            };
            await conn.replyList(from, listset, mek);
        } catch (e) {
            m.sendError(e, "I cant find this anime.");
        }
    }
);

cmd(
    {
        pattern: "animeeg",
        category: "anime",
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
                react: { text: "🔃", key: mek.key }
            });
            res = await fetchJson(global.getApi("jikan", `/v4/anime/${q}`));
            let txt = `*TITLE:* *${res.data.title}*\n*ENGLISH:* *${
                res.data.title_english
            }*\n*JAPANESE:* *${res.data.title_japanese}*\n*TYPE ANIME:* *${
                res.data.type
            }*\n*ADAPTER:* *${res.data.source}*\n*TOTAL EPISODE:* *${
                res.data.episodes
            }*\n*STATUS:* *${res.data.status}*\n*ONGOING:* *${
                res.data.airing ? "Ya" : "DRIS"
            }*\n*AIRED:* *${res.data.aired.string}*\n*DURATION:* *${
                res.data.duration
            }*\n*RATING:* *${res.data.rating}*\n*SCORE:* *${
                res.data.score
            }*\n*RANK:* *${res.data.rank}*\n*STUDIO:* *${
                res.data.studios[0].name
            }* `;
            conn.sendMessage(
                from,
                { image: { url: res.data.images.jpg.image_url }, caption: txt },
                { quoted: mek }
            ).catch(err => reply(""));
            await conn.sendMessage(from, {
                react: { text: "✔", key: mek.key }
            });
        } catch (e) {
            m.sendError(e, "I cant find this anime.");
        }
    }
);
