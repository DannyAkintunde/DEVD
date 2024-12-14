const axios = require("axios");
const cheerio = require("cheerio");
// ES6 imports
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
const file_size_url = (...args) =>
    import("file_size_url").then(({ default: file_size_url }) =>
        file_size_url(...args)
    );
const tools = require("./config.js");

async function search(args) {
    let res = await fetch(
        tools.api(5, "/apps/search", {
            query: args,
            limit: 1000
        })
    );

    let ress = {};
    res = await res.json();
    ress = res.datalist.list.map(v => {
        return {
            name: v.name,
            id: v.package
        };
    });
    return ress;
}
async function download(id) {
    let res = await fetch(
        tools.api(5, "/apps/search", {
            query: id,
            limit: 1
        })
    );

    res = await res.json();
    let name = res.datalist.list[0].name;
    let package = res.datalist.list[0].package;
    let icon = res.datalist.list[0].icon;
    let dllink = res.datalist.list[0].file.path;
    let lastup = res.datalist.list[0].updated;
    let size = await file_size_url(dllink);
    return {
        name,
        lastup,
        package,
        size,
        icon,
        dllink
    };
}

function playStore(search) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, status } = await axios.get(
                `https://play.google.com/store/search?q=${search}&c=apps`
            );
            const hasil = [];
            const $ = cheerio.load(data);
            $(
                ".ULeU3b > .VfPpkd-WsjYwc.VfPpkd-WsjYwc-OWXEXe-INsAgc.KC1dQ.Usd1Ac.AaN0Dd.Y8RQXd > .VfPpkd-aGsRMb > .VfPpkd-EScbFb-JIbuQc.TAQqTe > a"
            ).each((i, u) => {
                const linkk = $(u).attr("href");
                const name = $(u)
                    .find(".j2FCNc > .cXFu1 > .ubGTjb > .DdYX5")
                    .text();
                const developer = $(u)
                    .find(".j2FCNc > .cXFu1 > .ubGTjb > .wMUdtb")
                    .text();
                const img = $(u).find(".j2FCNc > img").attr("src");
                const rate = $(u)
                    .find(".j2FCNc > .cXFu1 > .ubGTjb > div")
                    .attr("aria-label");
                const rate2 = $(u)
                    .find(".j2FCNc > .cXFu1 > .ubGTjb > div > span.w2kbF")
                    .text();
                const link = `https://play.google.com${linkk}`;

                hasil.push({
                    link: link,
                    name: name ? name : "No name",
                    developer: developer ? developer : "No Developer",
                    img: img ? img : "https://i.ibb.co/G7CrCwN/404.png",
                    rate: rate ? rate : "No Rate",
                    rate2: rate2 ? rate2 : "No Rate",
                    link_dev: `https://play.google.com/store/apps/developer?id=${developer
                        .split(" ")
                        .join("+")}`
                });
            });
            if (hasil.every(x => x === undefined))
                return resolve({
                    developer: "@xorizn",
                    mess: "no result found"
                });
            resolve(hasil);
        } catch (err) {
            console.error(err);
        }
    });
}

module.exports = { search, download, playStore };
