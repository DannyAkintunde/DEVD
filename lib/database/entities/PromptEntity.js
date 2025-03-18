const { EntitySchema } = require("typeorm");

const PromptEntity = new EntitySchema({
    name: "Prompt",
    columns: {
        id: { type: "integer", primary: true, generated: true },
        aiId: { type: "text" },
        user: { type: "text" },
        prompt: { type: "text" },
        response: { type: "text" },
        timestamp: { type: "datetime", default: () => "CURRENT_TIMESTAMP" }
    }
});

module.exports = PromptEntity;
