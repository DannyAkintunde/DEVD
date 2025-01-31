const axios = require("axios");
const EventSource = require("eventsource");

const API_BASE = "https://mukaist-midjourney.hf.space";
const DEFAULT_NEGATIVE_PROMPT =
    "(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck";

const headers = {
    "content-type": "application/json",
    accept: "*/*",
    origin: API_BASE,
    referer: `${API_BASE}/?__theme=light`,
    "user-agent": "Postify/1.0.0"
};

const session_hash = () => Math.random().toString(36).slice(2);

// avaliable styles: Anime, Photo, Cinematic, 3D Model, (No style), 2560 x 1440

const midjourney = {
    create: async (
        prompt = "Cat Laughing on the Tree",
        negative_prompt = DEFAULT_NEGATIVE_PROMPT,
        style = "Anime",
        width = 1024,
        height = 1024,
        guidanceScale = 6,
        fn = 3,
        trid = 6
    ) => {
        if (!negative_prompt) negative_prompt = DEFAULT_NEGATIVE_PROMPT;
        if (!style) style = "(No style)";
        const sh = session_hash();
        const payload = {
            data: [
                prompt,
                negative_prompt,
                true,
                style,
                0,
                width,
                height,
                guidanceScale,
                true
            ],
            fn_index: fn,
            trigger_id: trid,
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

module.exports = midjourney;
