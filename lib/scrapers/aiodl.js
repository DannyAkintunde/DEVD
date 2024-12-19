const axios = require('axios');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');

const step2down = {
    dl: async (link) => {
        try {
            const { data: api } = await axios.get('https://steptodown.com/');
            const token = cheerio.load(api)('#token').val();

            const { data } = await axios.post('https://steptodown.com/wp-json/aio-dl/video-data/', new URLSearchParams({ url: link, token }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': (new UserAgent()).toString()
                }
            });
            return data;
        } catch (error) {
            return { error: error.response?.data || error.message };
        }
    }
};

module.exports = step2down;