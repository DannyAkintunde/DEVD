const config = require("../config");
const { cmd, commands } = require("../command");
const { igstalker, tikstalk, githubstalk, githubDescription, githubRoasting } = require("../lib/scrapers/stalker");
const { fetchJson, trans } = require("../lib/functions.js");


cmd(
    {
        pattern: "github",
        alias: ["githubstalk"],
        category: "stalk",
        reaction: "🔎",
        desc: "It gives details of given github username.",
        filename: __filename,
        use: ".github <user name>"
    },

    async (conn, mek, m, { q, reply, from }) => {
        if (!q) return await reply("*Please give me a github username !*");
        try {
            const githubProfileData = await githubstalk(q);
            let info = `*── 「 GITHUB USER INFO 」 ──*\n`
            const profileDescription = await githubDescription(githubProfileData);
            info += profileDescription;
            info += `└───────────◉`;
            await conn.sendMessage(
                from,
                {
                    image: { url: githubProfileData.profile_pic },
                    caption: info
                },
                { quoted: mek }
            );
        } catch (e) {
            m.sendError(e, "*I cant find this user on github !*");
        }
    }
);

cmd(
  {
    pattern: 'githubroast',
    alias: ['ghroast'],
    react: '🤣',
    desc: 'Give a github account a good roast',
    category: 'stalk',
    filename: __filename,
    use: '.githubroast <username>'
  },
  async (conn, mek, m, {q, reply, replyad}) => {
    if (!q) return await reply("*Please give me a github username to inspect!*");
    try {
      const roast = await githubRoasting(q);
      let translatedRoast = config.LANG === 'ID' || config.LANG === 'IND' ? roast : trans(roast, { to: config.LANG?.toLowerCase() });
      return replyad(roast, "Roasted 🤣");
    } catch (e) {
      return m.sendError(e, "*I cant find this user on github !*");
    }
  }
  );

cmd(
    {
        pattern: "stiktok",
        alias: ["tiktokstalk", "stalktiktok", "tikstalk"],
        react: "📱",
        desc: "It gives details of given tiktok username.",
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
            args,
            q,
            reply
        }
    ) => {
        try {
            if (!q) return reply("*Please give me a tiktok username !*");
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
            m.sendError(e, "*I cant find this user on tiktok !*");
        }
    }
);

cmd(
    {
        pattern: "igstalk",
        alias: ["instastalk", "instagramstalk", "igstalker"],
        react: "📷",
        desc: "It gives details of given instagram username.",
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
            args,
            q,
            reply
        }
    ) => {
        try {
            if (!q) return reply("*Please give me a instagram username !*");
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
            m.sendError(e, "*I cant find this user on instagram !*");
        }
    }
);

cmd(
    {
        pattern: "ipstalk",
        alias: ["ip", "sip", "searchip", "ip-locator"],
        react: "🌐",
        desc: "It gives details of given ip.",
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
            args,
            q,
            reply
        }
    ) => {
        try {
            if (!q) return reply("*Please give me a ip !*");
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
            m.sendError(e, "*I cant find this ip !*");
        }
    }
);