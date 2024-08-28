const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");

function parseButtons(button) {
    let out = [];
    button.forEach(item => {
        let itemCopy = { ...item };
        console.log(item);
        let btn = {};
        if (itemCopy.type == 1) btn.name = "quick_reply";
        else if (itemCopy.type == 2) btn.name = "cta_url";
        else if (itemCopy.type == 3) btn.name = "single_select";
        else if (itemCopy.type == 4) btn.name = "cta_copy";
        else btn.name = "quick_reply";
        delete itemCopy.type;

        const buttonDat = {
            ...(itemCopy.buttonId &&
            (btn.name == "quick_reply" || btn.name == "cta_copy")
                ? {
                      id: itemCopy.buttonId,
                      ...(btn.name == "cta_copy" && itemCopy.buttonText
                          ? (() => {
                                const o = {};
                                o[itemCopy.buttonId] = itemCopy.buttonText.text;
                                return o;
                            })()
                          : {})
                  }
                : {}),
            ...(itemCopy.buttonText && btn.name != "single_select"
                ? {
                      displayText: itemCopy.buttonText.displayText
                  }
                : {}),
            ...((itemCopy.url || itemCopy.merchant_url) && btn.name == "cta_url"
                ? {
                      url: itemCopy.url || itemCopy.merchant_url,
                      merchant_url: itemCopy.merchant_url || itemCopy.url
                  }
                : {}),
            ...(itemCopy.list && btn.name == "single_select"
                ? { ...itemCopy.list }
                : {})
        };
        console.log(btn);
        btn.buttonParamsJson = JSON.stringify(buttonDat);
        out.push(btn);
    });
    console.log(out);
    return out;
}

function generateHeader(header, text) {
    let body;
    if (!header) {
        if (text) {
            header = {};
            header.title = text.split("\n")[0];
            body =
                text.split("\n").length > 1
                    ? text.split("\n").slice(1).join("\n")
                    : "";
        } else {
            header = {};
            body = text;
        }
    } else body = text;
    return [header, body];
}

function getMediaKey(message) {
    const keys = ["image", "video", "document"];
    for (const i in keys) {
        if (message[keys[i]]) {
            // Check if the value is truthy
            return keys[i];
            // Return the key of the first truthy value
        }
    }
    return null;
    // Return null if no truthy value is found
}

async function loadButtonMessage(message, conn) {
    let out = {};
    let header = message.header;
    let text;
    let body;
    const footerText = message.footer;
    const buttons = parseButtons(message.buttons);
    const contextInfo = message.contextInfo ? message.contextInfo : {};
    const mediaMessageContent =
        message.image || message.document || message.video;
    const mediaKey = getMediaKey(message);

    if (mediaMessageContent) {
        const messageMedia = await prepareWAMessageMedia(
            {
                ...(() => {
                    const o = {};
                    o[mediaKey] = mediaMessageContent;
                    return o;
                })()
            },
            {
                upload: conn.waUploadToServer
            }
        );
        text = message.caption;
        const [genHeader, gbody] = generateHeader(header, text);
        header = genHeader;
        body = gbody;
    } else {
        text = message.text;
        const [genHeader, gbody] = generateHeader(header, text);
        header = genHeader;
        body = gbody;
    }
    out = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    ...contextInfo,
                    header: {
                        ...header,
                        ...(mediaMessageContent
                            ? {
                                  ...(mediaKey && mediaMessageContent
                                      ? await prepareWAMessageMedia(
                                            {
                                                ...(() => {
                                                    const o = {};
                                                    o[mediaKey] =
                                                        mediaMessageContent;
                                                    return o;
                                                })()
                                            },
                                            {
                                                upload: conn.waUploadToServer
                                            }
                                        )
                                      : {}),
                                  hasMediaAttachment: true
                              }
                            : { hasMediaAttachment: false })
                    },
                    body: {
                        text: body ? body : ""
                    },
                    footer: {
                        text: footerText ? footerText : ""
                    },
                    nativeFlowMessage: {
                        buttons,
                        messageParamsJson: ""
                    }
                }
            }
        }
    };
    return out;
}

module.exports = {
    loadButtonMessage,
    parseButtons
};
