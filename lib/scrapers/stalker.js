const axios = require("axios");
const cheerio = require("cheerio");
const UserAgent = require("user-agents");

async function tikstalk(user) {
    let res = await axios.get(`https://urlebird.com/user/${user}/`, {
        headers: { "user-agent": new UserAgent().toString() }
    });
    let $ = cheerio.load(res.data);
    const pp_user = $(
        'div[class="col-md-auto justify-content-center text-center"] > img'
    ).attr("src");
    const name = $("h1.user").text().trim();
    const username = $("div.content > h5").text().trim();
    const followers = $('div[class="col-7 col-md-auto text-truncate"]')
        .text()
        .trim()
        .split(" ")[1];
    const following = $('div[class="col-auto d-none d-sm-block text-truncate"]')
        .text()
        .trim()
        .split(" ")[1];
    const description = $("div.content > p").text().trim();
    return {
        profile: pp_user,
        name: username,
        username: name,
        followers,
        following,
        desc: description,
        bio: $(
            "body > div.main > div.container-fluid.mt-4.mt-md-2 > div > div.col-md-auto.text-center.text-md-left.pl-0 > div > p"
        )
            .text()
            .trim(),
        likes: $(
            "body > div.main > div.container-fluid.mt-4.mt-md-2 > div > div.col-md-auto.text-center.text-md-left.pl-0 > div > div > div > div:nth-child(1)"
        )
            .text()
            .trim()
            .split("🧡 ")[1]
    };
}

function igstalker(Username) {
    return new Promise((resolve, reject) => {
        axios
            .get("https://dumpor.com/v/" + encodeURIComponent(Username), {
                headers: {
                    cookie: "_inst_key=SFMyNTY.g3QAAAABbQAAAAtfY3NyZl90b2tlbm0AAAAYWGhnNS1uWVNLUU81V1lzQ01MTVY2R0h1.fI2xB2dYYxmWqn7kyCKIn1baWw3b-f7QvGDfDK2WXr8",
                    "user-agent":
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
                }
            })
            .then(res => {
                const $ = cheerio.load(res.data);
                const result = {
                    profile: $(
                        "#user-page > div.user > div.row > div > div.user__img"
                    )
                        .attr("style")
                        .replace(/(background-image: url\(\'|\'\);)/gi, ""),
                    fullname: $(
                        "#user-page > div.user > div > div.col-md-4.col-8.my-3 > div > a > h1"
                    ).text(),
                    username: $(
                        "#user-page > div.user > div > div.col-md-4.col-8.my-3 > div > h4"
                    ).text(),
                    post: $(
                        "#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(1)"
                    )
                        .text()
                        .replace(" Posts", ""),
                    followers: $(
                        "#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(2)"
                    )
                        .text()
                        .replace(" Followers", ""),
                    following: $(
                        "#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(3)"
                    )
                        .text()
                        .replace(" Following", ""),
                    bio: $(
                        "#user-page > div.user > div > div.col-md-5.my-3 > div"
                    )
                        .text()
                        .trim()
                };
                resolve(result);
            });
    });
}

//--------
function githubstalk(user) {
    return new Promise(async (resolve, reject) => {
        try {
            const profileResponse = await axios.get(
                "https://api.github.com/users/" + user
            );
            const profileData = profileResponse.data;
            const reposResponse = await axios.get(profileData.repos_url);
            const reposData = reposResponse.data;
            const followersResponse = await axios.get(
                profileData.followers_url
            );
            const followingResponse = await axios.get(
                profileData.following_url.replace("{/other_user}", "")
            );
            const followersData = followersResponse.data;
            const followingData = followingResponse.data;

            const oldestRepos = reposData
                .slice()
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .slice(0, 5);
            const newestRepos = reposData
                .slice()
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5);
            const popularRepos = reposData
                .slice()
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 5);
            const leastStarredRepos = reposData
                .slice()
                .sort((a, b) => a.stargazers_count - b.stargazers_count)
                .slice(0, 5);
            const mostStarredRepo = reposData
                .slice()
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 5);

            let info = {
                username: profileData.login,
                name: profileData.name,
                bio: profileData.bio,
                id: profileData.id,
                nodeId: profileData.node_id,
                profile_pic: profileData.avatar_url,
                html_url: profileData.html_url,
                type: profileData.type,
                admin: profileData.site_admin,
                company: profileData.company,
                blog: profileData.blog,
                location: profileData.location,
                email: profileData.email,
                public_repos_no: profileData.public_repos,
                public_gists_no: profileData.public_gists,
                public_gists_url: `https://gist.github.com/${profileData.username}/`,
                followers_no: profileData.followers,
                following_no: profileData.following,
                created_at: profileData.created_at,
                updated_at: profileData.updated_at,
                followers_data: followersData,
                following_data: followingData,
                repos_data: reposData,
                oldest_repos: oldestRepos,
                newest_repos: newestRepos,
                popular_repos: popularRepos,
                least_starred_repos: leastStarredRepos,
                most_starred_repos: mostStarredRepo
            };
            resolve(info);
        } catch (e) {
            reject(e);
        }
    });
}

