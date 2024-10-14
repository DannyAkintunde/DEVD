const config = require("../config")

const config = {
  OWNER_NAME: 'Danny',
  OWNER_NUMBER: '2348098309204'
}

global.APIKEYS = {
    yanz: ["Danny"],
    betabotz: ["CLftgUOG"],
    zubair: ["4c8dc29dc35b8e258b"],
    fastapi: []
};

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const APPAPIs = {
  1:'https://apkcombo.com',
  2:'apk-dl.com',
  3:'https://apk.support',
  4:'https://apps.evozi.com/apk-downloader',
  5:'http://ws75.aptoide.com/api/7',
  6:"https://cafebazaar.ir"
}

global.APIS = {
  itzpire:"https://itzpire.com",
  yanz:"https://api.yanzbotz.live",
  betabotz:"https://api.betabotz.eu.org",
  fastapi:"https://fastrestapis.fasturl.cloud",
  zubair:"https://api.maher-zubair.xyz"
}

global.getApi = (ID, path = '/', query = {}) => (ID in global.APIS ? global.APIS[ID] : ID) + path + (query ? '?' + new URLSearchParams(Object.entries({...query})) : '')

// Init for fastapi
/*
const fastKey = (async function getFastKey() {
  let res = await fetch(global.getApi("fastapi","/api/register", {username: `${config.OWNER_NAME}-${config.OWNER_NUMBER}`}));
  console.log(await res.text())
  if (res.status != 200) return
  let data = await res.text();
  console.log(data)
  let key = data.split("\n")[1].slice(9).trim();
  return key
})()
global.APIKEYS.fastapi ? global.APIKEYS.fastapi = [] : null
global.APIKEYS.fastapi.push(fastKey)
*/
const Proxy = (url)=>(url ? `https://translate.google.com/translate?sl=en&tl=fr&hl=en&u=${encodeURIComponent(url)}&client=webapp`: '')

const apkApi = (ID, path = '/', query = {}) => (ID in APIs ? APIs[ID] : ID) + path + (query ? '?' + new URLSearchParams(Object.entries({...query})) : '')


module.exports = { APIs:APPAPIs, Proxy, api:apkApi}