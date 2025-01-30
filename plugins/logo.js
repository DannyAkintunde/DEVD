const config = require("../config");
const { cmd, commands } = require("../command");
const parseCommand = require("../lib/commands/commandParser");
const {
    isUrl,
    getRandom,
    getFullFilePath,
    fetchJson,
    fetchBuffer
} = require("../lib/functions");
const { Maker: maker } = require("../lib/scrapers");
const fs = require("fs");
const axios = require("axios");

const defaultMeta = {
    category: "logo",
    react: global.reactions.picture
};

function createTextEffectCommands(effects, platform) {
    effects.text?.forEach(effect => {
        if (!effect.meta || !effect.url) {
            console.error(
                `Effect is missing metadata or URL: ${JSON.stringify(effect)}`
            );
            return;
        }
        cmd(
            { ...defaultMeta, ...effect.meta },
            async (conn, mek, m, { q, reply, prefix, command }) => {
                let input = q;
                if (m.quoted) {
                    input = m.quoted.body;
                    input = input
                        .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                        .trim();
                }
                const commandStr = `${prefix}${command} ${input}`;
                const parsedCommand = parseCommand(commandStr);
                const options = parsedCommand.options;
                const radios = (options.radio || options.radios || options.r)
                    ?.split(",")
                    .map(value => parseInt(value));
                const radiosValid =
                    radios?.every(x => !isNaN(x) && x >= 0) ?? true;
                input = parsedCommand.args.join(" ");
                if (!input)
                    return await reply("Text is required to create effect.");
                if (!radiosValid)
                    return await reply(
                        "Radios values invalid: radios must be integers greater than or equal to 0 sepreated by commas"
                    );
                const text = input.split(effect.seperator ?? "+");
                try {
                    const result = await maker[platform](effect.url, {
                        text,
                        radio: radios
                    });
                    m.react(global.reactions.success);
                    let caption = `${global.responses.effectCreated}`;
                    caption += `\n>${config.FOOTER}`;
                    m.replyImg({ url: result.directURL }, caption);
                } catch (e) {
                    m.sendError(e, e.message);
                }
            }
        );
    });
}
function createImageEffectCommands(effects, platform) {
    effects.image?.forEach(effect => {
        if (!effect.meta || !effect.url) {
            console.error(
                `Effect is missing metadata or URL: ${JSON.stringify(effect)}`
            );
            return;
        }
        cmd(
            { ...defaultMeta, ...effect.meta },
            async (conn, mek, m, { q, reply, prefix, command }) => {
                let input = q.trim();

                // Use quoted message if available
                if (m.quoted) {
                    input = m.quoted.body.trim();
                    input = input
                        .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                        .trim();
                }

                const commandStr = `${prefix}${command} ${input}`;
                const parsedCommand = parseCommand(commandStr);
                const options = parsedCommand.options;

                // Parse radios
                const radios = (options.radio || options.radios || options.r)
                    ?.split(",")
                    .map(value => parseInt(value));
                const radiosValid =
                    radios?.every(x => !isNaN(x) && x >= 0) ?? true;

                // Extract input arguments
                input = parsedCommand.args;
                if (!input || input.length === 0) {
                    return await reply(
                        "No input provided. Ensure you include required parameters."
                    );
                }

                // Parse images
                const images = input[0]
                    .split(effect.imageSeperator ?? ",")
                    .map(link => link.trim());
                if (!images || images.length === 0) {
                    return await reply(
                        "At least one valid image URL is required."
                    );
                }
                const allImageValid = images.every(isUrl);
                if (!allImageValid) {
                    const invalidImages = images.filter(image => !isUrl(image));
                    await reply("One or more provided image URLs are invalid.");
                    return await reply(
                        `Invalid image URLs: ${invalidImages.join(", ")}.`
                    );
                }

                // Parse text (if any)
                const text = input
                    .slice(1)
                    .join(" ")
                    .split(effect.seperator ?? "+");

                if (!radiosValid) {
                    return await reply(
                        "Invalid radio values. Ensure all are integers >= 0, separated by commas."
                    );
                }

                let imagePaths;
                try {
                    imagePaths = await Promise.all(
                        images.map(async imageUrl => {
                            const image = await fetchBuffer(imageUrl);
                            const imagePath = getFullFilePath(
                                getRandom(image.ext)
                            );
                            await fs.promises.writeFile(imagePath, image.data);
                            return imagePath;
                        })
                    );
                    const effectResult = await maker[platform](effect.url, {
                        text,
                        image: imagePaths,
                        radio: radios
                    });

                    m.react(global.reactions.success);
                    let caption = `${global.responses.effectCreated}`;
                    caption += `\n>${config.FOOTER}`;
                    m.replyImg({ url: effectResult.directURL }, caption);
                } catch (e) {
                    m.sendError(e, e.message);
                } finally {
                    if (imagePaths) {
                        await Promise.all(
                            imagePaths.map(async filePath => {
                                try {
                                    await fs.promises.unlink(filePath);
                                } catch (err) {
                                    console.error(
                                        `Error deleting file ${filePath}:`,
                                        err.message
                                    );
                                }
                            })
                        );
                    }
                }
            }
        );
    });
}

