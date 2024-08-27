const config = require("../config");
const { cmd, commands } = require("../command");
const { trans, isValidLangCode } = require("../lib/functions");

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
    async (conn, mek, m, { q, args, reply }) => {
        if (!q && !m.quoted) return reply("i need a query !");
        let langCode = (await isValidLangCode(config.LANG.toLowerCase()))
            ? config.LANG.toLowerCase()
            : "en";
        let text = q;
        if (m.quoted) {
            text = m.quoted.body;
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
    async (conn, mek, m, { q, args, reply }) => {
        if (!q) return reply("i need a query !");
        if (args.length < 2 && !m.quoted)
            return reply("invalid format try\n> .trt en Bonjour");
        if (!(await isValidLangCode(args[0].toLowerCase())))
            return reply(`no such language as ${args[0]}`);
        let text = args.slice(1).join(" ");
        if (m.quoted) {
            text = m.quoted.body;
        }
        trans(text, { to: args[0].toLowerCase() })
            .then(res => reply(res))
            .catch(e => {
                m.sendError(e);
            });
    }
);
