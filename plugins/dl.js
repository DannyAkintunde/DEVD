const config = require("../config");
const { GDriveError, fetchInfo: GDriveDl } = require("gdrive-file-info");
const { cmd } = require("../command");
const parseCommand = require("../lib/commands/commandParser");
const {
    isUrl,
    fetchBuffer,
    getBuffer,
    formatSize,
    fetchSocialPreview
} = require("../lib/functions");
const { toPTT } = require("../lib/editor");
const mime = require("mime-types");
const {
    tiktok,
    fbsaver,
    aiodl,
    mediaFire,
    igdl,
    threads
} = require("../lib/scrapers");
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

function fbreg(url) {
    const fbRegex =
        /(?:(https|http)?:\/\/)?(?:www\.)?(m\.facebook|facebook|fb)\.(com|me|watch)\/(?:(?:\w\.)*#!\/)?(?:groups\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/;
    return fbRegex.test(url);
}

cmd(
    {
        pattern: "fb",
        react: "#️⃣",
        alias: ["fbdl"],
        desc: "Download videos from Facebook.",
        category: "download",
        use: ".fb <Fb video link>",
        filename: __filename
    },
    async (conn, mek, m, { from, prefix, q, reply }) => {
        try {
            if (!fbreg(q))
                return await reply("*Please give me facebook video url..*");
            const fdata = await fbsaver.download(q);
            const dldata = await aiodl.dl(q);
            if (!fdata || !fdata?.success || !dldata || dldata.error)
                return await reply(global.responses.notFound);
            let dat = `「 ${config.BOT} 」

  *𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗗𝗘𝗥*

*📎 Url:* ${dldata.url}
*👤 Author:* ${fdata.userInfo?.name}
*✨ Title:* ${dldata.title}`;
            const rows = [];
            let i = 0;
            dldata.medias.forEach(stream => {
                let col = {
                    title: `${++i}`,
                    rowId: `${prefix}dmenu ${stream.url}`,
                    description: `Video ${stream.quality} (${stream.formattedSize})`
                };
                rows.push(col);
            });
            rows.append({
                title: `${++i}`,
                rowId: `${prefix}dau ${fdata.video}|convert`,
                description: "Audio"
            });
            const sections = [
                {
                    title: "Select option",
                    rows: rows
                }
            ];
            const listMessage = {
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.cid,
                        serverMessageId: 127
                    },
                    externalAdReply: {
                        title: `「 𝗙𝗕 𝗗𝗢𝗪𝗡𝗟𝗢𝗗𝗘𝗥 」`,
                        body: `${dldata.title || config.BOT}`,
                        mediaType: 1,
                        sourceUrl: q,
                        thumbnailUrl:
                            fdata.userInfo?.profilePicture || config.LOGO,
                        renderLargerThumbnail: false,
                        showAdAttribution: true
                    }
                },
                image: {
                    url: fdata.thumbnail
                },
                buttonText: "🔢 Reply below number,",
                caption: dat,
                footer: config.FOOTER,
                sections,
                headerType: 4
            };
            return await conn.listMessage(from, listMessage, mek);
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "gdrive",
        alias: ["googledrive'"],
        react: "📑",
        desc: "Download googledrive files.",
        category: "download",
        use: ".gdrive <googledrive link>",
        filename: __filename
    },
    async (conn, mek, m, { from, q, reply, sender }) => {
        try {
            const url = m.quoted?.body || q;
            if (!url || !url.includes("drive.google.com") || !isUrl(url))
                return await reply("*Please give me google drive url !!*");
            let data = await GDriveDl(url);
            const info = await conn.sendMessage(
                from,
                {
                    image: {
                        url:
                            (await data.thumbnailUrl({
                                width: 1280,
                                height: 720
                            })) || "https://picsum.photos/1280/720"
                    },
                    caption: `*📃 File name:*  ${data.fileName}
*💈 File Size:* ${formatSize(data.sizeBytes)}
*🕹️ File type:* ${mime.lookup(data.fileName)}`,
                    contextInfo: {
                        externalAdReply: {
                            title: `「 GD DOWNLODER 」`,
                            body: data.fileName,
                            mediaType: 1,
                            sourceUrl: url,
                            thumbnailUrl:
                                "https://cdn1.iconfinder.com/data/icons/google-new-logos-1/32/google_drive_new_logo-1024.png", // "https://files.catbox.moe/0k7cth.jpg",
                            renderLargerThumbnail: false,
                            showAdAttribution: true
                        }
                    }
                },
                { quoted: mek }
            );
            if (data.sizeBytes > config.MAX_SIZE * 1024 * 1024)
                return reply("*File size is too big...*");
            m.react(global.reactions.upload);
            const gfile = await conn.sendMessage(
                from,
                {
                    document: { url: data.downloadUrl },
                    fileName: data.fileName,
                    mimetype: mime.lookup(data.fileName),
                    jpegThumbnail:
                        (await data.thumbnailUrl({
                            width: 512,
                            height: 512
                        })) || "https://picsum.photos/512/512",
                    contextInfo: {
                        mentionedJid: [sender]
                    }
                },
                { quoted: info }
            );
            await conn.sendMessage(from, {
                react: { text: global.reactions.file, key: gfile.key }
            });
            m.react(global.reactions.done);
        } catch (e) {
            let mess = global.responses.error;
            if (e instanceof TypeError) {
                mess = "*Invalid drive url*";
            } else if (e instanceof GDriveError) {
                mess =
                    "*An error occured acessing drive, ensure that drive exists and is publicly accessable*";
            }
            m.sendError(e, mess);
        }
    }
);

