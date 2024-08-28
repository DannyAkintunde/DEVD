const { prepareWAMessageMedia } = require("@whiskeysockets/baileys");

function parseButtons(button) {
    let out = [];
    button.forEach(item => {
        console.log(item);
        let btn = {};
        if (item.type == 1) btn.name = "quick_reply";
        else if (item.type == 2) btn.name = "cta_url";
        else if (item.type == 3) btn.name = "single_select";
        else if (item.type == 4) btn.name = "cta_copy";
        else but.name = "quick_reply";
        console.log(btn.name);
        delete item.type;

        const buttonDat = {
            ...(item.buttonId &&
            (btn.name == "quick_reply" || btn.name == "cta_copy")
                ? {
                      id: item.buttonId,
                      ...(btn.name == "cta_copy" && item.buttonText
                          ? (() => {
                                const o = {};
                                o[item.buttonId] = item.buttonText.text;
                                return o;
                            })()
                          : {})
                  }
                : {}),
            ...(item.buttonText && btn.name != "single_select"
                ? {
                      displayText: item.buttonText.displayText
                  }
                : {}),
            ...((item.url || item.merchant_url) && btn.name == "cta_url"
                ? {
                      url: item.url || item.merchant_url,
                      merchant_url: item.merchant_url || item.url
                  }
                : {}),
            ...(item.list && btn.name == "single_select"
                ? { ...item.list }
                : {})
        };
        console.log(btn);
        btn.buttonParamsJson = JSON.stringify(buttonDat);
        out.push(btn);
    });
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

async function loadButtonMessage(message, conn) {
    let out = {};
    let header = message.header;
    let text;
    const footerText = message.footer;
    const buttons = parseButtons(message.buttons);
    const contextInfo = message.contextInfo ? message.contextInfo : {};
    const mediaMessageContent =
        message.image || message.document || message.video;
    if (mediaMessageContent) {
        const messageMedia = await prepareWAMessageMedia(mediaMessageContent, {
            upload: conn.waUploadToServer
        });
        text = message.caption;
        const [genHeader, body] = generateHeader(header, text);
        header = genHeader;
    } else {
        text = message.text;
        const [genHeader, body] = generateHeader(header, text);
        header = genHeader;
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
                                  ...messageMedia,
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
}
