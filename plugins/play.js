const config = require("../config");
const { tmpdir } = require("os");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const { cmd, commands } = require("../command");
const {
    fetchBuffer,
    getRandom,
    isUrl,
    getBuffer
} = require("../lib/functions");
const parseCommand = require("../lib/commands/commandParser");
const { Maker, spotify, soundcloud, appleMusic } = require("../lib/scrapers");

async function createSongPreview(template, img, songName, smallText) {
    if (!isUrl(img)) throw new Error("Image URL invalid");

    let tempFilePath; // Temporary file path placeholder

    try {
        const image = await fetchBuffer(img);

        // Create a temporary file path
        tempFilePath = path.join(
            tmpdir(),
            getRandom("." + (image.ext ?? "jpg")) // Default to ".jpg" if no extension
        );

        // Write image data to the temporary file
        await fs.promises.writeFile(tempFilePath, image.data);

        // Create the song preview effect
        const effect = await Maker.create(template, {
            text: [songName, smallText],
            radio: [2],
            image: [tempFilePath]
        });
        return effect.directURL;
    } catch (e) {
        // Log any errors that occur during processing
        console.error(
            `Error occurred creating song preview: ${e.message}\n${e.stack}`
        );
    } finally {
        // Ensure the temporary file is deleted
        if (tempFilePath) {
            try {
                await fs.promises.unlink(tempFilePath);
            } catch (cleanupError) {
                console.error(
                    `Error occurred during cleanup: ${cleanupError.message}\n${cleanupError.stack}`
                );
            }
        }
    }
}