function generateEffectGenerator(platform) {
    return async (conn, mek, m, { q, reply, command, prefix }) => {
        let input = q;
        if (m.quoted) {
            input = m.quoted.body;
            input = input
                .replace(new RegExp(`${prefix}${command}`, "gi"), "")
                .trim();
        }
        const commandStr = `${prefix}${command} ${input}`;
        const parsedCommand = parseCommand(commandStr);
        const options = parsedCommand.options;
        const radios = (options.radio || options.radios || options.r)
            ?.split(",")
            .map(value => parseInt(value));
        const radiosValid = radios?.every(x => !isNaN(x) && x >= 0) ?? true;
        const images = (options.image || options.images || options.i)
            ?.split(",")
            .map(link => link.trim());
        const imagesValid = images?.every(isUrl);
        input = parsedCommand.args;
        if (!input || input.length === 0)
            return await reply(
                "No input provided. Ensure you include required parameters."
            );
        if (!radiosValid)
            return await reply(
                "Radios values invalid: radios must be integers greater than or equal to 0 sepreated by commas"
            );
        if (!imagesValid) {
            const invalidImages = images.filter(image => !isUrl(image));
            await reply("One or more provided image URLs are invalid.");
            return await reply(
                `Invalid image URLs: ${invalidImages.join(", ")}.`
            );
        }
        const url = input[0];
        let text;
        if (input.length > 1) text = input.slice(1).join(" ").split("+");
        if (!url) return await reply("Url is require to create effect");
        if (!isUrl(url))
            return await reply("A valid url is required to create effect.");
        let imagePaths;
        try {
            imagePaths = await Promise.all(
                images?.map(async imageUrl => {
                    const image = await fetchBuffer(imageUrl);
                    const imagePath = getFullFilePath(getRandom(image.ext));
                    await fs.promises.writeFile(imagePath, image.data);
                    return imagePath;
                }) ?? []
            );
            const effect = await maker[platform](url, {
                text,
                radio: radios,
                image: imagePaths
            });
            m.react(global.reactions.success);
            let caption = `${global.responses.effectCreated}`;
            caption += `\n>${config.FOOTER}`;
            m.replyImg({ url: effect.directURL }, caption);
        } catch (e) {
            m.sendError(e, e.message);
        } finally {
            if (imagePaths) {
                await Promise.all(
                    imagePaths.map(async filePath => {
                        try {
                            await fs.promises.unlink(filePath);
                        } catch (err) {
                            console.error(
                                `Error deleting file ${filePath}:`,
                                err.message
                            );
                        }
                    })
                );
            }
        }
    };
}

// <========textpro.me=========>
cmd(
    {
        pattern: "textpro",
        alias: ["tp"],
        desc: "create textpro effect from url",
        react: "✒️",
        use: `${global.Prefix.toString()}textpro <url> <text1+tex2...+textN>`
    },
    generateEffectGenerator("textpro")
);
//===============================

// <==========photooxy===========>
cmd(
    {
        pattern: "photooxy",
        alias: ["pxy"],
        desc: "create photooxy effect from url",
        react: "✒️",
        use: `${global.Prefix.toString()}photooxy <url> <text1+tex2...+textN>`
    },
    generateEffectGenerator("photooxy")
);
//================================

// <==========ephoto360==========>
cmd(
    {
        pattern: "ephoto360",
        alias: ["ep360"],
        desc: "create ephoto360 effect from url",
        react: "✒️",
        use: `${global.Prefix.toString()}ephoto360 <url> <text1+tex2...+textN>`
    },
    generateEffectGenerator("ephoto360")
);
//================================

async function init() {
    try {
        let effectsGistUrl =
            config.EFFECTS_CONFIG ||
            "https://gist.github.com/DannyAkintunde/1d657ee2d1e432c3dc772c39f8850563";

        const gistRegex = /(http(s)?:\/\/)?gist\.github\.com\/.+\/(.+)/;
        if (!gistRegex.test(effectsGistUrl)) {
            console.error("Invalid effects config gist URL");
            return;
        }

        const [, , , gistId] = effectsGistUrl.match(gistRegex);

        // Fetch Gist metadata
        const gistData = await fetchJson(
            `https://api.github.com/gists/${gistId}`
        );
        const effectFiles = gistData.files;

        // Validate the number of files
        if (Object.keys(effectFiles).length > 3) {
            throw new Error("Invalid gist provided: too many files");
        }

        const platforms = ["textpro", "photooxy", "ephoto360"];
        for (const platform of platforms) {
            const effectFile = effectFiles[`${platform}.json`];
            if (!effectFile) continue; // Skip platforms without config files

            let effects = effectFile.content;

            // Handle truncated files
            if (effectFile.truncated) {
                const response = await axios.get(effectFile.raw_url);
                effects = response.data;
            }

            // Parse JSON content
            let effectsJson;
            try {
                effectsJson = JSON.parse(effects);
            } catch (error) {
                console.error(
                    `Failed to parse JSON for ${platform}:`,
                    error.message
                );
                continue; // Skip this platform on error
            }

            // Create commands based on effect type
            if (effectsJson.text) {
                createTextEffectCommands(effectsJson, platform);
            }
            if (effectsJson.image) {
                createImageEffectCommands(effectsJson, platform);
            }

            console.log(`Initialized effects for platform: ${platform}`);
        }
    } catch (error) {
        console.error("Error during initialization:", error.message);
    }
}

process.on("plugin.initilised", init);
