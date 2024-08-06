const { cmd, commands } = require("../command");
let { img2url } = require("@blackamda/telegram-image-url");
const { getRandom, fetchJson, getBuffer, json } = require("../lib/functions");
const fs = require("fs");
const config = require("../config");
const path = require("path");
const { spawn } = require("child_process");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const fileType = require("file-type");
const wabetainfo = require("@sasmeee/wabetainfo");

var desct = "";
if (config.LANG === "SI")
    desct =
        "එය ලබා දී ඇති black and white රූපයක් colour රූපයක් බවට පරිවර්තනය කරයි..";
else desct = "It converts given black and white image to colour image..";
var imgmsg = "";
if (config.LANG === "SI") imgmsg = "*ඡායාරූපයකට mention දෙන්න !*";
else imgmsg = "*Reply to a photo !*";
var cantf = "";
if (config.LANG === "SI")
    cantf = "*Server එක කාර්යබහුලයි. පසුව නැවත උත්සාහ කරන්න. !*";
else cantf = "*Server is busy. Try again later.!*";

cmd(
    {
        pattern: "colorize",
        react: "🎨",
        alias: ["colorizer", "tocolour", "colourize"],
        desc: "colourrise a decolorised image",
        category: "convert",
        use: ".colorize <reply black & white image>",
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
            const isQuotedViewOnce = m.quoted
                ? m.quoted.type === "viewOnceMessage"
                : false;
            const isQuotedImage = m.quoted
                ? m.quoted.type === "imageMessage" ||
                  (isQuotedViewOnce
                      ? m.quoted.msg.type === "imageMessage"
                      : false)
                : false;
            if (m.type === "imageMessage" || isQuotedImage) {
                const fileType = require("file-type");
                var nameJpg = getRandom("");
                let buff = isQuotedImage
                    ? await m.quoted.download(nameJpg)
                    : await m.download(nameJpg);
                let type = await fileType.fromBuffer(buff);
                await fs.promises.writeFile("./" + type.ext, buff);
                img2url("./" + type.ext).then(async url => {
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
                        let apilist = await fetchJson(
                            "https://gist.githubusercontent.com/vihangayt0/7dbb65f6adfe21538f7febd13982569a/raw/apilis.json"
                        );
                        let list = apilist.users;
                        let apikey =
                            list[Math.floor(Math.random() * list.length)];
                        await conn.sendMessage(
                            from,
                            {
                                image: {
                                    url:
                                        apilist.xz +
                                        "api/colorizer?url=" +
                                        url +
                                        "&apikey=" +
                                        apikey
                                },
                                caption: config.FOOTER
                            },
                            { quoted: mek }
                        );
                    }
                });
            } else return reply(imgmsg);
        } catch (e) {
            reply(cantf);
            l(e);
        }
    }
);

cmd(
    {
        pattern: "enhance",
        react: "↗️",
        alias: ["imgenhance", "quality", "qualityimage", "tohd"],
        desc: "imporve image quality",
        category: "convert",
        use: ".enhance <reply low quality image>",
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
            const isQuotedViewOnce = m.quoted
                ? m.quoted.type === "viewOnceMessage"
                : false;
            const isQuotedImage = m.quoted
                ? m.quoted.type === "imageMessage" ||
                  (isQuotedViewOnce
                      ? m.quoted.msg.type === "imageMessage"
                      : false)
                : false;
            if (m.type === "imageMessage" || isQuotedImage) {
                const fileType = require("file-type");
                var nameJpg = getRandom("");
                let buff = isQuotedImage
                    ? await m.quoted.download(nameJpg)
                    : await m.download(nameJpg);
                let type = await fileType.fromBuffer(buff);
                await fs.promises.writeFile("./" + type.ext, buff);
                img2url("./" + type.ext).then(async url => {
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
            } else return reply(imgmsg);
        } catch (e) {
            reply(cantf);
            l(e);
        }
    }
);

cmd(
    {
        pattern: "img2url",
        react: "🔗",
        alias: ["tourl", "imgurl", "telegraph", "imgtourl"],
        desc: "uplode an image and return the url",
        category: "convert",
        use: ".img2url <reply image>",
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
            const isQuotedViewOnce = m.quoted
                ? m.quoted.type === "viewOnceMessage"
                : false;
            const isQuotedImage = m.quoted
                ? m.quoted.type === "imageMessage" ||
                  (isQuotedViewOnce
                      ? m.quoted.msg.type === "imageMessage"
                      : false)
                : false;
            if (m.type === "imageMessage" || isQuotedImage) {
                const fileType = require("file-type");
                var nameJpg = getRandom("");
                let buff = isQuotedImage
                    ? await m.quoted.download(nameJpg)
                    : await m.download(nameJpg);
                let type = await fileType.fromBuffer(buff);
                await fs.promises.writeFile("./" + type.ext, buff);
                img2url("./" + type.ext).then(async url => {
                    await reply("\n" + url + "\n");
                });
            } else return reply(imgmsg);
        } catch (e) {
            reply(cantf);
            l(e);
        }
    }
);

