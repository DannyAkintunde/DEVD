const fs = require("fs");
const path = require("path");
const config = require("../../config");
const chalk = require("chalk");

const getThemes = () =>
    fs
        .readdirSync(__dirname)
        .filter(file => path.extname(file).toLowerCase() == ".json")
        .map(theme => path.basename(theme, ".json").toUpperCase());

let themes = getThemes();

function deepMerge(obj1, obj2) {
    let result = {};

    for (let key in obj1) {
        if (obj2.hasOwnProperty(key)) {
            if (
                typeof obj1[key] === "object" &&
                typeof obj2[key] === "object"
            ) {
                result[key] = deepMerge(obj1[key], obj2[key]);
            } else {
                result[key] = obj2[key];
            }
        } else {
            result[key] = obj1[key];
        }
    }

    for (let key in obj2) {
        if (!obj1.hasOwnProperty(key)) {
            result[key] = obj2[key];
        }
    }

    return result;
}

function load(theme = "DEFAULT") {
    if (global.THEME && global.THEME.name === theme) return;
    console.log("loading Theme ", theme, "...");
    try {
        global.THEME = deepMerge(
            require(`defualt.json`.toLowerCase()),
            require(`${theme || "DEFAULT"}.json`.toLowerCase())
        );
        console.log(chalk.green(`${theme || "DEFAULT"} Theme Loaded :)`));
        process.emit("theme.intilised", theme);
    } catch (e) {
        console.error(`Error loading theme ${theme}: ${e.message}\n${e.stack}`);
        console.log("Avaliable Themes are ", JSON.stringify(themes));
    }
}

process.on("theme.update", () => {
    themes = getThemes();
});

module.exports = { THEME: global.THEME, load, themes };