async function githubSummary(data) {
    let summary = `🔖 *Nickname :* ${data.name}\n`;
    summary += `🔖 *Username :* ${data.username}\n`;
    summary += `🚩 *Id :* ${data.id}\n`;
    summary += `✨ *Bio :* ${data.bio || "No bio"}\n`;
    summary += `📍 *Location :* ${data.location || "No location"}\n`;
    summary += `🏢 *Company :* ${data.company || "No company"}\n`;
    summary += `📧 *Email :* ${data.email}\n`;
    summary += `📰 *Blog :* ${data.blog}\n`;
    summary += `💕 *Followers :* ${data.followers_no}\n`;
    summary += `👉 *Following :* ${data.following_no}\n`;
    summary += `🔓 *Number of Public Repos:* ${data.public_repos_no}\n`;
    summary += `🗣️ *Number of Public Gists :* ${data.public_gists_no}\n`;
    summary += `👤 *Account Type:* ${data.type}\n`;
    summary += `🧩 *Created At:* ${data.created_at}\n`;
    summary += `🔄 *Updated At:* ${data.updated_at}\n`;
    summary += `⏺️ *Avatar:* ${data.profile_pic}\n\n`;

    const followingData = data.following_data.slice(0, 5);
    summary += `🔹 People Followed (Top 5):\n`;
    followingData.forEach(user => {
        summary += `- ${user.login} (Profile URL: ${user.html_url})\n`;
    });

    const followersData = data.followers_data.slice(0, 5);
    summary += `\n🔹 Followers (Top 5):\n`;
    followersData.forEach(user => {
        summary += `- ${user.login} (Profile URL: ${user.html_url})\n`;
    });

    summary += `🔹 Newest Repositories:\n`;
    data.newest_repos.forEach(repo => {
        summary += `- ${repo.name}\n`;
        summary += `    Description: ${repo.description || "No description"}\n`;
        summary += `    Created: ${repo.created_at}\n`;
        summary += `    Language: ${repo.language || "No language"}\n`;
        summary += `    Stars: ${repo.stargazers_count}\n`;
        summary += `    Forks: ${repo.forks_count}\n\n`;
    });

    summary += `\n🔹 Oldest Repositories:\n`;
    data.oldest_repos.forEach(repo => {
        summary += `- ${repo.name}\n`;
        summary += `    Description: ${repo.description || "No description"}\n`;
        summary += `    Created: ${repo.created_at}\n`;
        summary += `    Language: ${repo.language || "No language"}\n`;
        summary += `    Stars: ${repo.stargazers_count}\n`;
        summary += `    Forks: ${repo.forks_count}\n\n`;
    });

    summary += `🔹 Most Popular Repositories:\n`;
    data.popular_repos.forEach(repo => {
        summary += `- ${repo.name}\n`;
        summary += `    Description: ${repo.description || "No description"}\n`;
        summary += `    Created: ${repo.created_at}\n`;
        summary += `    Language: ${repo.language || "No language"}\n`;
        summary += `    Stars: ${repo.stargazers_count}\n`;
        summary += `    Forks: ${repo.forks_count}\n\n`;
    });

    summary += `🔹 Most Starred Repositories:\n`;
    data.most_starred_repos.forEach(repo => {
        summary += `- ${repo.name}\n`;
        summary += `    Description: ${repo.description || "No description"}\n`;
        summary += `    Created: ${repo.created_at}\n`;
        summary += `    Language: ${repo.language || "No language"}\n`;
        summary += `    Stars: ${repo.stargazers_count}\n`;
        summary += `    Forks: ${repo.forks_count}\n\n`;
    });

    summary += `🔹 Least Starred Repositories:\n`;
    data.least_starred_repos.forEach(repo => {
        summary += `- ${repo.name}\n`;
        summary += `    Description: ${repo.description || "No description"}\n`;
        summary += `    Created: ${repo.created_at}\n`;
        summary += `    Language: ${repo.language || "No language"}\n`;
        summary += `    Stars: ${repo.stargazers_count}\n`;
        summary += `    Forks: ${repo.forks_count}\n\n`;
    });

    return summary;
}

