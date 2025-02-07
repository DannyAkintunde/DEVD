const { cmd, commands, categories } = require("../command");
const config = require("../config");
const { randomInt, randChoice, getBuffer } = require("../lib/functions");
const { convertTemplateToES6 } = require("../lib/templar");

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
                const obj = {
                    category,
                    commands
                };
                let menu = global.THEME.menus[category.toUpperCase()]
                    ? global.THEME.menus[category.toUpperCase()]
                    : global.THEME.menus["default".toUpperCase()];
                let menuc = `${convertTemplateToES6(menu.templates.header, obj)}
                ${convertTemplateToES6(menu.templates.body, obj)}
                ${convertTemplateToES6(menu.templates.footer, obj)}`;
                let buttonMessage = {
                    image: await getBuffer(
                        config.MENU_MEDIA
                            ? randChoice(config.MENU_MEDIA.split(","))
                            : undefined || randChoice(images)
                    ),
                    caption: menuc,
                    footer: config.FOOTER,
                    headerType: 4,
                    buttons: buttons
                };
                return await conn.buttonMessage(from, buttonMessage, mek);
            } catch (e) {
                m.sendError(e);
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
        let images = cat?.images ? cat.images : [config.LOGO];
        genMenu(categories[i], pattern, images, cat?.react, cat?.buttons);
    }
}

process.on("plugin.initilised", init);
