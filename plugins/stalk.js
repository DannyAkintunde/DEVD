const config = require("../config");
const { cmd, commands } = require("../command");
const axios = require("axios");
const { igstalker, tikstalk } = require("../lib/stalker");
const { fetchJson } = require("../lib/functions.js");

//--------
async function githubstalk(user) {
    return new Promise((resolve, reject) => {
        axios.get("https://api.github.com/users/" + user).then(({ data }) => {
            let info = {
                username: data.login,
                name: data.name,
                bio: data.bio,
                id: data.id,
                nodeId: data.node_id,
                profile_pic: data.avatar_url,
                html_url: data.html_url,
                type: data.type,
                admin: data.site_admin,
                company: data.company,
                blog: data.blog,
                location: data.location,
                email: data.email,
                public_repo: data.public_repos,
                public_gists: data.public_gists,
                followers: data.followers,
                following: data.following,
                created_at: data.created_at,
                updated_at: data.updated_at
            };
            resolve(info);
        });
    });
}

var desct = "";
if (config.LANG === "SI")
    desct = "එය ලබා දී ඇති github username පිළිබඳ විස්තර සපයයි.";
else desct = "It gives details of given github username.";
var needus = "";
if (config.LANG === "SI") needus = "*කරුණාකර මට github username ලබා දෙන්න !*";
else needus = "*Please give me a github username !*";
var cantf = "";
if (config.LANG === "SI")
    cantf = "*මට මෙම github පරිශීලකයා github හි සොයාගත නොහැක !*";
else cantf = "*I cant find this user on github !*";

cmd(
    {
        pattern: "github",
        alias: ["githubstalk"],
        category: "stalk",
        reaction: "🔎",
        desc: desct,
        filename: __filename,
        use: config.PREFIX + "github <user name>"
    },

    async (conn, mek, m, { args, reply, from }) => {
        if (!args[0]) return await reply(needus);
        try {
            const {
                username,
                following,
                followers,
                type,
                bio,
                company,
                blog,
                location,
                email,
                public_repo,
                public_gists,
                profile_pic,
                created_at,
                updated_at,
                html_url,
                name,
                id
            } = await githubstalk(args.join(" "));
            const info = `*── 「 GITHUB USER INFO 」 ──*

🔖 *Nickname :* ${name}
🔖 *Username :* ${username}
🚩 *Id :* ${id}
✨ *Bio :* ${bio}
🏢 *Company :* ${company}
📍 *Location :* ${location}
📧 *Email :* ${email}
📰 *Blog :* ${blog}
🔓 *Public Repos :* ${public_repo}
🔐 *Public Gists :* https://gist.github.com/${username}/
💕 *Followers :* ${followers}
👉 *Following :* ${following}
🔄 *Updated At :* ${updated_at}
🧩 *Created At :* ${created_at}
👤 *Profile :* ${html_url}`;
            await conn.sendMessage(
                from,
                {
                    image: { url: profile_pic },
                    caption: info
                },
                { quoted: mek }
            );
        } catch (e) {
            m.sendError(e, cantf);
        }
    }
);

var desct = "";
if (config.LANG === "SI")
    desct = "එය ලබා දී ඇති tiktok username පිළිබඳ විස්තර සපයයි.";
else desct = "It gives details of given tiktok username.";
var needus = "";
if (config.LANG === "SI") needus = "*කරුණාකර මට tiktok username ලබා දෙන්න !*";
else needus = "*Please give me a tiktok username !*";
var cantf = "";
if (config.LANG === "SI")
    cantf = "*මට මෙම tiktok පරිශීලකයා tiktok හි සොයාගත නොහැක !*";
else cantf = "*I cant find this user on tiktok !*";

cmd(
    {
        pattern: "stiktok",
        alias: ["tiktokstalk", "stalktiktok", "tikstalk"],
        react: "📱",
        desc: desct,
        category: "stalk",
        use: ".stiktok <tiktok username>",
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
            if (!q) return reply(needus);
            const dataget = await tikstalk(args[0]);
            const cap = `「 ${config.BOT} 」

*── 「 TIKTOK USER INFO 」 ──*

*🆔 Username:* ${dataget.username}

*👤 Name:* ${dataget.name}

*🐾 Bio:* ${dataget.bio}

*🚶🏽 Following:* ${dataget.following}

*👥 Followers:* ${dataget.followers}

*💌 Likes:* ${dataget.likes}

└───────────◉`;
            await conn.sendMessage(
                from,
                { image: { url: dataget.img }, caption: cap },
                { quoted: mek }
            );
        } catch (e) {
            m.sendError(e, cantf);
        }
    }
);

