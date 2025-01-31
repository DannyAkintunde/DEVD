const appleMusic = require("./applemusic");
const attp = require("./attp");
const aiodl = require("./aiodl");
const fbsaver = require("./fbsaver");
const fileUploader = require("./FileUploader");
const flux = require("./flux");
const maker = require("./maker");
const mediaFire = require("./mediafire");
const midjourney = require("./midjourney");
const soundcloud = require("./soundcloud");
const spotify = require("./spotify");
const stalker = require("./stalker");
const stablediff = require("./stablediff");
const text2prompt = require("./text2prompt");
const tiktok = require("./tiktok");
const threads = require("./threads");
const turboseek = require("./turboseek");
const igdl = require("./igdl");
const photoaid = require("./photoaid");
const printest = require("./printest");

// maker skleton
const Maker = new maker.Maker();

module.exports = {
    appleMusic,
    attp,
    aiodl,
    fbsaver,
    fileUploader,
    maker,
    Maker,
    mediaFire,
    midjourney,
    soundcloud,
    spotify,
    stalker,
    stablediff,
    text2prompt,
    tiktok,
    threads,
    turboseek,
    igdl,
    photoaid,
    printest
};
