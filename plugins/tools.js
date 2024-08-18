const config = require("../config");
const { cmd, commands } = require("../command");
const { trans } = require("../lib/functions");

cmd(
    {
        pattern: "trt",
        alias: ["translate"],
        react: "📱",
        desc: "it helps translate text",
        category: "tool",
        use: ".trt en Bonjour",
        filename: __filename
    },
    async (conn, mek, m, { q, l, args, reply }) => {
        if (!q) return reply("i need a query !");
        let langCode = "en";
        if (args.length >= 2) {
            langCode = args[0];
        }
        trans(args.splice(1).join(" "), { to: langCode })
            .then(res => reply(res))
            .catch(e => {
                l(e);
                reply(global.THEME.responses.error);
            });
    }
);