var desct = "";
if (config.LANG === "SI")
    desct = "එය ලබා දී ඇති instagram username පිළිබඳ විස්තර සපයයි.";
else desct = "It gives details of given instagram username.";
var needus = "";
if (config.LANG === "SI")
    needus = "*කරුණාකර මට instagram username ලබා දෙන්න !*";
else needus = "*Please give me a instagram username !*";
var cantf = "";
if (config.LANG === "SI")
    cantf = "*මට මෙම instagram පරිශීලකයා instagram හි සොයාගත නොහැක !*";
else cantf = "*I cant find this user on instagram !*";

cmd(
    {
        pattern: "igstalk",
        alias: ["instastalk", "instagramstalk", "igstalker"],
        react: "📷",
        desc: desct,
        category: "stalk",
        use: ".igstalk <instagram username>",
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
            if (!q) return reply(needus);
            const dataget = await igstalker(q);
            const cap = `「 ${config.BOT} 」

── 「 INSTA USER INFO」 ──

*🆔 Username:* ${dataget.username}

*👤 Name:* ${dataget.fullname}

*🐾 Bio:* ${dataget.bio}

*🚶🏽 Following:* ${dataget.following}

*👥 Followers:* ${dataget.followers}

*📬 Post count:* ${dataget.post}

└───────────◉`;
            await conn.sendMessage(
                from,
                { image: { url: dataget.profile }, caption: cap },
                { quoted: mek }
            );
        } catch (e) {
            m.sendError(e, cantf);
        }
    }
);

var desct = "";
if (config.LANG === "SI") desct = "එය ලබා දී ඇති ip එක පිළිබඳ විස්තර සපයයි.";
else desct = "It gives details of given ip.";
var needus = "";
if (config.LANG === "SI") needus = "*කරුණාකර මට ip එකක් ලබා දෙන්න !*";
else needus = "*Please give me a ip !*";
var cantf = "";
if (config.LANG === "SI") cantf = "*මට මෙම ip එක සොයාගත නොහැක !*";
else cantf = "*I cant find this ip !*";

cmd(
    {
        pattern: "ipstalk",
        alias: ["ip", "sip", "searchip", "ip-locator"],
        react: "🌐",
        desc: desct,
        category: "stalk",
        use: ".ipstalk 112.134.193.130",
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
            if (!q) return reply(needus);
            if (!q.includes(".")) return reply(needus);
            const IP = "IP :";
            const ST = "STATUS :";
            const CONTINENT = "CONTINENT :";
            const COUNTRY = "COUNTRY :";
            const COUNTRYCODE = "COUNTRYCODE :";
            const REGIONNAME = "REGIONNAME :";
            const CITY = "CITY :";
            const ZIP = "ZIP :";
            const CURRENCY = "CURRENCY :";
            const ISP = "ISP :";
            const MOBILE = "MOBILE :";
            const PROXY = "PROXY :";
            const r = await fetchJson("https://api.techniknews.net/ipgeo/" + q);
            const wea =
                `「 ${config.BOT} 」

*── 「 IP INFO 」 ──*
    
` +
                "*🔴 " +
                IP +
                "* ```" +
                q +
                "```\n" +
                "*✅" +
                ST +
                "* ```" +
                r.status +
                "```\n" +
                "*🌐" +
                CONTINENT +
                "* ```" +
                r.continent +
                "```\n" +
                "*🗺" +
                COUNTRY +
                "* ```" +
                r.country +
                "```\n" +
                "*🔢" +
                COUNTRYCODE +
                "* ```" +
                r.countryCode +
                "```\n" +
                "*🌍" +
                REGIONNAME +
                "* ```" +
                r.regionName +
                "```\n" +
                "*🚩" +
                CITY +
                "* ```" +
                r.city +
                "```\n" +
                "*🏛" +
                ZIP +
                "* ```" +
                r.zip +
                "```\n" +
                "*💸" +
                CURRENCY +
                "* ```" +
                r.currency +
                "```\n" +
                "*📡" +
                ISP +
                "* ```" +
                r.isp +
                "```\n" +
                "*🛡" +
                PROXY +
                "* ```" +
                r.proxy +
                "```\n" +
                "*📱" +
                MOBILE +
                "* ```" +
                r.mobile +
                "```\n\n" +
                "└───────────◉";
            await conn.replyad(wea);
        } catch (e) {
            m.sendError(e, cantf);
        }
    }
);
