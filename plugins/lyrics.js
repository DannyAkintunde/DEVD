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
var tmsg = "";
if (config.LANG === "SI") tmsg = "*කරුණාකර මට ගීතයක නමක් දෙන්න. !*";
else tmsg = "*Please give me a song name. !*";
var descg = "";
if (config.LANG === "SI") descg = "එය ලබා දී ඇති සංගීතයේ lyrics දෙයි.";
else descg = "It gives lyrics of given song name.";
var cantscg = "";
if (config.LANG === "SI") cantscg = "*මට මේ ගීතයේ lyrics සොයාගත නොහැක !*";
else cantscg = "*I cant find lyrics of this song !*";

cmd(
    {
        pattern: "lyrics",
        alias: ["lyric"],
        react: "🎙️",
        desc: descg,
        category: "search",
        use: ".lyric <song name>",
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
            if (!q) return reply(tmsg);
            const { data: result } = await fetchJson(
                "https://itzpire.com/search/lyrics?query=" + q
            );
            if (result.lyrics) {
                let response = `
「 ${config.BOT} 」

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
            } else reply(cantscg);
        } catch (e) {
            reply(global.THEME.responses.error);
            l(e);
        }
    }
);
