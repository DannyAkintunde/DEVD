const config = require("../config");
const util = require("util");
const google = require("googlethis");
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
        pattern: "dictionary",
        alias: ["dict"],
        react: "",
        desc: "Gets the definition of a word.",
        use: ".dictionary",
        category: "search",
        filename: __filename
    },
    async (conn, m, mek, { q, prefix, command, reply }) => {
        let text = q;
        if (m.quoted) {
            text = m.quoted.body
                .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                .trim();
        }
        if (!text) return reply("I need a word to fetch the definition for.");

        try {
            const options = {
                additional_params: { hl: config.LANG.toLocaleLowerCase() }
            };
            const { dictionary } = await google.search(
                `define ${text}`,
                options
            );

            if (!dictionary || Object.keys(dictionary).length === 0) {
                return reply(`No definition found for word: ${text}`);
            }

            const result = `📖 Word: ${dictionary.word}
📌 Phonetic: ${dictionary.phonetic || "N/A"}
📚 Definitions:
${dictionary.definitions.map(def => "- " + def).join("\n")}

📝 Examples:
${
    dictionary.examples?.map(exp => "- " + exp).join("\n") ||
    "No examples available."
}`;

            await reply(result);
            m.replyAud({ url: dictionary.audio }, m.chat, {
                mentions: [m.sender],
                ptt: true
            });
        } catch (e) {
            m.sendError(e, `An error occurred while fetching word data.`);
        }
    }
);

cmd(
    {
        pattern: "wabeta",
        alias: ["wabetainfo", "betawa"],
        react: "✔️",
        desc: "It gives whatsapp beta news.",
        category: "search",
        use: ".wabeta"
    },
    async (conn, mek, m, { from }) => {
        try {
            const data = (
                await fetchJson("https://vihangayt.me/details/wabetainfo")
            ).data;
            let info = `*🥏 Title :* ${data.title}
*📅 Date :* ${data.date}
*🖥️ Platform :* ${data.platform}
*🔗 URL :* ${data.url}
*🗞️ Short Desc :*
${data.shortdesc}

*ℹ️ FAQ*

*❓ Question :* ${data.faq[0].question}
*👨🏻‍💻 Answer :* ${data.faq[0].answer}

*❓ Question :* ${data.faq[1].question}
*👨🏻‍💻 Answer :* ${data.faq[1].answer}

*❓ Question :* ${data.faq[2].question}
*👨🏻‍💻 Answer :* ${data.faq[2].answer}

*❓ Question :* ${data.faq[3].question}
*👨🏻‍💻 Answer :* ${data.faq[3].answer}

*📰 Full Desc :*
${data.fulldesc}`;
            return await conn.sendMessage(
                from,
                { image: { url: data.image }, caption: info },
                { quoted: mek }
            );
        } catch (e) {
            m.sendError(e, cantf);
        }
    }
);

cmd(
    {
        pattern: "lyrics",
        alias: ["lyric"],
        react: "🎙️",
        desc: "It gives lyrics of given song name",
        category: "search",
        use: ".lyric <song name>",
        filename: __filename
    },
    async (conn, mek, m, { from, q, pushname, reply }) => {
        try {
            if (!q) return reply("*Please give me a song name. !*");
            const { data: result } = await fetchJson(
                "https://itzpire.com/search/lyrics?query=" + q
            );
            if (result.lyrics) {
                let response = `
   *LYRICS SEARCH*
   
*${result.title}*
_${result.album}_


${result.lyrics}

└───────────◉`;
                return await conn.sendMessage(
                    from,
                    {
                        image: { url: result.thumb },
                        caption: response,
                        contextInfo: {
                            mentionedJid: [""],
                            groupMentions: [],
                            externalAdReply: {
                                title: `「 LYRICS SEARCH 」`,
                                body: result.title,
                                mediaType: 1,
                                sourceUrl: global.link,
                                thumbnailUrl: config.LOGO,
                                renderLargerThumbnail: false,
                                showAdAttribution: true
                            }
                        }
                    },
                    { quoted: mek }
                );
            } else reply("*I cant find lyrics of this song !*");
        } catch (e) {
            m.sendError(e);
        }
    }
);