cmd(
    {
        pattern: "ig",
        alias: ["igstory"],
        react: "🎀",
        desc: "Download instagram videos/photos.",
        category: "download",
        use: ".ig <Instagram link>",
        filename: __filename
    },
    async (conn, mek, m, { from, q, sender, reply }) => {
        try {
            const url = m.quoted?.body || q;
            if (!url || !isUrl(url))
                return await reply("*Please give me Instagram url !!*");
            const response = await igdl(url);
            if (!response.success)
                return await reply("*I cant find this video!*");
            const data = fetchBuffer(response.downloadLink);
            if (data.size > config.MAX_SIZE * 1024 * 1024)
                return await reply("*This file is too big !!*");
            m.react(global.reactions.upload);
            await conn.sendMessage(
                from,
                {
                    ...(data.mime?.includes("image")
                        ? { image: data.data }
                        : { video: data.data }),
                    caption: config.FOOTER,
                    contextInfo: {
                        mentionedJid: [sender],
                        externalAdReply: {
                            title: `「 IG DOWNLODER 」`,
                            body: config.BOT,
                            mediaType: 1,
                            sourceUrl: url,
                            thumbnailUrl: response.thumbnail,
                            renderLargerThumbnail: false,
                            showAdAttribution: true
                        }
                    }
                },
                { quoted: mek }
            );
            m.react(global.reactions.done);
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "mediafire",
        alias: ["mfire"],
        react: "📁",
        desc: "Download mediafire files.",
        category: "download",
        use: ".mediafire <mediafire link>",
        filename: __filename
    },
    async (conn, mek, m, { from, q, reply, sender }) => {
        try {
            const url = m.quoted?.body || q;
            if (!url) return await reply("*Please give a url*");
            if (!isUrl(url)) return await reply("*Pleas give me a valid url*");
            if (!url.includes("mediafire.com"))
                return await reply("*Please give me mediafire url*");
            if (!mediaFire.validate(url))
                return await reply("*Please give me valid mediafire file url*");
            const file = await mediaFire.request(url);
            if (file.status) {
                const caption = `
*📁 Name* : ${file.name}
*📊 Size* : ${file.size}
*🕹️ Mime* : ${file.mime}`;
                const info = await conn.sendMessage(
                    from,
                    {
                        image: { url: file.thumbnail },
                        caption,
                        contextInfo: {
                            mentionedJid: [sender],
                            externalAdReply: {
                                title: `「 MF DOWNLODER 」`,
                                body: file.name,
                                mediaType: 1,
                                sourceUrl: url,
                                thumbnailUrl:
                                    "https://files.catbox.moe/em2d1j.jpg",
                                renderLargerThumbnail: false,
                                showAdAttribution: true
                            }
                        }
                    },
                    { quoted: mek }
                );
                if (
                    file.size.includes("MB") &&
                    file.size.replace("MB", "") > config.MAX_SIZE
                )
                    return await reply("*This file is too big !!*");
                if (
                    file.size.includes("GB") &&
                    Number(file.size.replace(" GB", "")) * 1024 >
                        config.MAX_SIZE
                )
                    return await reply("*This file is too big !!*");
                const mfile = await conn.sendMessage(
                    from,
                    {
                        document: { url: file.downloadLink },
                        jpegThumbnail: file.thumbnail,
                        fileName: file.name,
                        mimetype: file.mime,
                        contextInfo: {
                            mentionedJid: [sender]
                        }
                    },
                    { quoted: info }
                );
                await conn.sendMessage(from, {
                    react: { text: global.reactions.file, key: mfile.key }
                });
            }
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "threads",
        alias: ["thread"],
        react: "🧵",
        desc: "Download threads videos/photos.",
        category: "download",
        use: ".threads <threads link>",
        filename: __filename
    },
    async (conn, mek, m, { from, q, reply, prefix, command }) => {
        try {
            let url = q;
            if (m.quoted) {
                url = m.quoted.body;
                url = url
                    .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                    .trim();
            }
            if (!url) return await reply("*Please give me threads url !!*");
            if (!threads.test(url)) {
                await reply("*Invalid threads url provided*");
                m.react(global.reactions.question);
                return;
            }
            let { success, data } = await threads.dl(url);
            if (!success) m.sendError("```An error occured fetching threads.");
            for (let i = 0; i < data.length; i++) {
                const contextInfo = {
                    externalAdReply: {
                        title: data[i].user.name,
                        body: data[i].caption,
                        mediaType: 1,
                        sourceUrl: url,
                        thumbnailUrl: data[i].user.avata || config.LOGO,
                        renderLargerThumbnail: false,
                        showAdAttribution: true
                    }
                };
                const caption = `「 *THREADS DOWNLOADER* 」

*✍🏼 Author:* ${data[i].user.name}*
*📃 Caption:* ${data[i].caption}*
${config.FOOTER}`;
                if (data[i].type === "image")
                    await conn.sendMessage(
                        from,
                        {
                            image: { url: data[i].downloadLink },
                            caption,
                            contextInfo
                        },
                        { quoted: mek }
                    );
                else
                    await conn.sendMessage(
                        from,
                        {
                            video: { url: data[i].downloadLink },
                            caption,
                            contextInfo
                        },
                        { quoted: mek }
                    );
            }
        } catch (e) {
            m.sendError(e, "*I cant find this video!*");
        }
    }
);

cmd(
    {
        pattern: "tiktok",
        alias: ["ttdl"],
        react: "🏷️",
        desc: "Download videos from Tiktok.",
        category: "download",
        use: ".tiktok <Tiktok link>",
        filename: __filename
    },
    async (conn, mek, m, { from, prefix, command, q, reply }) => {
        try {
            let url = q;
            if (m.quoted) {
                url = m.quoted.body;
                url = url
                    .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                    .trim();
            }
            if (!url.includes("tiktok.com") && !isUrl(url))
                return await reply("*Please give me tiktok video url..*");
            //"https://api.sdbots.tech/tiktok?url=" + q
            const data = await tiktok(url);

            let dat = `「 *TIKTOK DOWNLOADER* 」

*📃 Title:* ${data.title}
*✍🏼 Author:* ${data.author}`;

            let sections = [
                {
                    title: "",
                    rows: [
                        {
                            title: "1",
                            rowId: `${prefix}dmenu ${data.nowm}`,
                            description: "video without Watermark"
                        },
                        {
                            title: "2",
                            rowId: `${prefix}dmenu ${data.watermark}`,
                            description: "Video with Watermark"
                        },
                        {
                            title: "3",
                            rowId: `${prefix}dau ${data.audio}`,
                            description: "Download audio"
                        }
                    ]
                }
            ];
            const listMessage = {
                image: { url: data.thumbnail },
                caption: dat,
                footer: config.FOOTER,
                buttonText: "🔢 Reply below number,",
                sections,
                contextInfo: {
                    externalAdReply: {
                        title: `「 ${config.BOT} 」`,
                        body: "🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲",
                        mediaType: 1,
                        sourceUrl: url,
                        thumbnailUrl: config.LOGO,
                        renderLargerThumbnail: false,
                        showAdAttribution: true
                    }
                }
            };

            await conn.replyList(from, listMessage, { quoted: mek });
        } catch (e) {
            m.sendError(e, "*I couldn't find anything :(*");
        }
    }
);

// <============clone===============>
cmd(
    {
        pattern: "gitclone",
        alias: ["gclone"],
        react: "🧵",
        desc: "clone github repositories",
        category: "download",
        use: ".gitclone <repo link>",
        filename: __filename
    },
    async (conn, mek, m, { from, q, reply, prefix, command, sender }) => {
        if (!q && !m.quoted?.body)
            return reply(
                `Please enter the necessary information to generate the image.`
            );
        let text = q;
        if (m.quoted) {
            text = m.quoted.body;
            text = text
                .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                .trim();
        }
        const commandStr = `${prefix}${command} ${text}`;
        const parsedCommand = parseCommand(commandStr);
        const options = parsedCommand.options;
        let branch = options.branch || options.b;
        const tar = Boolean(options.tar);
        text = parsedCommand.args.join(" ");
        // validate inputs
        const linkMatch = text.match(
            /((https|http|git):\/\/)?(www\.)?(git@)?github.com(:|\/)?(.+)/
        )[6];
        if (!linkMatch) return reply("```Invalid github url```");
        const [user, repo] = linkMatch.replace(/.git/, "").split("/");
        const repoInfoRes = await fetch(
            `https://api.github.com/repos/${user}/${repo}`
        );
        if (!repoInfoRes.ok) return reply("```Repo not found```");
        const repoInfo = await repoInfoRes.json();
        if (!branch) {
            branch = repoInfo["default_branch"];
        } else {
            const branchesInfoRes = await fetch(
                `https://api.github.com/repos/${user}/${repo}/branches`
            );
            const branchesInfo = await branchesInfoRes.json();
            const isValidBranch = Boolean(
                branchesInfo.filter(branchObj => branchObj.name === branch)
                    ?.length
            ); // validating the branch
            if (!isValidBranch) return reply("```Invalid branch specified```");
        }
        const format = tar ? "tarball" : "zipball";
        const downloadLink = `https://api.github.com/repos/${user}/${repo}/${format}/${branch}`;
        m.react(global.reactions.upload);
        const filename = `${repo}-${branch}.${
            format === "tarball" ? "tar.gz" : "zip"
        }`;
        const preview = await fetchSocialPreview(repoInfo["html_url"]);
        await reply(`${downloadLink} ${preview}`);
        const repoFile = await conn.sendMessage(
            from,
            {
                document: { url: downloadLink },
                fileName: filename,
                mimetype: mime.lookup(filename),
                jpegThumbnail: preview || "https://picsum.photos/512/512",
                contextInfo: {
                    mentionedJid: [sender]
                }
            },
            { quoted: mek }
        );
        await conn.sendMessage(from, {
            react: { text: global.reactions.file, key: repoFile.key }
        });
        m.react(global.reactions.done);
    }
);

// <<=========utility cmds=========>>
cmd(
    {
        pattern: "dmenu",
        dontAddCommandList: true,
        filename: __filename
    },
    async (conn, mek, m, { from, q, prefix }) => {
        try {
            m.react(global.reactions.question);
            const buttons = [
                {
                    buttonId: `${prefix}dvideo ${q}`,
                    buttonText: { displayText: "Video" },
                    type: 1
                },
                {
                    buttonId: `${prefix}dvdoc ${q}`,
                    buttonText: { displayText: "Document" },
                    type: 1
                }
            ];
            conn.buttonMessage(
                from,
                {
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: global.cid,
                            serverMessageId: 127
                        },
                        externalAdReply: {
                            title: `「 𝗗𝗢𝗪𝗡𝗟𝗢𝗗𝗘𝗥 」`,
                            body: `${config.BOT}`,
                            mediaType: 1,
                            sourceUrl: global.link,
                            thumbnailUrl: config.LOGO,
                            renderLargerThumbnail: false,
                            showAdAttribution: true
                        }
                    },
                    image: {
                        url: config.LOGO
                    },
                    caption: `*Video Download Menu*`,
                    footer: config.FOOTER,
                    buttons: buttons,
                    headerType: 4
                },
                mek
            );
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "dvideo",
        dontAddCommandList: true,
        filename: __filename
    },
    async (conn, mek, m, { from, q }) => {
        try {
            m.react(global.reactions.download);
            await conn.sendMessage(
                from,
                { video: { url: q }, caption: config.FOOTER },
                { quoted: mek }
            );
            m.react(global.reactions.done);
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "dvdoc",
        dontAddCommandList: true,
        filename: __filename
    },
    async (conn, mek, m, { from, q }) => {
        try {
            m.react(global.reactions.download);
            await conn.sendMessage(
                from,
                {
                    document: { url: q },
                    mimetype: "video/mp4",
                    // fileName: "TikTok Audio" + ".mp3",
                    caption: config.FOOTER
                },
                { quoted: mek }
            );
            m.react(global.reactions.done);
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "dau",
        dontAddCommandList: true,
        filename: __filename
    },
    async (conn, mek, m, { from, q }) => {
        try {
            const query = q.split("|");
            const url = query[0];
            const mode = query[1];
            m.react(global.reactions.download);
            let audBuff;
            if (mode?.trim() === "convert") {
                const vidBuff = getBuffer(url);
                audBuff = toPTT(vidBuff, "mp4").options;
                m.react(global.reactions.loading);
            } else {
                audBuff = getBuffer(url);
            }
            await conn.sendMessage(
                from,
                {
                    document: audBuff,
                    mimetype: "audio/mpeg",
                    // fileName: "TikTok Audio" + ".mp3",
                    caption: config.FOOTER
                },
                { quoted: mek }
            );
            m.react(global.reactions.done);
        } catch (e) {
            m.sendError(e);
        }
    }
);
// ==================================
