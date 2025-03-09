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
    fetchJson,
    countryCodeToNameIntl
} = require("../lib/functions");

cmd(
    {
        pattern: "dictionary",
        alias: ["dict", "define"],
        react: "📖",
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
            const results = await fetchJson(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${text}`
            );

            if (!Array.isArray(results) || !results.length) {
                return reply(`No definition found for word: ${text}`);
            }

            function getAccentFromAudioURL(url) {
                console.log(url);
                return url
                    .split("/")
                    .slice(-1)[0]
                    .split("-")
                    .slice(-1)[0]
                    .replace(/\.mp3|\.wav|\.ogg/, "")
                    .toUpperCase();
            }

            for (let wordData of results) {
                let result = `📖 *Word:* ${wordData.word || text} \n`;
                const phoneticList = wordData.phonetics?.map((phonetic, i) => {
                    const accent =
                        countryCodeToNameIntl(
                            getAccentFromAudioURL(phonetic.audio)
                        ) || "General American";
                    return `- \`${
                        phonetic.text || "No transcription"
                    }\` (\`${accent}\`) (${i + 1}) \n`;
                });
                if (phoneticList.length > 0) {
                    result += "📌 *Phonetic:* \n";
                    result += phoneticList.join("");
                }
                const meaningList = wordData.meanings?.map(meaning => {
                    // console.log(meaning);
                    let meaningText = `- 📚 *${
                        meaning.partOfSpeech[0].toUpperCase() +
                        meaning.partOfSpeech.slice(1)
                    }:* \n`;
                    let definitionNumber = 1;
                    meaning.definitions.forEach(definitionObj => {
                        // console.log(definitionObj);
                        meaningText += `\t${definitionNumber}. ${definitionObj.definition} \n`;
                        if (definitionObj.example)
                            meaningText += `\t\t▪︎ \`Example:\` _${definitionObj.example}_ \n`;
                        if (definitionObj.synonyms.length)
                            meaningText += `\t\t▪︎ \`Synonyms:\` _${definitionObj.synonyms?.join(
                                ", "
                            )}_ \n`;
                        if (definitionObj.antonyms.length)
                            meaningText += `\t\t▪︎ \`Antonyms:\` _${definitionObj.antonyms?.join(
                                ", "
                            )}_ \n`;
                        definitionNumber++;
                    });
                    if (meaning.synonyms.length)
                        meaningText += `\t\`Synonyms:\` _${meaning.synonyms.join(
                            ", "
                        )}_ \n`;

                    if (meaning.antonyms.length)
                        meaningText += `\t\`Antonyms:\` _${meaning.antonyms.join(
                            ", "
                        )}_\n`;

                    return meaningText;
                });
                if (meaningList.length > 0) {
                    result += "📖 *Meanings:* \n";
                    result += meaningList.join(" \n");
                }
                if (Object.keys(wordData.license).length)
                    result += `\n🪪 *License:* ${wordData.license.name} (${wordData.license.url})`;
                if (wordData.sourceUrls.length)
                    result += `\n🌐 *Sources:* \n${wordData.sourceUrls
                        .map(url => "- " + url)
                        .join("\n")}`;
                const definitionMsg = await reply(result);
                for (let phonetic of wordData.phonetics) {
                    const accent =
                        countryCodeToNameIntl(
                            getAccentFromAudioURL(phonetic.audio)
                        ) || "General American";
                    try {
                        await conn.sendMessage(
                            m.chat,
                            {
                                audio: await getBuffer(phonetic.audio),
                                fileName: phonetic.audio
                                    .split("/")
                                    .slice(-1)[0],
                                mimetype: "audio/mpeg",
                                ptt: true,
                                contextInfo: {
                                    mentionedJid: [m.chat],
                                    externalAdReply: {
                                        title: "「 DICTIONARY 」",
                                        body: `${
                                            countryCodeToNameIntl(
                                                getAccentFromAudioURL(
                                                    phonetic.audio
                                                )
                                            ) || "General American"
                                        } Pronunciation.`,
                                        thumbnail: await getBuffer(config.LOGO),
                                        mediaType: 2,
                                        mediaUrl: phonetic.audio
                                    }
                                }
                            },
                            { quoted: definitionMsg }
                        );
                    } catch (e) {
                        m.sendError(
                            e,
                            `*Can't get ${accent} pronunciation audio.*`
                        );
                    }
                }
            }
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