// <=============soundcloud=============>
cmd(
    {
        pattern: "soundcloud",
        react: "📱",
        desc: "It downloads songs from soundcloud.",
        category: "download",
        use: ".soundcloud lelena",
        filename: __filename
    },
    async (conn, mek, m, { from, prefix, command, q, reply }) => {
        try {
            let text = q;
            if (m.quoted) {
                text = m.quoted.body;
                text = text
                    .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                    .trim();
            }
            if (!text) return await reply("Need a query or link");
            const commandStr = `${prefix}spotify ${text}`;
            const parsedCommand = parseCommand(commandStr);
            const options = parsedCommand.options;
            text = parsedCommand.args.join(" ");
            const soundcloudLinkRegrex =
                /^(http(s)?:\/\/)?m\.soundcloud\.com\/.+/;
            let mode = "link";
            if (!soundcloudLinkRegrex.test(text)) mode = "play";
            if (options.s || options.search) mode = "search";
            switch (mode) {
                case "search":
                    {
                        const search = await soundcloud.search(text);
                        const data = search.result.filter(
                            song => song.thumb && !song.views.includes("Follow")
                        );
                        if (data.length < 1)
                            return await reply(global.responses.notFound);
                        let srh = [];
                        for (let i = 0; i < data.length; i++) {
                            srh.push({
                                description:
                                    data[i].title +
                                    " | " +
                                    data[i].artist +
                                    " | " +
                                    data[i].views +
                                    " | " +
                                    data[i].release +
                                    " | " +
                                    data[i].timestamp,
                                title: i + 1,
                                rowId: prefix + "soundcloud " + data[i].url
                            });
                        }
                        const sections = [
                            {
                                title: "_[Result from m.soundcloud.com]_",
                                rows: srh
                            }
                        ];
                        const listMessage = {
                            image: { url: data[0].thumb },
                            caption: `「 *SOUNDCLOUD DOWNLOADER* 」

*📱 Search term:* ${text}`,
                            footer: config.FOOTER,
                            title: "Result from m.soundcloud.com 📲",
                            buttonText: "*🔢 Reply below number*",
                            sections
                        };
                        await conn.replyList(from, listMessage, {
                            quoted: mek
                        });
                    }
                    break;
                case "link":
                    {
                        const song = await soundcloud.dl(text);
                        const caption = `*🎶 Song Title:* ${song.title}
*🔉Bitrate:* ${song.bitrate}
*🔗 Link:* ${text}`;
                        const playerImage = await createSongPreview(
                            "https://en.ephoto360.com/create-two-layer-music-player-photo-effect-online-772.html",
                            song.thumbnail,
                            song.title,
                            text
                        );
                        const sections = [
                            {
                                title: "SELECT SONG TYPE",
                                rows: [
                                    {
                                        title: "1",
                                        rowId:
                                            prefix +
                                            "soundaud " +
                                            `${song.title}|${text}|${song.link}|${song.thumbnail}`,
                                        description: "AUDIO SONG"
                                    },
                                    {
                                        title: "2",
                                        rowId:
                                            prefix +
                                            "sounddoc " +
                                            `${song.title}|${text}|${song.link}|${song.thumbnail}`,
                                        description: "DOCUMENT SONG"
                                    }
                                ]
                            }
                        ];
                        const listMessage = {
                            image: await getBuffer(playerImage),
                            caption,
                            footer: config.FOOTER,
                            title: "SELECT SONG TYPE",
                            buttonText: "🔢 Reply below number,",
                            sections,
                            contextInfo: {
                                externalAdReply: {
                                    title: `「 ${config.BOT} 」`,
                                    body: "「 SOUNDCLOUD DOWNLOADER 」",
                                    mediaType: 1,
                                    sourceUrl: global.link,
                                    thumbnailUrl: config.LOGO,
                                    renderLargerThumbnail: false,
                                    showAdAttribution: true
                                }
                            }
                        };

                        return await conn.replyList(from, listMessage, {
                            quoted: mek
                        });
                    }
                    break;
                case "play":
                    {
                        const search = await soundcloud.search(text);
                        const data = search.result.filter(
                            song => song.thumb && !song.views.includes("Follow")
                        );
                        if (data.length < 1)
                            return await reply(global.responses.notFound);
                        const songData = data[0];
                        const caption = `*🎶 Song Title:* ${songData.title}
*🎤 Artist:* ${songData.artist}
*📅 Release Date:* ${songData.release}
*⏰ Duration:* ${songData.timestamp}
*👥 Views:* ${songData.views}
*🔗 Link:* ${songData.url}`;
                        const playerImage = await createSongPreview(
                            "https://en.ephoto360.com/create-two-layer-music-player-photo-effect-online-772.html",
                            songData.thumb,
                            songData.title,
                            songData.url
                        );
                        const songMsg = await conn.sendMessage(
                            from,
                            {
                                image: await getBuffer(playerImage),
                                caption,
                                contextInfo: {
                                    mentionedJid: [from],
                                    externalAdReply: {
                                        title: "「 SOUNDCLOUD DOWNLOADER 」",
                                        body: `${songData.title}:${songData.artist}`,
                                        mediaType: 1,
                                        sourceUrl: songData.url,
                                        thumbnailUrl:
                                            songData.thumb || config.LOGO,
                                        renderLargerThumbnail: false,
                                        showAdAttribution: true
                                    }
                                }
                            },
                            { quoted: mek }
                        );
                        const dlSong = await soundcloud.dl(songData.url);
                        await conn.sendMessage(
                            from,
                            {
                                audio: await getBuffer(dlSong.link),
                                fileName: songData.name + ".mp3",
                                mimetype: "audio/mpeg",
                                ptt: true,
                                contextInfo: {
                                    mentionedJid: [from],
                                    externalAdReply: {
                                        title: `「 SP DOWNLODER 」`,
                                        body: `${dlSong.title}:${dlSong.bitrate}`,
                                        thumbnail: await getBuffer(
                                            dlSong.thumbnail || config.LOGO
                                        ),
                                        mediaType: 2,
                                        mediaUrl: songData.url
                                    }
                                }
                            },
                            { quoted: songMsg }
                        );
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
        pattern: "sounddoc",
        dontAddCommandList: true,
        filename: __filename,
        category: "download"
    },
    async (conn, mek, m, { from, command, q, reply, sender }) => {
        try {
            await conn.sendMessage(from, {
                react: { text: global.reactions.download, key: mek.key }
            });
            if (!q) return await reply("*Need info...*");
            const [name, link, directLink, thumbnail] = q.split("|");
            if (!name || !link || !directLink || !thumbnail)
                return await reply(global.responses.humanSpy);
            const filename = name + ".mp3";
            const audMessage = await conn.sendMessage(
                from,
                {
                    document: { url: directLink },
                    fileName: filename,
                    mimetype: mime.lookup(filename),
                    jpegThumbnail: await getBuffer(
                        thumbnail || "https://picsum.photos/512/512"
                    ),
                    contextInfo: {
                        mentionedJid: [sender]
                    }
                },
                { quoted: mek }
            );
            await conn.sendMessage(from, {
                react: { text: global.reactions.file, key: audMessage.key }
            });
            await conn.sendMessage(from, {
                react: { text: global.reactions.done, key: mek.key }
            });
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "soundaud",
        dontAddCommandList: true,
        filename: __filename,
        category: "download"
    },
    async (conn, mek, m, { from, command, q, reply, sender }) => {
        try {
            await conn.sendMessage(from, {
                react: { text: global.reactions.download, key: mek.key }
            });
            if (!q) return await reply("*Need info...*");
            const [name, link, directLink, thumbnail] = q.split("|");
            if (!name || !link || !directLink || !thumbnail)
                return await reply(global.responses.humanSpy);
            const audMessage = conn.sendMessage(from, {
                audio: await getBuffer(directLink),
                fileName: name + ".mp3",
                mimetype: "audio/mpeg",
                ptt: true,
                contextInfo: {
                    mentionedJid: [sender],
                    externalAdReply: {
                        title: `「 SOUNDCLOUD DOWNLOADER 」`,
                        body: name,
                        thumbnail: await getBuffer(thumbnail || config.LOGO),
                        mediaType: 2,
                        mediaUrl: link
                    }
                }
            });
            await conn.sendMessage(from, {
                react: { text: global.reactions.file, key: audMessage.key }
            });
            await conn.sendMessage(from, {
                react: { text: global.reactions.done, key: mek.key }
            });
        } catch (e) {
            m.sendError(e);
        }
    }
);
//=======================================

// <==============spotify===============>
cmd(
    {
        pattern: "spotify",
        category: "download",
        desc: "download musics from spotify",
        alias: ["sdl", "sp", "spdl"],
        use: ".spotify <query/link>",
        filename: __filename
    },
    async (conn, mek, m, { from, q, reply, prefix, command }) => {
        let text = q;
        if (m.quoted) {
            text = m.quoted.body;
            text = text
                .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                .trim();
        }
        if (!text) return reply("Need a query or link");
        const commandStr = `${prefix}spotify ${text}`;
        const parsedCommand = parseCommand(commandStr);
        const options = parsedCommand.options;
        text = parsedCommand.args.join(" ");
        const spotLinkRegrex = /^((https|http):\/\/)?open\.spotify\.com\/.+/;
        let mode = "link";
        if (!spotLinkRegrex.test(text)) mode = "play";
        if (options.s || options.search) mode = "search";
        switch (mode) {
            case "link":
                {
                    m.react(global.reactions.loading);
                    const song = await spotify.dl(text);
                    if (!song.success)
                        return m.sendError(
                            new Error("An error occurred Fetching song.")
                        );
                    await conn.sendMessage(from, {
                        audio: await getBuffer(song.link),
                        fileName: song.metadata.title + ".mp3",
                        mimetype: "audio/mpeg",
                        ptt: true,
                        contextInfo: {
                            mentionedJid: [from],
                            externalAdReply: {
                                title: `「 SP DOWNLOADER 」`,
                                body: song.metadata.title,
                                thumbnail: await getBuffer(
                                    song.metadata.cover || config.LOGO
                                ),
                                mediaType: 2,
                                mediaUrl: text
                            }
                        }
                    });
                }
                break;
            case "play":
                {
                    m.react(global.reactions.search);
                    const search = await spotify.play(text);
                    if (!search.success)
                        return m.sendError(
                            new Error(
                                "An error occurred fetching searching song."
                            )
                        );
                    const song = search.songs[0];
                    const caption = `*🎶 Song Title:* ${song.name}
*🎤 Artist:* ${song.artist}
*📅 Release Date:* ${song.release_date}
*⏰ Duration:* ${song.duration}
*🔗 Link:* ${song.link}`;
                    const songMsg = await conn.sendMessage(
                        from,
                        {
                            image: {
                                url: encodeURI(
                                    `https://api.yanzbotz.live/api/maker/spotify-card?author=${song.artist}&title=${song.name}&album=${song.name}&img=${song.image_url}`
                                )
                            },
                            caption,
                            contextInfo: {
                                mentionedJid: [from],
                                externalAdReply: {
                                    title: `「 SP DOWNLOADER 」`,
                                    body: `${song.name}:${song.artist}`,
                                    mediaType: 1,
                                    sourceUrl: song.link,
                                    thumbnailUrl: song.image_url || config.LOGO,
                                    renderLargerThumbnail: false,
                                    showAdAttribution: true
                                }
                            }
                        },
                        { quoted: mek }
                    );
                    const dlsong = await song.dlink();
                    if (!dlsong.success)
                        return reply("An error occurred downloading song");
                    await conn.sendMessage(
                        from,
                        {
                            audio: await getBuffer(dlsong.link),
                            fileName: song.name + ".mp3",
                            mimetype: "audio/mpeg",
                            ptt: true,
                            contextInfo: {
                                mentionedJid: [from],
                                externalAdReply: {
                                    title: `「 SP DOWNLODER 」`,
                                    body: dlsong.metadata.title,
                                    thumbnail: await getBuffer(
                                        dlsong.metadata.cover || config.LOGO
                                    ),
                                    mediaType: 2,
                                    mediaUrl: song.link
                                }
                            }
                        },
                        { quoted: songMsg }
                    );
                }
                break;
            case "search":
                {
                    const search = await await spotify.play(text);
                    if (!search.success)
                        return m.sendError(
                            new Error(
                                "An error occurred fetching searching song."
                            )
                        );
                    const songs = search.songs;
                    if (songs.length < 1)
                        return await reply(global.responses.notFound);
                    let srh = [];
                    for (let i = 0; i < songs.length; i++) {
                        srh.push({
                            description:
                                songs[i].name +
                                " | " +
                                songs[i].artist +
                                " | " +
                                songs[i].release_date +
                                " | " +
                                songs[i].duration,
                            title: i + 1,
                            rowId: prefix + "spotify " + songs[i].link
                        });
                    }
                    const sections = [
                        {
                            title: "_[Result from open.spotify.com]_",
                            rows: srh
                        }
                    ];
                    const listMessage = {
                        image: { url: songs[0].image_url },
                        caption: `
   *「 SP DOWNLOADER 」*

*📱 Search term:* ${text}`,
                        footer: config.FOOTER,
                        title: "Result from open.spotify.com 📲",
                        buttonText: "*🔢 Reply below number*",
                        sections
                    };
                    await conn.replyList(from, listMessage, {
                        quoted: mek
                    });
                }
                break;
        }
        m.react(global.reactions.success);
    }
);
//=======================================
// <=============appleMusic=============>
function parseISO8601Duration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return "Invalid format";

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    const parts = [];
    if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    if (seconds) parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

    return parts.join(", ");
}

cmd(
    {
        pattern: "applemusic",
        category: "download",
        desc: "download musics from apple music",
        alias: ["apm", "aplm", "apmdl"],
        use: ".applemusic <query/link>",
        filename: __filename
    },
    async (conn, mek, m, { from, prefix, command, q, reply }) => {
        try {
            let text = q;
            if (m.quoted) {
                text = m.quoted.body;
                text = text
                    .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                    .trim();
            }
            if (!text) return await reply("Need a query or link");
            const commandStr = `${prefix}spotify ${text}`;
            const parsedCommand = parseCommand(commandStr);
            const options = parsedCommand.options;
            text = parsedCommand.args.join(" ");
            const applemusicLinkRegrex =
                /^(http(s)?:\/\/)?music\.apple\.com\/.+/;
            let mode = "link";
            if (!applemusicLinkRegrex.test(text)) mode = "play";
            if (options.s || options.search) mode = "search";
            switch (mode) {
                case "search":
                    {
                        const results = await appleMusic.search(text);
                        if (results.length < 1)
                            return await reply(global.responses.notFound);
                        let srh = [];
                        for (let i = 0; i < results.length; i++) {
                            srh.push({
                                description: results[i].title,
                                title: i + 1,
                                rowId: prefix + "applemusic " + results[i].url
                            });
                        }
                        const sections = [
                            {
                                title: "_[Result from music.apple.com]_",
                                rows: srh
                            }
                        ];
                        const listMessage = {
                            image: {
                                url: results[0].thumbnails.slice(-1)[0].url
                            },
                            caption: `「 ${config.BOT} 」

   *「 APPLE MUSIC DOWNLOADER 」*

*📱 Search term:* ${text}`,
                            footer: config.FOOTER,
                            title: "Result from music.apple.com 📲",
                            buttonText: "*🔢 Reply below number*",
                            sections
                        };
                        await conn.replyList(from, listMessage, {
                            quoted: mek
                        });
                    }
                    break;
                case "link":
                    {
                        const response = await appleMusic.request(text);
                        if (response.status === "error")
                            return await reply(response.message);
                        if (dlsong.data?.length < 1)
                            return await reply(global.reactions.notFound);
                        response.data.forEach(async song => {
                            const caption = `*🎶 Title:* ${song.title}
*🎤 Artist:* ${song.artist}
*📅 Release Date:* ${song.releaseDate}  
*🕒 Duration:* ${parseISO8601Duration(song.duration)}
*💿 Description:* ${song.description}  
*🔗 Artist Link:* ${song.artistUrl}
> ${config.FOOTER}`;
                            const playerImage = await createSongPreview(
                                "https://en.ephoto360.com/make-notebook-music-effect-346.html",
                                song.imageUrl,
                                song.title,
                                text
                            );

                            const songMsg = await conn.sendMessage(
                                from,
                                {
                                    image: await getBuffer(playerImage),
                                    caption,
                                    contextInfo: {
                                        mentionedJid: [from],
                                        externalAdReply: {
                                            title: `「 APM DOWNLOADER 」`,
                                            body: `${song.description}:${song.artist}`,
                                            mediaType: 1,
                                            sourceUrl: text,
                                            thumbnailUrl:
                                                song.imageUrl || config.LOGO,
                                            renderLargerThumbnail: false,
                                            showAdAttribution: true
                                        }
                                    }
                                },
                                { quoted: mek }
                            );
                            const dlsong = song.download.error
                                ? []
                                : song.download;
                            if (dlsong.length != 2)
                                return await reply(
                                    "An error occurred downloading song"
                                );
                            await conn.sendMessage(
                                from,
                                {
                                    audio: await getBuffer(dlsong[0].link),
                                    fileName: song.title + ".mp3",
                                    mimetype: "audio/mpeg",
                                    ptt: true,
                                    contextInfo: {
                                        mentionedJid: [from],
                                        externalAdReply: {
                                            title: `「 APM DOWNLODER 」`,
                                            body: song.title,
                                            thumbnail: await getBuffer(
                                                dlsong[1].link || config.LOGO
                                            ),
                                            mediaType: 2,
                                            mediaUrl: text
                                        }
                                    }
                                },
                                { quoted: songMsg }
                            );
                        });
                    }
                    break;
                case "play":
                    {
                        const results = await appleMusic.search(text);
                        if (results.length < 1)
                            return await reply(global.responses.notFound);
                        const song = results[0];
                        const dlsong = await appleMusic.request(song.url);
                        return reply(JSON.stringify(dlsong));
                        if (dlsong.status === "error")
                            return await reply(dlsong.message);
                        if (dlsong.data?.length < 1)
                            return await reply(global.response.notFound);
                        dlsong.data.forEach(async song => {
                            const caption = `*🎶 Title:* ${song.title}
*🎤 Artist:* ${song.artist}
*📅 Release Date:* ${song.releaseDate}  
*🕒 Duration:* ${parseISO8601Duration(song.duration)}
*💿 Description:* ${song.description}  
*🔗 Artist Link:* ${song.artistUrl}
> ${config.FOOTER}`;
                            const playerImage = await createSongPreview(
                                "https://en.ephoto360.com/make-notebook-music-effect-346.html",
                                song.imageUrl,
                                song.title,
                                text
                            );

                            const songMsg = await conn.sendMessage(
                                from,
                                {
                                    image: await getBuffer(playerImage),
                                    caption,
                                    contextInfo: {
                                        mentionedJid: [from],
                                        externalAdReply: {
                                            title: `「 APM DOWNLOADER 」`,
                                            body: `${song.description}:${song.artist}`,
                                            mediaType: 1,
                                            sourceUrl: text,
                                            thumbnailUrl:
                                                song.imageUrl || config.LOGO,
                                            renderLargerThumbnail: false,
                                            showAdAttribution: true
                                        }
                                    }
                                },
                                { quoted: mek }
                            );
                            const dlsong = song.download.error
                                ? []
                                : song.download;
                            if (dlsong.length != 2)
                                return await reply(
                                    "An error occurred downloading song"
                                );
                            await conn.sendMessage(
                                from,
                                {
                                    audio: await getBuffer(dlsong[0].link),
                                    fileName: song.title + ".mp3",
                                    mimetype: "audio/mpeg",
                                    ptt: true,
                                    contextInfo: {
                                        mentionedJid: [from],
                                        externalAdReply: {
                                            title: `「 APM DOWNLODER 」`,
                                            body: song.title,
                                            thumbnail: await getBuffer(
                                                dlsong[1].link || config.LOGO
                                            ),
                                            mediaType: 2,
                                            mediaUrl: text
                                        }
                                    }
                                },
                                { quoted: songMsg }
                            );
                        });
                    }
                    break;
            }
        } catch (e) {
            m.sendError(e);
        }
    }
);
//=======================================
// <===============player===============>
function getPlayer(player) {
    const defualtPlayer = commands.filter(
        cmd => cmd.pattern === "soundcloud"
    )[0];
    const playerCommand = commands.filter(cmd => cmd.pattern === "player")[0];
    if (!playerCommand) {
        console.error("Player not found using defualt");
        return defualtPlayer.function;
    }
    return playerCommand.function;
}
cmd(
    {
        pattern: "play",
        category: "download",
        alias: ["song"],
        react: global.reactions.music,
        desc: "Music player",
        use: ".play <query or link>",
        filename: __filename
    },
    getPlayer(config.PLAYER)
);
//=======================================
