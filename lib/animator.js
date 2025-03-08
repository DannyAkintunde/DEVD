// const anims = global.THEME.anim;

let anim = {
    loading: {
        meta: {
            type: "dynamic",
            length: 20 // Length of the progress bar
        },
        frames: {
            bar: {
                filled: "█", // Character for filled part
                empty: "░" // Character for empty part
            },
            body: {
                left: "[", // Left bracket of the progress bar
                right: "]" // Right bracket of the progress bar
            },
            done: "[-------Done-------]",
            stop: "Animation Stopped❌"
        }
    },
    charge: {
        meta: {
            type: "static",
            mode: "s",
            repeat: 2,
            delay: 500,
            done: "",
            stop: ""
        },
        frames: {
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5"
        }
    },
    bar: {
        meta: {
            type: "bar", // Specifies it's a bar animation
            step: 10, // Defines step increments for animation
            delay: 1000 // delay before the complete message
        },
        frames: {
            0: "⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ %p%", // Empty bar
            10: "🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜ %p%",
            20: "🟩🟩⬜⬜⬜⬜⬜⬜⬜⬜ %p%",
            30: "🟩🟩🟩⬜⬜⬜⬜⬜⬜⬜ %p%",
            40: "🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜ %p%",
            50: "🟩🟩🟩🟩🟩⬜⬜⬜⬜⬜ %p%",
            60: "🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜ %p%",
            70: "🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜ %p%",
            80: "🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜ %p%",
            90: "🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜ %p%",
            100: "🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩 %p%", // Completed bar
            done: "Animation completed\n",
            stop: "Animation Stopped❌"
        }
    }
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Animation {
    constructor(animationConfig, callback, options) {
        this.config = structuredClone(animationConfig);
        this.callback = callback; // updater
        this.options = { value: 0, maxValue: 100, ...(options || {}) };
        this.placeholders = this.options.placeholders || {};
        this.meta = {
            type: "static",
            delay: 0,
            ...(this.config.meta || {})
        };
        this.meta.delay = parseInt(this.meta.delay || 200);
        this.frames = structuredClone(this.config.frames);
        this.percentage = 0;
        this.rawPercentage = convertToPercentage(
            this.options.value,
            this.options.maxValue
        );
        const { done = "", stop = "" } = this.frames; // load and delete special frames.
        this.doneFrame = done;
        this.stopFrame = stop;
        delete this.frames.done;
        delete this.frames.stop;
        this.type = this.config.meta.type;
        this.isRunning = false;
    }
    __callCallback(value) {
        this.placeholders.p = this.options.placeholders?.p || this.percentage;
        this.placeholders.rp =
            this.options.placeholders?.rp || this.rawPercentage;
        const parsed = this.__loadPlaceholder(value, this.placeholders);
        // console.log(parsed);
        return this.callback(parsed, this);
    }
    async __load() {
        switch (this.type) {
            case "static":
                await this.__loadStatic();
                break;
            case "dynamic":
                await this.__loadDynamic();
                break;
            case "bar":
                await this.__loadBar();
                break;
        }
    }
    __loadPlaceholder(text, options = {}) {
        let parsed = text;
        for (let [placeholder, value] of Object.entries(options)) {
            parsed = parsed.replace(new RegExp(`%${placeholder}`, "g"), value);
        }
        return parsed;
    }
    async __loadStatic() {
        let repeatitions =
            this.meta.repeat === 0 ? Infinity : this.meta.repeat || 1;
        let inputFrames = Object.values(this.frames);
        switch (this.meta.mode) {
            case "f":
            case "foward":
                {
                    inputFrames = inputFrames;
                }
                break;
            case "s":
            case "sway":
                {
                    inputFrames = [...inputFrames, ...inputFrames.reverse()];
                }
                break;
            case "b":
            case "backward":
                {
                    inputFrames = inputFrames.reverse();
                }
                break;
        }

        while (repeatitions > 0 && this.isRunning) {
            for (let frame of inputFrames) {
                await this.__callCallback(frame);
                await delay(this.meta.delay);
            }
            repeatitions--;
        }

        if (this.doneFrame) {
            await this.__callCallback(this.doneFrame);
        }
    }
    __loadDynamic() {}
    async __loadBar() {
        const frames = this.frames;
        this.currentValue = 0;
        this.maxValue = (Object.keys(frames).length - 1) * this.meta.step;
        this.valuePerPercentage = this.maxValue / 100;
        await this.__callCallback(frames[this.currentValue]);
        this.__update = async value => {
            this.percentage = value * this.valuePerPercentage;
            const steps = parseInt(
                (this.percentage / this.meta.step).toFixed(0)
            );
            this.currentValue = Math.min(steps * this.meta.step, this.maxValue);
            const currentFrame = frames[this.currentValue];
            await this.__callCallback(currentFrame);
            if (value >= this.maxValue) {
                await delay(this.meta.delay);
                await this.__callCallback(this.doneFrame);
            }
        };
    }
    async start() {
        this.isRunning = true;
        await this.__load();
    }
    async update(value, options) {
        this.placeholders = {
            ...this.placeholders,
            ...(options?.placeholders || {})
        };
        this.rawPercentage = convertToPercentage(value, this.options.maxValue);
        if (!this.__update) throw new Error("No updater for this animation");
        return await this.__update(value);
    }
    async stop() {
        this.isRunning = false;
        if (this.stopFrame) await this.__callCallback(this.stopFrame);
    }
}

function convertToPercentage(value, maxValue) {
    return (value / maxValue) * 100;
}

// a = new Animation(anim.bar, txt => process.stdout.write(txt + "\r"));
// async function run() {
//     await a.start();
//     const stp = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
//     for (st of stp) {
//         await delay(500);
//         await a.update(st * 10);
//     }
// }
// run().then();
// async function createAnimation(
//     animationConfig,
//     conn,
//     mssg,
//     { from, quoted, ...options }
// ) {
//     const { meta, frames } = animationConfig;

//     // Helper function to handle delays
//     function delay(ms) {
//         return new Promise(resolve => setTimeout(resolve, ms));
//     }

//     // Object to hold animation methods
//     const animationObject = {
//         start: null,
//         update: null, // Only for dynamic and bar animations
//         stop: null // Function to stop the animation
//     };

//     // Static Animation
//     if (meta.type === "static") {
//         let isRunning = false; // Track if the animation is running
//         const msg = mssg
//             ? mssg
//             : await conn.sendMessage(
//                   from,
//                   { text: frames[0], ...options },
//                   { quoted, ...options }
//               );

//         async function staticAnimation() {
//             isRunning = true;
//             const totalFrames = frames.length;
//             let repetitions = meta.repeat === 0 ? Infinity : meta.repeat; // Repeat infinitely if 0

//             while (repetitions > 0 && isRunning) {
//                 if (meta.mode === "forward") {
//                     for (let i = 0; i < totalFrames && isRunning; i++) {
//                         await conn.edite(msg, { text: frames[i] });
//                         await delay(
//                             Array.isArray(meta.delay)
//                                 ? meta.delay[i]
//                                 : meta.delay
//                         );
//                     }
//                 } else if (meta.mode === "backward") {
//                     for (let i = totalFrames - 1; i >= 0 && isRunning; i--) {
//                         await conn.edite(msg, { text: frames[i] });
//                         await delay(
//                             Array.isArray(meta.delay)
//                                 ? meta.delay[i]
//                                 : meta.delay
//                         );
//                     }
//                 } else if (meta.mode === "sway") {
//                     // Sway mode: forward then backward
//                     for (let i = 0; i < totalFrames && isRunning; i++) {
//                         await conn.edite(msg, { text: frames[i] });
//                         await delay(
//                             Array.isArray(meta.delay)
//                                 ? meta.delay[i]
//                                 : meta.delay
//                         );
//                     }
//                     for (let i = totalFrames - 1; i >= 0 && isRunning; i--) {
//                         await conn.edite(msg, { text: frames[i] });
//                         await delay(
//                             Array.isArray(meta.delay)
//                                 ? meta.delay[i]
//                                 : meta.delay
//                         );
//                     }
//                 } else {
//                     console.error("Unknown mode for static animation");
//                 }
//                 repetitions--;
//             }
//             if (isRunning) {
//                 await conn.edite(msg, {
//                     text: meta.done || "Animation Completed✅"
//                 });
//             }
//             isRunning = false; // Reset running status
//         }

//         // Assign the start method for static animation
//         animationObject.start = staticAnimation;

//         // Stop the static animation
//         animationObject.stop = async () => {
//             isRunning = false;
//             await conn.edite(msg, {
//                 text: meta.stop || "Static animation stopped.❌"
//             });
//         };

//         // Dynamic Animation
//     } else if (meta.type === "dynamic") {
//         let currentProgress = 0; // Track current progress
//         const total = meta.total; // Total value from config
//         const length = meta.length; // Length of progress bar from config
//         let running = false;
//         let msg;

//         async function dynamicAnimation() {
//             let progressBar;
//             while (currentProgress < total && running) {
//                 const percentage = (currentProgress / total) * 100;
//                 const filledLength = Math.floor(
//                     (length * currentProgress) / total
//                 );
//                 const bar =
//                     frames.bar.filled.repeat(filledLength) +
//                     frames.bar.empty.repeat(length - filledLength);
//                 const progress =
//                     frames.body.left +
//                     bar +
//                     frames.body.right +
//                     ` ${percentage.toFixed(2)} %`;

//                 if (!msg)
//                     msg = mssg
//                         ? mssg
//                         : await conn.sendMessage(
//                               from,
//                               { text: frames[0], ...options },
//                               { quoted, ...options }
//                           );

//                 if (progressBar != progress) {
//                     progressBar = progress;
//                     conn.edite(msg, { text: progressBar });
//                 }

//                 await delay(meta.delay); // Delay based on config
//             }
//             running = false;
//             conn.edite(msg, {
//                 text: frames.bar.completed || "Dynamic Animation Completed✅"
//             });
//         }

//         // Start the dynamic animation with initial value
//         animationObject.start = (initialValue = 0) => {
//             currentProgress = Math.min(initialValue, total);
//             running = true;
//             dynamicAnimation();
//         };

//         // Update the dynamic progress value
//         animationObject.update = newValue => {
//             if (newValue >= 0 && newValue <= total) {
//                 currentProgress = newValue;
//             } else {
//                 console.error(`Progress value must be between 0 and ${total}.`);
//             }
//         };

//         // Stop the dynamic animation
//         animationObject.stop = () => {
//             running = false;
//             if (frames.bar.stoped) conn.edite(msg, { text: frames.bar.stoped });
//             console.log("Dynamic animation stopped.❌");
//         };

//         // Bar Animation
//     } else if (meta.type === "bar") {
//         let currentInput = 0; // Track current input for the bar animation
//         let running = false; // Track if the animation is running
//         const step = meta.step || 10;
//         const maxValue = step * (Object.keys(frames).length - 1); // Calculate max value based on frames
//         const msg = mssg
//             ? mssg
//             : await conn.sendMessage(
//                   from,
//                   {
//                       text:
//                           frames[Math.ceil(currentInput / step) * step] ||
//                           frames["full"],
//                       ...options
//                   },
//                   { quoted, ...options }
//               );

//         async function barAnimation() {
//             running = true; // Set running to true
//             while (currentInput <= maxValue && running) {
//                 const frameKey = Math.ceil(currentInput / step) * step; // Round to nearest step
//                 const frame = frames[frameKey] || frames["full"]; // Access the corresponding frame
//                 conn.edite(msg, { text: frame });
//                 await delay(1000); // Adjust delay as needed
//             }
//             if (running) {
//                 conn.edite(msg, { text: frames["full"] }); // Show completed message if still running
//             }
//         }

//         // Start the bar animation with initial value
//         animationObject.start = (initialValue = 0) => {
//             currentInput = initialValue;
//             barAnimation();
//         };

//         // Update the bar animation value
//         animationObject.update = newValue => {
//             if (newValue >= 0 && newValue <= maxValue) {
//                 currentInput = newValue; // Update current input
//                 const frameKey = Math.ceil(currentInput / step) * step; // Round to nearest step
//                 const frame = frames[frameKey] || frames["full"]; // Access the corresponding frame
//                 conn.edite(msg, { text: frame }); // Display the updated frame
//             } else {
//                 console.error(`Input value must be between 0 and ${maxValue}.`);
//             }
//         };

//         // Stop the bar animation
//         animationObject.stop = () => {
//             if (running) {
//                 running = false; // Set running to false to stop the animation
//                 conn.edite(msg, { text: frames.stop || "Animation Stopped❌" });
//             }
//         };
//     } else {
//         console.error("Unknown animation type");
//     }

//     return animationObject; // Return the animation object
// }
