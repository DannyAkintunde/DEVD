const fs = require("fs");
const { getDataStore } = require("../datastore.js");

class PromptStore {
    constructor(
        aiId,
        maxHistory = 5,
        filename = "prompts.json",
        forceJson = false
    ) {
        this.aiId = aiId;
        this.maxHistory = maxHistory;
        this.filename = filename;
        this.useJson = true;
        this.repo = null;

        try {
            this.dataSource = getDataStore();
            this.useJson = false;
        } catch {}

        if (forceJson) this.useJson = true;
    }

    async initialize() {
        if (this.useJson) {
            await fs.promises.access(this.filename).catch(async () => {
                await fs.promises.writeFile(
                    this.filename,
                    JSON.stringify({}, null, 2)
                );
            });
        } else {
            this.repo = this.dataSource.getRepository("Prompt");
        }
        return this;
    }

    async savePrompt(user, userInput, response, chatOptions = {}) {
        let prompt = this.generatePrompt(userInput, chatOptions);
        if (this.useJson) {
            let data = JSON.parse(fs.readFileSync(this.filename, "utf-8"));
            if (!data[this.aiId]) data[this.aiId] = {};
            if (!data[this.aiId][user]) data[this.aiId][user] = [];

            data[this.aiId][user].push({ prompt, response });

            if (data[this.aiId][user].length > this.maxHistory) {
                data[this.aiId][user].shift();
            }

            fs.writeFileSync(this.filename, JSON.stringify(data, null, 2));
        } else {
            await this.repo.insert({ aiId: this.aiId, user, prompt, response });

            // Delete oldest records if history exceeds maxHistory
            await this.repo
                .createQueryBuilder()
                .delete()
                .where("aiId = :aiId AND user = :user", {
                    aiId: this.aiId,
                    user
                })
                .orderBy("timestamp", "ASC")
                .limit(
                    (await this.repo.count({
                        where: { aiId: this.aiId, user }
                    })) - this.maxHistory
                )
                .execute();
        }
    }

    async getPrompts(user) {
        if (this.useJson) {
            let data = JSON.parse(fs.readFileSync(this.filename, "utf-8"));
            return data[this.aiId]?.[user] || [];
        } else {
            return await this.repo.find({
                where: { aiId: this.aiId, user },
                order: { timestamp: "ASC" },
                take: this.maxHistory
            });
        }
    }

    generatePrompt(
        inputPrompt,
        { userName=null, image = null, quoted = { text: null, user: null } }
    ) {
        let parts = [];
        if (userName) parts.push(" (username-" + userName + ") ");
        if (quoted.text)
            parts.push(
                `[Quoted${quoted.user ? " (" + quoted.user + ")" : ""}]: ${
                    quoted.text
                }`
            );
        if (image) parts.push(`[Image: ${image}]`);
        if (inputPrompt) parts.push(inputPrompt);

        return parts.join("\n");
    }

    async createPrompt(user, newInput, chatOptions = {}) {
        const pastConversations = await this.getPrompts(user);
        const context = pastConversations
            .map(c => `User: ${c.prompt}\nAI: ${c.response}`)
            .join("\n")||"";

        const prompt = this.generatePrompt(newInput, chatOptions);

        return `${context}\nUser: ${prompt}\nAI:`.replace(/^\n/);
    }
}

// // Example Usage
// (async () => {
//     const promptStoreJson = await new PromptStore(
//         "gemini",
//         10,
//         "prompts.json",
//         true
//     ).initialize();
//     await promptStoreJson.savePrompt("user123", "Hello?", "Hi there!");
//     console.log(
//         "JSON Full Prompt:",
//         await promptStoreJson.createPrompt("user123", "How are you?")
//     );

//     const promptStoreSQLite = await new PromptStore("gemini").initialize();
//     await promptStoreSQLite.savePrompt("user123", "Hello?", "Hi there!");
//     console.log(
//         "SQLite Full Prompt:",
//         await promptStoreSQLite.createPrompt("user123", "How are you?")
//     );
// })();

module.exports = PromptStore;
