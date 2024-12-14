const fs = require("fs");
const path = require("path");
const config = require("../../config");
const chalk = require("chalk");

const getThemes = () =>
    fs
        .readdirSync(__dirname)
        .filter(file => path.extname(file).toLowerCase() == ".json")
        .map(theme => path.basename(theme, ".json").toUpperCase());

// Theme Defaults
const base = require("./default.json");

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
    if (global.THEME && global.THEME.name.toUpperCase() === theme) return;
    console.log("loading Theme ", theme, "...");
    if (!themes.includes(theme.toUpperCase())) {
        console.warn(chalk.yellow(`Theme ${chalk.bold(theme)} not found. Using ${chalk.green.bold('DEFAULT')} theme.`));
        global.THEME = base;
        process.emit('theme.intilised', base.name);
        return
    }
    if (theme === 'DEFUALT') {
      global.THEME = base;
      process.emit('theme.intilised', base);
    }
    try {
        global.THEME = deepMerge(
            base,
            require(`./${theme}.json`.toLowerCase())
        );
        console.log(chalk.green(`${theme} Theme Loaded :)`));
        process.emit("theme.intilised", theme);
    } catch (e) {
        console.error(chalk.red(`Error loading theme ${chalk.bold.green(theme)}: ${e.message}\n${e.stack}`));
        console.log(chalk.yellow("Avaliable Themes are :", JSON.stringify(themes)));
        console.warn("Using DEFUALT theme.");
        global.THEME = base;
        process.emit('theme.intilised', base);
    }
}

process.on("theme.update", () => {
    themes = getThemes();
});

process.on("theme.intilised", (theme) => {
    global.responses = global.THEME.responses;
    global.reactions = global.THEME.reactions;
    console.log('Current theme:');
    console.dir(theme, {depth: null});
});

module.exports = { THEME: global.THEME, load, themes };
