const axios = require('axios');
const UserAgent = require('user-agents');

exports.turboseek = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userAgent = new UserAgent();
      const res = await axios("https://www.turboseek.io/api/getSources", {
        headers: {
          "content-type": "application/json",
          "user-agent": userAgent.toString()
        },
        data: JSON.stringify({
          question: query
        }),
        method: "POST"
      });

      const response = await axios("https://www.turboseek.io/api/getAnswer", {
        headers: {
          "content-type": "application/json",
          "user-agent": userAgent.toString()
        },
        data: {
          question: query,
          sources: res.data
        },
        method: "POST"
      });

      const regex = /"text":"(.*?)"/g;
      let matches;
      let result = '';
      
      while ((matches = regex.exec(response.data)) !== null) {
        result += matches[1];
      }

      resolve(result.replace(/\\n/g, '\n').replace(/\\/g, `"`).trim());
    } catch (error) {
      reject(error);
    }
  });
}

//exports.turboseek('What is a black hole')

module.exports = turboseek;