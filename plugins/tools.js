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
        let langCode = "en";
        if (args.length > 1) {
            langCode = arg[0];
            q = q.slice(1).join(" ");
        }
        trans(q, { to: langCode })
            .then(res => reply(res))
            .catch(e => {
                m.sendError(e);
            });
    }
);
