const anims = global.THEME.anim;

async function createAnimation(
    animationConfig,
    conn,
    mssg,
    { from, quoted, ...options }
) {
    const { meta, frames } = animationConfig;

    // Helper function to handle delays
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Object to hold animation methods
    const animationObject = {
        start: null,
        update: null, // Only for dynamic and bar animations
        stop: null // Function to stop the animation
    };

    // Static Animation
    if (meta.type === "static") {
        let isRunning = false; // Track if the animation is running
        const msg = mssg
            ? mssg
            : await conn.sendMessage(
                  from,
                  { text: frames[0], ...options },
                  { quoted, ...options }
              );

        async function staticAnimation() {
            isRunning = true;
            const totalFrames = frames.length;
            let repetitions = meta.repeat === 0 ? Infinity : meta.repeat; // Repeat infinitely if 0

            while (repetitions > 0 && isRunning) {
                if (meta.mode === "forward") {
                    for (let i = 0; i < totalFrames && isRunning; i++) {
                        await conn.edite(msg, { text: frames[i] });
                        await delay(
                            Array.isArray(meta.delay)
                                ? meta.delay[i]
                                : meta.delay
                        );
                    }
                } else if (meta.mode === "backward") {
                    for (let i = totalFrames - 1; i >= 0 && isRunning; i--) {
                        await conn.edite(msg, { text: frames[i] });
                        await delay(
                            Array.isArray(meta.delay)
                                ? meta.delay[i]
                                : meta.delay
                        );
                    }
                } else if (meta.mode === "sway") {
                    // Sway mode: forward then backward
                    for (let i = 0; i < totalFrames && isRunning; i++) {
                        await conn.edite(msg, { text: frames[i] });
                        await delay(
                            Array.isArray(meta.delay)
                                ? meta.delay[i]
                                : meta.delay
                        );
                    }
                    for (let i = totalFrames - 1; i >= 0 && isRunning; i--) {
                        await conn.edite(msg, { text: frames[i] });
                        await delay(
                            Array.isArray(meta.delay)
                                ? meta.delay[i]
                                : meta.delay
                        );
                    }
                } else {
                    console.error("Unknown mode for static animation");
                }
                repetitions--;
            }
            if (isRunning) {
                await conn.edite(msg, {
                    text: meta.done || "Animation Completed✅"
                });
            }
            isRunning = false; // Reset running status
        }

        // Assign the start method for static animation
        animationObject.start = staticAnimation;

        // Stop the static animation
        animationObject.stop = async () => {
            isRunning = false;
            await conn.edite(msg, {
                text: meta.stop || "Static animation stopped.❌"
            });
        };

        // Dynamic Animation
    } else if (meta.type === "dynamic") {
        let currentProgress = 0; // Track current progress
        const total = meta.total; // Total value from config
        const length = meta.length; // Length of progress bar from config
        let running = false;
        let msg;

        async function dynamicAnimation() {
            let progressBar;
            while (currentProgress < total && running) {
                const percentage = (currentProgress / total) * 100;
                const filledLength = Math.floor(
                    (length * currentProgress) / total
                );
                const bar =
                    frames.bar.filled.repeat(filledLength) +
                    frames.bar.empty.repeat(length - filledLength);
                const progress =
                    frames.body.left +
                    bar +
                    frames.body.right +
                    ` ${percentage.toFixed(2)} %`;

                if (!msg)
                    msg = mssg
                        ? mssg
                        : await conn.sendMessage(
                              from,
                              { text: frames[0], ...options },
                              { quoted, ...options }
                          );

                if (progressBar != progress) {
                    progressBar = progress;
                    conn.edite(msg, { text: progressBar });
                }

                await delay(meta.delay); // Delay based on config
            }
            running = false;
            conn.edite(msg, {
                text: frames.bar.completed || "Dynamic Animation Completed✅"
            });
        }

        // Start the dynamic animation with initial value
        animationObject.start = (initialValue = 0) => {
            currentProgress = Math.min(initialValue, total);
            running = true;
            dynamicAnimation();
        };

        // Update the dynamic progress value
        animationObject.update = newValue => {
            if (newValue >= 0 && newValue <= total) {
                currentProgress = newValue;
            } else {
                console.error(`Progress value must be between 0 and ${total}.`);
            }
        };

        // Stop the dynamic animation
        animationObject.stop = () => {
            running = false;
            if (frames.bar.stoped) conn.edite(msg, { text: frames.bar.stoped });
            console.log("Dynamic animation stopped.❌");
        };

        // Bar Animation
    } else if (meta.type === "bar") {
        let currentInput = 0; // Track current input for the bar animation
        let running = false; // Track if the animation is running
        const step = meta.step || 10;
        const maxValue = step * (Object.keys(frames).length - 1); // Calculate max value based on frames
        const msg = mssg
            ? mssg
            : await conn.sendMessage(
                  from,
                  {
                      text:
                          frames[Math.ceil(currentInput / step) * step] ||
                          frames["full"],
                      ...options
                  },
                  { quoted, ...options }
              );

        async function barAnimation() {
            running = true; // Set running to true
            while (currentInput <= maxValue && running) {
                const frameKey = Math.ceil(currentInput / step) * step; // Round to nearest step
                const frame = frames[frameKey] || frames["full"]; // Access the corresponding frame
                conn.edite(msg, { text: frame });
                await delay(1000); // Adjust delay as needed
            }
            if (running) {
                conn.edite(msg, { text: frames["full"] }); // Show completed message if still running
            }
        }

        // Start the bar animation with initial value
        animationObject.start = (initialValue = 0) => {
            currentInput = initialValue;
            barAnimation();
        };

        // Update the bar animation value
        animationObject.update = newValue => {
            if (newValue >= 0 && newValue <= maxValue) {
                currentInput = newValue; // Update current input
                const frameKey = Math.ceil(currentInput / step) * step; // Round to nearest step
                const frame = frames[frameKey] || frames["full"]; // Access the corresponding frame
                conn.edite(msg, { text: frame }); // Display the updated frame
            } else {
                console.error(`Input value must be between 0 and ${maxValue}.`);
            }
        };

        // Stop the bar animation
        animationObject.stop = () => {
            if (running) {
                running = false; // Set running to false to stop the animation
                conn.edite(msg, { text: frames.stop || "Animation Stopped❌" });
            }
        };
    } else {
        console.error("Unknown animation type");
    }

    return animationObject; // Return the animation object
}
