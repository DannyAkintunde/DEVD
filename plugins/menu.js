const { cmd, commands, categories } = require("../command");
const config = require("../config");
const { randomInt, randChoice } = require("../lib/functions");

const defualtBtn = [
    {
        buttonId: `${config.PREFIX}sc`,
        buttonText: {
            displayText: "BOT SCRIPT"
        },
        type: 1
    },
    {
        buttonId: `${config.PREFIX}ping`,
        buttonText: {
            displayText: "CHECK PING"
        },
        type: 1
    }
];

function genMenu(
    category,
    pattern,
    images,
    react = "⬇👨‍💻",
    buttons = defualtBtn
) {
    console.log(
        `generating ${pattern} ${category} ${images} ${react} ${buttons} `
    );
    cmd(
        {
            pattern: pattern,
            react: react,
            dontAddCommandList: true,
            filename: __filename
        },
        async (
            conn,
            mek,
            m,
            {
                from,
                prefix,
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
                let menuc = `*● ══════════════ ●*
      
*${category.toUpperCase()} COMMANDS MENU*\n\n`;
                for (let i = 0; i < commands.length; i++) {
                    if (commands[i].category === category) {
                        if (!commands[i].dontAddCommandList) {
                            menuc += `*📍➣Command :* ${commands[i].pattern}\n*📃➣Desc :* ${commands[i].desc}\n*⌛➣Use:* ${commands[i].use}\n\n`;
                        }
                    }
                }

                let buttonMessaged = {
                    image: {
                        url: config.MENU_MEDIA
                            ? randChoice(config.MENU_MEDIA.split(","))
                            : undefined || randChoice(images)
                    },
                    caption: menuc,
                    footer: config.FOOTER,
                    headerType: 4,
                    buttons: buttons
                };
                return await conn.buttonMessage(from, buttonMessaged, mek);
            } catch (e) {
                reply("*ERROR !!*");
                l(e);
            }
        }
    );
}

// gen Menus
function init(conn) {
    console.log("catigories: ", JSON.stringify(categories));
    for (let i = 0; i < categories.length; i++) {
        const cat = global.THEME.menus[categories[i].toUpperCase()];
        let pattern = cat?.pattern ? cat?.pattern : categories[i] + "menu";
        let images = cat?.images ? cat?.images : [config.LOGO];
        genMenu(categories[i], pattern, images, cat?.react, cat?.buttons);
    }
}

process.on("plugin.initilised", init);
