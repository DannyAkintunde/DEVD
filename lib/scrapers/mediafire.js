const axios = require('axios');
const cheerio = require('cheerio');
const mime = require('mime-types');

const mediaFireRegrex = /^((http|https):\/\/)?([A-z]{2,}\.)?(mediafire.com\/file)(.+)\/(.+)/g;

const mediaFire = {
    request: async (url) => {
        try {
            const response = await axios.get(`https://translate.google.com/translate?sl=en&tl=fr&hl=en&u=${encodeURIComponent(url)}&client=webapp`);
            if (response && response.headers["content-type"].includes("text/html")) {
                const data = response.data;
                const $ = cheerio.load(data);
                
                const downloadButtonUrl = $('#downloadButton').attr('href');
                const downloadLink = mediaFire.extractDownloadUrl(downloadButtonUrl);
                const sizeMatch = $('#downloadButton').text()?.match(/\(.+\)/);
                const size = sizeMatch ? sizeMatch[0].slice(1, -1) : 'Unknown size';
                const name = $('meta[property="og:title"]').attr('content') || 'Unknown file';
                const fileName = $('.dl-btn-label').attr('title') || 'Unknown file name';
                const thumbnail = $('meta[property="og:image"]').attr('content');
                const mimeType = mime.lookup(fileName) || 'aplication/octet-stream';
                
                return {
                    status: true,
                    name,
                    size,
                    mime: mimeType,
                    fileName,
                    thumbnail,
                    downloadLink
                };
            } else {
                return { status: false, error: 'Invalid response type' };
            }
        } catch (e) {
            return { status: false, error: e.message };
        }
    },
    extractDownloadUrl: (url) => {
        const downloadUrlRegrex = /((http|https):\/\/download[^\s&]+\.mediafire\.com[^\s&]+\/[^\s&]+)/;
        const matches = url.match(downloadUrlRegrex);
        return matches ? matches[0] : null; // Return null if no match found
    },
    validate: (url) => mediaFireRegrex.test(url)
};

module.exprots = mediaFire;

// Usage
// let url = 'https://www.mediafire.com/file/ic0nmflzed8fni7/AutoSave_Contact.apk/file';
// if (mediaFire.validate(url)) {
//    mediaFire.request(url).then(console.dir).catch(console.error);
// }

