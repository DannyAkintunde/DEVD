const config = require("../config");
const { cmd, commands } = require("../command");

cmd(
    {
        pattern: "hidetag",
        react: "🔖",
        alias: ["tagall", "tag"],
        desc: "It tags a text to all members in group.",
        category: "group",
        use: ".hidetag <hi>",
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
            if (!isGroup) return reply(global.responses.group);
            if (!isAdmins) return reply(global.responses.admin);
            if (!q) return await reply("*Give me text to tag !*");
            conn.sendMessage(from, {
                text: q ? q : "",
                mentions: participants.map(a => a.id)
            });
            await conn.sendMessage(from, {
                react: { text: `✅`, key: mek.key }
            });
        } catch (e) {
            m.sendError(e);
        }
    }
);
