const config = require("../config");
const { cmd, commands } = require("../command");
const {
    trans,
    isValidLangCode,
    isUrl,
    fetchBuffer
} = require("../lib/functions");
const axios = require("axios");
const util = require("util");

const readmore = String.fromCharCode(8206).repeat(999);

cmd(
    {
        pattern: "tr",
        alias: ["translate"],
        react: "📱",
        desc: `it helps translate text to ${config.LANG}`,
        category: "tools",
        use: ".tr Bonjour",
        filename: __filename
    },
    async (conn, mek, m, { q, prefix, command, args, reply }) => {
        if (!q && !m.quoted?.body) return reply("i need a query !");
        let langCode = (await isValidLangCode(config.LANG.toLowerCase()))
            ? config.LANG.toLowerCase()
            : "en";
        let text = q;
        if (m.quoted) {
            text = m.quoted.body;
            text = text
                .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                .trim();
        }
        trans(text, { to: langCode })
            .then(res => reply(res))
            .catch(e => {
                m.sendError(e);
            });
    }
);

cmd(
    {
        pattern: "trt",
        alias: ["translateto"],
        react: "📱",
        desc: "it helps translate text",
        category: "tools",
        use: ".trt en Bonjour",
        filename: __filename
    },
    async (conn, mek, m, { q, prefix, command, args, reply }) => {
        if (!q) return reply("i need a query !");
        if (args.length < 2 && !m.quoted)
            return reply("invalid format try\n> .trt en Bonjour");
        if (!(await isValidLangCode(args[0].toLowerCase())))
            return reply(`no such language as ${args[0]}`);
        let text = args.slice(1).join(" ");
        if (m.quoted) {
            text = m.quoted.body;
            text = text
                .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                .trim();
        }
        trans(text, { to: args[0].toLowerCase() })
            .then(res => reply(res))
            .catch(e => {
                m.sendError(e);
            });
    }
);

cmd(
    {
        pattern: "readmore",
        alias: ["readm"],
        react: "📖",
        use: ".readmore <text1> | <text2>",
        desc: "generates readmore messages",
        filename: __filename
    },
    async (conn, mek, m, { q, args, reply }) => {
        if (!q) return reply(global.reactions.noquery);
        const inputs = q.split("|");
        const [text1, text2] =
            inputs.length >= 2 ? inputs : [undefined, undefined];
        m.react(global.reactions.done);
        reply(text1 + readmore + text2);
    }
);

cmd(
    {
        pattern: "fetch",
        alias: "get",
        react: global.reactions.loading,
        desc: "fetch data from URL/URI",
        category: "tools",
        use: ".fetch <URL/URI>",
        filename: __filename
    },
    async (conn, mek, m, { q, prefix, command, args, reply, isSuperUser }) => {
        if (!q) return reply("i need a <URL/URI> !");
        if (args.length < 1 && !m.quoted)
            return reply("invalid format try\n> .fetch https://example.com");
        if (!isSuperUser)
            return reply("You are not authorised to use this command.");
        let text = args.join(" ");
        if (m.quoted) {
            text = m.quoted.body;
            text = text
                .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                .trim();
        }
        if (!isUrl(text)) return reply("Need a valid <URL/URI>.");
        try {
            const url = encodeURI(text);
            const response = await axios.get(url, {
                responseType: "arraybuffer"
            });
            const output = util.format(response);
            if (/text|json|html|plain/.test(response.headers["content-type"])) {
                reply(util.format(new Buffer(response.data).toString()));
                reply(output);
            } else if (/image/.test(response.headers["content-type"])) {
                m.replyImg(response.data, `${output}`);
            } else if (/video/.test(response.headers["content-type"])) {
                m.replyVid(response.data, `${output}`);
            } else {
                const file = await fetchBuffer(response.data);
                m.replyDoc(file.data, m.chat, {
                    mentions: [m.sender],
                    filename: file.name,
                    mimetype: file.mime
                });
            }
        } catch (e) {
            m.sendError(e);
        }
    }
);