var imgmsg = "";
if (config.LANG === "SI") imgmsg = "*ඡායාරූපයකට mention දෙන්න!*";
else imgmsg = "*Reply to a photo !*";
var descg = "";
if (config.LANG === "SI")
    descg = "එය ඔබගේ mention දුන් ඡායාරූපය ස්ටිකර් බවට පරිවර්තනය කරයි.";
else descg = "It converts your replied photo to sticker.";
cmd(
    {
        pattern: "sticker",
        react: "🙂",
        alias: ["s", "stic"],
        desc: descg,
        category: "convert",
        use: ".sticker <Reply to image>",
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
            const isQuotedViewOnce = m.quoted
                ? m.quoted.type === "viewOnceMessage"
                : false;
            const isQuotedImage = m.quoted
                ? m.quoted.type === "imageMessage" ||
                  (isQuotedViewOnce
                      ? m.quoted.msg.type === "imageMessage"
                      : false)
                : false;
            const isQuotedVideo = m.quoted
                ? m.quoted.type === "videoMessage" ||
                  (isQuotedViewOnce
                      ? m.quoted.msg.type === "videoMessage"
                      : false)
                : false;
            const isQuotedSticker = m.quoted
                ? m.quoted.type === "stickerMessage"
                : false;
            if (m.type === "imageMessage" || isQuotedImage) {
                var nameJpg = getRandom("");
                isQuotedImage
                    ? await m.quoted.download(nameJpg)
                    : await m.download(nameJpg);
                let sticker = new Sticker(nameJpg + ".jpg", {
                    pack: pushname, // The pack name
                    author: config.AUTHOR, // The author name
                    type: q.includes("--crop" || "-c")
                        ? StickerTypes.CROPPED
                        : StickerTypes.FULL,
                    categories: ["🤩", "🎉"], // The sticker category
                    id: "12345", // The sticker id
                    quality: 75, // The quality of the output file
                    background: "transparent" // The sticker background color (only for full stickers)
                });
                const buffer = await sticker.toBuffer();
                return conn.sendMessage(
                    from,
                    { sticker: buffer },
                    { quoted: mek }
                );
            } else if (isQuotedSticker) {
                var nameWebp = getRandom("");
                await m.quoted.download(nameWebp);
                let sticker = new Sticker(nameWebp + ".webp", {
                    pack: pushname, // The pack name
                    author: "", // The author name
                    type: q.includes("--crop" || "-c")
                        ? StickerTypes.CROPPED
                        : StickerTypes.FULL,
                    categories: ["🤩", "🎉"], // The sticker category
                    id: "12345", // The sticker id
                    quality: 75, // The quality of the output file
                    background: "transparent" // The sticker background color (only for full stickers)
                });
                const buffer = await sticker.toBuffer();
                return conn.sendMessage(
                    from,
                    { sticker: buffer },
                    { quoted: mek }
                );
            } else return await reply(imgmsg);
        } catch (e) {
            reply("*Error !!*");
            l(e);
        }
    }
);

function toAudio(buffer, ext) {
    return ffmpeg(
        buffer,
        ["-vn", "-ac", "2", "-b:a", "128k", "-ar", "44100", "-f", "mp3"],
        ext,
        "mp3"
    );
}

function toPTT(buffer, ext) {
    return ffmpeg(
        buffer,
        [
            "-vn",
            "-c:a",
            "libopus",
            "-b:a",
            "128k",
            "-vbr",
            "on",
            "-compression_level",
            "10"
        ],
        ext,
        "opus"
    );
}

function toVideo(buffer, ext) {
    return ffmpeg(
        buffer,
        [
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            "-ab",
            "128k",
            "-ar",
            "44100",
            "-crf",
            "32",
            "-preset",
            "slow"
        ],
        ext,
        "mp4"
    );
}

var imgmsg = "";
if (config.LANG === "SI") imgmsg = "*වීඩියෝවක් mention දෙන්න !*";
else imgmsg = "*Reply to a video !*";
var descg = "";
if (config.LANG === "SI")
    descg = "එය ඔබගේ mention දුන් වීඩියෝව audio බවට පරිවර්තනය කරයි.";
else descg = "It converts your replied video to audio [mp3].";
var N_FOUND = "";
if (config.LANG === "SI")
    N_FOUND = "*මට මෙම වීඩියෝව audio බවට පරිවර්තනය කළ නොහැකි විය :(*";
else N_FOUND = "*I cant convert this video to audio :(*";
cmd(
    {
        pattern: "toptt",
        react: "🔊",
        alias: ["toaudio", "audio"],
        desc: descg,
        category: "convert",
        use: ".toptt <Reply to video>",
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
            let isquotedvid = m.quoted
                ? m.quoted.type === "videoMessage"
                : m
                ? m.type === "videoMessage"
                : false;
            if (!isquotedvid) return await reply(imgmsg);
            let media = m.quoted
                ? await m.quoted.download()
                : await m.download();
            let auddio = await toPTT(media, "mp4");
            let senda = await conn.sendMessage(
                m.chat,
                { audio: auddio.options, mimetype: "audio/mpeg" },
                { quoted: m }
            );
            await conn.sendMessage(from, {
                react: { text: "🎼", key: senda.key }
            });
        } catch (e) {
            reply("*Error !!*");
            l(e);
        }
    }
);

