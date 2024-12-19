const axios = require("axios");
const EventSource = require("eventsource");

const API_BASE = "https://stabilityai-stable-diffusion.hf.space";
const DEFAULT_NEGATIVE_PROMPT =
    "(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck";

const headers = {
    "content-type": "application/json",
    accept: "*/*",
    origin: API_BASE,
    referer: `${API_BASE}/?__theme=light`,
    "user-agent": "Postify/1.0.0"
};

const session_hash = () => Math.random().toString(36).slice(2);

const stablediff = {
    create: async (
        prompt = "Cat Cutest",
        negativePrompt = DEFAULT_NEGATIVE_PROMPT,
        guidanceScale = 9
    ) => {
        const sh = session_hash();
        const payload = {
            data: [prompt, negativePrompt, guidanceScale],
            fn_index: 3,
            trigger_id: 9,
            session_hash: sh
        };

        try {
            const { data } = await axios.post(
                `${API_BASE}/queue/join?__theme=light`,
                payload,
                { headers }
            );
            if (!data.event_id) throw new Error("No Event ID found");

            return new Promise((resolve, reject) => {
                const eventSource = new EventSource(
                    `${API_BASE}/queue/data?session_hash=${sh}`
                );
                eventSource.onmessage = ({ data }) => {
                    const message = JSON.parse(data);

                    if (message.msg === "progress") {
                        const progress = message.progress_data?.[0];
                        if (progress)
                            process.stdout.write(
                                `\r🟢 Progress: ${(
                                    ((progress.index + 1) / progress.length) *
                                    100
                                ).toFixed(0)}%`
                            );
                    }

                    if (message.msg === "process_completed") {
                        eventSource.close();
                        console.log("\n✅  image sucessfully generated");
                        // console.dir(message, { maxDepth: null });
                        resolve(
                            message.output.data[0].map(({ image }) => image.url)
                        );
                    }
                };
                eventSource.onerror = err => {
                    eventSource.close();
                    reject(new Error(err.message));
                };
            });
        } catch (error) {
            console.error(error.response?.data || error.message);
            if (error.response) {
                const err = error.response.data;
                if (err.includes("exceeded your GPU quota")) {
                    console.error("GPU quota exceeded");
                } else {
                    console.error(err);
                }
            } else {
                console.error(error.message);
            }
            throw error;
        }
    }
};

module.exports = stablediff;