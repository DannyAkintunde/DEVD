const config = require("../config");
const { cmd, commands } = require("../command");
const { trans } = require("../lib/functions");

cmd(
    {
        pattern: "trt",
        alias: ["translate"],
        react: "📱",
        desc: "it helps translate text",
        category: "tools",
        use: ".trt en Bonjour",
        filename: __filename
    },
    async (conn, mek, m, { q, l, args, reply }) => {
        if (!q) return reply("i need a query !");
        if (!arg[0]) return reply("please specify a language.");
        let langCode = args[0];
        trans(args.splice(1).join(" "), { to: langCode })
            .then(res => reply(res))
            .catch(e => {
                m.sendError(e)
            });
    }
);
