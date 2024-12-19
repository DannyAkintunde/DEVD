const axios = require("axios");
const UserAgent = require("user-agents");

const clean = data => {
    let regex = /(<([^>]+)>)/gi;
    data = data.replace(/(<br?\s?\/>)/gi, " \n");
    return data.replace(regex, "");
};

async function shortener(url) {
    return url; // url shortener logic goes here
}

const Tiktok = async query => {
    const userAgent = new UserAgent();
    let response = await axios("https://lovetik.com/api/ajax/search", {
        method: "POST",
        data: new URLSearchParams(Object.entries({ query })),
        headers: {
            "User-Agent": userAgent.toString()
        }
    });

    result = {};

    result.creator = "Danny";
    result.title = clean(response.data.desc);
    result.author = clean(response.data.author);
    result.nowm = await shortener(
        (response.data.links[0].a || "").replace("https", "http")
    );
    result.watermark = await shortener(
        (response.data.links[1].a || "").replace("https", "http")
    );
    result.audio = await shortener(
        (response.data.links[2].a || "").replace("https", "http")
    );
    result.thumbnail = await shortener(response.data.cover);
    return result;
};

module.exports = Tiktok;
