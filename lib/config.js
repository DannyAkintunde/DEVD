const config = require("../config");

global.APIKEYS = {
    yanz: ["Danny"],
    betabotz: ["CLftgUOG"],
    nexoracle: ["4c8dc29dc35b8e258b", "free_key@maher_apis"],
};

const APPAPIs = {
    1: "https://apkcombo.com",
    2: "apk-dl.com",
    3: "https://apk.support",
    4: "https://apps.evozi.com/apk-downloader",
    5: "http://ws75.aptoide.com/api/7",
    6: "https://cafebazaar.ir"
};

global.APIS = {
    itzpire: "https://itzpire.com",
    yanz: "https://api.yanzbotz.web.id",
    betabotz: "https://api.betabotz.eu.org",
    nyxs: "https://api.nyxs.pw",
    jikan: "https://api.jikan.moe",
    astral: "https://x-astral.apbiz.xyz",
    vreden: "https://api.vreden.my.id",
    nexoracle: "https://api.nexoracle.com",
    bk9: "https://bk9.fun"
};

global.getApi = (ID, path = "/", query = null) =>
    (ID in global.APIS ? global.APIS[ID] : ID) +
    path +
    (query ? "?" + new URLSearchParams(Object.entries({ ...query })) : "");

const Proxy = url =>
    url
        ? `https://translate.google.com/translate?sl=en&tl=fr&hl=en&u=${encodeURIComponent(
              url
          )}&client=webapp`
        : "";

const apkApi = (ID, path = "/", query = {}) =>
    (ID in APPAPIs ? APPAPIs[ID] : ID) +
    path +
    (query ? "?" + new URLSearchParams(Object.entries({ ...query })) : "");

module.exports = { APIs: APPAPIs, Proxy, api: apkApi };
