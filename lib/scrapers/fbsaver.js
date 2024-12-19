const axios = require('axios');
const cheerio = require('cheerio');

const fsaver = {
  download: async (urls) => {
    const url = `https://fsaver.net/download/?url=${urls}`;
    const headers = {
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"'
    };
    try {
        const response = await axios.get(url, { headers });
        const html = response.data;
        const data = fsaver.getData(html);
        data.success = true;
        return data;
    } catch (error) {
      return { success: false, message: error.message };
      console.error("Error:", error.response ? error.response.data : error.message);      
    }
  },
  getData: async (content) => {
    try {
      const baseUrl = 'https://fsaver.net';
      const $ = cheerio.load(content);
      const videoSrc = $('.video__item').attr('src');
      const videoPoster = $('.video__item').attr('poster');
      const name = $('.download__item__user_info div').first().text().trim()
      const profilePicture = baseUrl + $('.download__item__profile_pic img').attr('src')
      
      const result = {
         title: null,
         video: baseUrl + videoSrc,
         thumbnail: baseUrl + videoPoster,
         userInfo: {
           name,
           profilePicture,
         },
      };
      return result;
    } catch (error) {
      return { success: false, message: error.message };
      console.error("Error:", error.response ? error.response.data : error.message);
    }
  }
}

module.exports = fsaver ;