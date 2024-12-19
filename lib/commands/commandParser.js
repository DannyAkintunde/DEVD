function parseCommand(commandString) {
    const command = {
        name: '',
        options: {},
        args: [], // To store standalone arguments
    };

    // A regex to split by spaces while keeping quoted parts together
    const parts = commandString.match(/(?:[^\s"]+|"[^"]*")+/g);

    // The first part is the command name
    command.name = parts[0];

    // Iterate through the parts to find options and arguments
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i];

        // Check for key-value pairs (e.g., --option value)
        if (part.startsWith('--')) {
            const key = part.slice(2); // Remove the '--'
            const value = parts[i + 1];

            // Remove quotes if the value is a quoted string
            if (value && !value.startsWith('--') && !value.startsWith('-')) {
                command.options[key] = value.startsWith('"') ? value.slice(1, -1) : value;
                i++;
            } else {
                command.options[key] = true;
            }
        }

        // Check for shortcuts (e.g., -o value)
        else if (part.startsWith('-')) {
            const key = part.slice(1);
            const value = parts[i + 1];

            // Remove quotes if the value is a quoted string
            if (value && !value.startsWith('-') && !value.startsWith('--')) {
                command.options[key] = value.startsWith('"') ? value.slice(1, -1) : value;
                i++;
            } else {
                command.options[key] = true;
            }
        }

        // Collect standalone arguments that aren't options
        else {
            command.args.push(part.startsWith('"') ? part.slice(1, -1) : part);
        }
    }

    return command;
}

module.exports = parsedCommand;

// Example usage
// const commandInput = '/sendMessage Danny --to "John Doe" --message "Hello, how are you?" -t 4 red';
// const parsedCommand = parseCommand(commandInput);

// console.log(parsedCommand);