async function githubDescription(data) {
    let summary = `🔖 *Nickname :* ${data.name}\n`;
    summary += `🔖 *Username :* ${data.username}\n`;
    summary += `🚩 *Id :* ${data.id}\n`;
    summary += `✨ *Bio :* ${data.bio || "No bio"}\n`;
    summary += `📍 *Location :* ${data.location || "No location"}\n`;
    summary += `🏢 *Company :* ${data.company || "No company"}\n`;
    summary += `📧 *Email :* ${data.email}\n`;
    summary += `📰 *Blog :* ${data.blog}\n`;
    summary += `💕 *Followers :* ${data.followers_no}\n`;
    summary += `👉 *Following :* ${data.following_no}\n`;
    summary += `🔓 *Number of Public Repos:* ${data.public_repos_no}\n`;
    summary += `🗣️ *Number of Public Gists :* ${data.public_gists_no}\n`;
    summary += `👤 *Account Type:* ${data.type}\n`;
    summary += `🧩 *Created At:* ${data.created_at}\n`;
    summary += `🔄 *Updated At:* ${data.updated_at}\n`;
    summary += `⏺️ *Avatar:* ${data.profile_pic}\n\n`;

    const followingData = data.following_data.slice(0, 5);
    summary += `🔹 People Followed (Top 5):\n`;
    followingData.forEach(user => {
        summary += `- ${user.login} (Profile URL: ${user.html_url})\n`;
    });

    summary += `🔹 People Followed (Others):\n`;
    data.following_data.slice(6).forEach(user => {
        summary += `- ${user.login} (Profile URL: ${user.html_url})\n`;
    });

    const followersData = data.followers_data.slice(0, 5);
    summary += `\n🔹 Followers (Top 5):\n`;
    followersData.forEach(user => {
        summary += `- ${user.login} (Profile URL: ${user.html_url})\n`;
    });

    summary += `\n🔹 Followers (Others):\n`;
    data.followers_data.slice(6).forEach(user => {
        summary += `- ${user.login} (Profile URL: ${user.html_url})\n`;
    });

    summary += `🔹 Newest Repositories:\n`;
    data.newest_repos.forEach(repo => {
        summary += `- ${repo.name}\n`;
        summary += `    Description: ${repo.description || "No description"}\n`;
        summary += `    Created: ${repo.created_at}\n`;
        summary += `    Language: ${repo.language || "No language"}\n`;
        summary += `    Stars: ${repo.stargazers_count}\n`;
        summary += `    Forks: ${repo.forks_count}\n\n`;
    });

    summary += `\n🔹 Oldest Repositories:\n`;
    data.oldest_repos.forEach(repo => {
        summary += `- ${repo.name}\n`;
        summary += `    Description: ${repo.description || "No description"}\n`;
        summary += `    Created: ${repo.created_at}\n`;
        summary += `    Language: ${repo.language || "No language"}\n`;
        summary += `    Stars: ${repo.stargazers_count}\n`;
        summary += `    Forks: ${repo.forks_count}\n\n`;
    });

    summary += `🔹 Most Popular Repositories:\n`;
    data.popular_repos.forEach(repo => {
        summary += `- ${repo.name}\n`;
        summary += `    Description: ${repo.description || "No description"}\n`;
        summary += `    Created: ${repo.created_at}\n`;
        summary += `    Language: ${repo.language || "No language"}\n`;
        summary += `    Stars: ${repo.stargazers_count}\n`;
        summary += `    Forks: ${repo.forks_count}\n\n`;
    });

    summary += `🔹 Most Starred Repositories:\n`;
    data.most_starred_repos.forEach(repo => {
        summary += `- ${repo.name}\n`;
        summary += `    Description: ${repo.description || "No description"}\n`;
        summary += `    Created: ${repo.created_at}\n`;
        summary += `    Language: ${repo.language || "No language"}\n`;
        summary += `    Stars: ${repo.stargazers_count}\n`;
        summary += `    Forks: ${repo.forks_count}\n\n`;
    });

    summary += `🔹 Least Starred Repositories:\n`;
    data.least_starred_repos.forEach(repo => {
        summary += `- ${repo.name}\n`;
        summary += `    Description: ${repo.description || "No description"}\n`;
        summary += `    Created: ${repo.created_at}\n`;
        summary += `    Language: ${repo.language || "No language"}\n`;
        summary += `    Stars: ${repo.stargazers_count}\n`;
        summary += `    Forks: ${repo.forks_count}\n\n`;
    });

    summary += `🔹 All Repositories:\n`;
    data.repos_data.forEach(repo => {
        summary += `- ${repo.name}\n`;
        summary += `    Description: ${repo.description || "No description"}\n`;
        summary += `    Created: ${repo.created_at}\n`;
        summary += `    Language: ${repo.language || "No language"}\n`;
        summary += `    Stars: ${repo.stargazers_count}\n`;
        summary += `    Forks: ${repo.forks_count}\n\n`;
    });

    return summary;
}

async function githubRoasting(username) {
    try {
        let roast = "";
        githubstalk(username).then(async githubProfileInfo => {
            const summary = await githubSummary(githubProfileInfo);
            const response = await axios.post("https://luminai.my.id/", {
                content: summary.toString(),
                cID: "roastgh",
                cName: "roastgh"
            });
            roast = response.data.result;
        });
        return roast;
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
}

// githubRoasting("siputzx")
//     .then(summary => console.log(summary))
//     .catch(err => console.error(err));

module.exports = {
    githubRoasting,
    githubDescription,
    githubSummary,
    githubstalk,
    igstalker,
    tikstalk
};