var imgmsg =''
if(config.LANG === 'SI') imgmsg = '*ස්ටිකරයකට mention දෙන්න !*'
else imgmsg = "*Reply to a sticker !*"
var descg = ''
if(config.LANG === 'SI') descg = "එය ඔබගේ mention දුන් sticker img බවට පරිවර්තනය කරයි."
else descg = "It converts your replied sticker to img."

cmd({
    pattern: "toimg",
    react: "🔮",
    alias: ["s","stic"],
    desc: descg,
    category: "convert",
    use: '.sticker <Reply to image>',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    const isQuotedViewOnce = m.quoted ? (m.quoted.type === 'viewOnceMessage') : false
    const isQuotedImage = m.quoted ? ((m.quoted.type === 'imageMessage') || (isQuotedViewOnce ? (m.quoted.msg.type === 'imageMessage') : false)) : false
    const isQuotedVideo = m.quoted ? ((m.quoted.type === 'videoMessage') || (isQuotedViewOnce ? (m.quoted.msg.type === 'videoMessage') : false)) : false
    const isQuotedSticker = m.quoted ? (m.quoted.type === 'stickerMessage') : false
if ( isQuotedSticker ) { 

var nameJpg = getRandom('');
let buff = isQuotedSticker ? await m.quoted.download(nameJpg) : await m.download(nameJpg)
let type = await fileType.fromBuffer(buff);
await fs.promises.writeFile("./" + type.ext, buff);  
await conn.sendMessage(from, { image: fs.readFileSync("./" + type.ext), caption: config.FOOTER }, { quoted: mek })

}else return await  reply(imgmsg)
} catch (e) {
reply('*Error !!*')
l(e)
}
})

var desct =''
if(config.LANG === 'SI') desct = 'එය ලබා දී ඇති රූපය anime image එකක් බවට පරිවර්තනය කරයි.'
else desct = "It convert given image to anime image."
var imgmsg =''
if(config.LANG === 'SI') imgmsg = '*ඡායාරූපයකට mention දෙන්න !*'
else imgmsg = "*Reply to a photo !*"
var cantf =''
if(config.LANG === 'SI') cantf = '*Server එක කාර්යබහුලයි. පසුව නැවත උත්සාහ කරන්න. !*'
else cantf = "*Server is busy. Try again later.!*"


cmd({
    pattern: "toanime",
    react: "🏮",
    alias: ["imgtoanime","animeimg"],
    desc: desct,
    category: "convert",
    use: '.toanime <reply image>',
    filename: __filename
},
async(conn, mek, m,{from, l, prefix, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
    try{
    const isQuotedViewOnce = m.quoted ? (m.quoted.type === 'viewOnceMessage') : false
    const isQuotedImage = m.quoted ? ((m.quoted.type === 'imageMessage') || (isQuotedViewOnce ? (m.quoted.msg.type === 'imageMessage') : false)) : false
    if ((m.type === 'imageMessage') || isQuotedImage) {
const fileType = require("file-type");
  var nameJpg = getRandom('');
  let buff = isQuotedImage ? await m.quoted.download(nameJpg) : await m.download(nameJpg)
  let type = await fileType.fromBuffer(buff);
  await fs.promises.writeFile("./" + type.ext, buff);
  img2url("./" + type.ext).then(async url => {
    try{
    await conn.sendMessage(from, { image: await getBuffer('https://vihangayt.me/tools/toanime?url='+url), caption: config.FOOTER }, { quoted: mek })
  } catch (e) {
    let apilist = await fetchJson('https://gist.githubusercontent.com/vihangayt0/7dbb65f6adfe21538f7febd13982569a/raw/apilis.json')
    let list = apilist.users
    let apikey = list[Math.floor(Math.random() * list.length)]
    await conn.sendMessage(from, { image: { url: apilist.xz +'api/toanime?url='+url+'&apikey=' + apikey }, caption: config.FOOTER }, { quoted: mek })
  }
});
    } else return reply(imgmsg)
} catch (e) {
  reply(cantf);
  l(e);
}
})

var tmsg =''
if(config.LANG === 'SI') tmsg = 'එය whatsapp beta news ලබා දෙයි.'
else tmsg = "It gives whatsapp beta news."


cmd({
    pattern: "wabeta",
    alias: ["wabetainfo","betawa"],
    react: "✔️",
    desc: tmsg,
    category: "search",
    use: '.wabeta',
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
const data = (await fetchJson('https://vihangayt.me/details/wabetainfo')).data
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
${data.fulldesc}`
return await conn.sendMessage(from, { image: { url: data.image} , caption: info } , { quoted: mek })
} catch (e) {
l(e)
}
})
