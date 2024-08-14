const fs = require("fs");
const path = require("path");
const config = require("../../config");
const chalk = require("chalk");

const getThemes = () =>
    fs
        .readdirSync("../")
        .filter(file => path.extname(file).toLowerCase() == ".json")
        .map(theme => theme.toUpperCase());

let themes = getThemes();

function load(theme = "DEFAULT") {
    if (global.THEME.name == theme) return;
    console.log("loading Theme ", theme, "...");
    try {
        global.THEME = require(`./${theme || "DEFAULT"}.json`.toLowerCase());
        console.log(chalk.green(`${theme || "DEFAULT"} Theme Loaded :)`));
    } catch (e) {
        console.error(`Error loading theme ${theme}: ${e.message}\n${e.stack}`);
        console.log("Avaliable Themes are ", JSON.stringify(themes));
    }
}

if (themes.includes(config.THEME)) {
    load(config.THEME);
}

process.on("theme.update", () => {
    themes = getThemes();
});

module.exports = { THEME: global.THEME, load, themes };
