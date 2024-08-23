// Define available functions
const FUNCTIONS = {
    uppercase: value => value.toString().toUpperCase(),
    lowercase: value => value.toString().toLowerCase(),
    trim: value => value.toString().trim(),
    substring: (value, start, end) =>
        value.toString().substring(Number(start), Number(end)),
    split: (value, delimiter) => value.toString().split(delimiter),
    select: (array, index) => array[Number(index)],
    replace: (value, search, replacement) =>
        value.toString().replace(new RegExp(search, "g"), replacement),
    concat: (...values) => values.join(""),
    toNumber: value => Number(value),
    formatDate: (value, format) => {
        const date = new Date(value);
        const options = { year: "numeric", month: "short", day: "numeric" };
        return date.toLocaleDateString(undefined, options); // Customize formatting as needed
    },
    length: value => value.length,
    default: (value, fallback) =>
        value != null && value !== "" ? value : fallback,
    reverse: value => value.toString().split("").reverse().join(""),
    pad: (value, length, char = " ") =>
        value.toString().padStart(Number(length), char),
    toFixed: (value, decimals) => Number(value).toFixed(Number(decimals)),
    dateDiff: (date1, date2) => {
        const diffTime = Math.abs(new Date(date2) - new Date(date1));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },
    jsonStringify: value => JSON.stringify(value),
    jsonParse: value => JSON.parse(value),
    capitalize: value =>
        value.toString().charAt(0).toUpperCase() + value.toString().slice(1),
    contains: (value, substring) => value.toString().includes(substring),
    add: (a, b) => Number(a) + Number(b),
    subtract: (a, b) => Number(a) - Number(b),
    multiply: (a, b) => Number(a) * Number(b),
    divide: (a, b) => Number(a) / Number(b),
    currencyFormat: (value, symbol = "$", decimals = 2) =>
        `${symbol}${Number(value).toFixed(decimals)}`,
    not: value => !Boolean(value)
};

// Retrieve nested value from object
function getValue(obj, path) {
    return path
        .split(".")
        .reduce((acc, key) => (acc && acc[key] != null ? acc[key] : null), obj);
}

// Parse arguments handling escaped characters
function parseArguments(argsStr) {
    const args = [];
    let currentArg = "";
    let inQuotes = false;
    let isEscaping = false;

    for (let char of argsStr) {
        if (char === "\\" && !isEscaping) {
            isEscaping = true;
            continue;
        }

        if (char === "," && !inQuotes && !isEscaping) {
            args.push(currentArg.trim());
            currentArg = "";
        } else {
            if (char === '"') {
                inQuotes = !inQuotes;
            }
            currentArg += char;
            isEscaping = false;
        }
    }

    if (currentArg) {
        args.push(currentArg.trim());
    }

    // Remove leading and trailing quotes from quoted arguments
    return args.map(arg => arg.replace(/^"|"$/, ""));
}

// Function to retrieve a nested function or value from the data object
function getFromData(data, path) {
    return path
        .split(".")
        .reduce(
            (acc, key) => (acc && acc[key] != null ? acc[key] : null),
            data
        );
}

// Apply a chain of functions to a value
function applyFunctions(value, functionsStr, data) {
    const functionRegex = /(\w+|#\w+(\.\w+)*)(?:\(([^)]*)\))?/g;
    let match;
    const functions = [];
    while ((match = functionRegex.exec(functionsStr)) !== null) {
        const funcName = match[1].startsWith("#")
            ? match[1].slice(1)
            : match[1];
        const argsStr = match[3] ? match[3] : "";
        const args = parseArguments(argsStr);
        functions.push({ funcName, args });
    }

    // Apply functions to the value
    functions.forEach(fn => {
        let func;
        if (fn.funcName in FUNCTIONS) {
            func = FUNCTIONS[fn.funcName];
        } else {
            func = getFromData(data, fn.funcName);
            if (typeof func !== "function") {
                throw new Error(`Function '${fn.funcName}' is not defined.`);
            }
        }

        value = func(value, ...fn.args);
    });

    return value;
}

function evaluateCondition(condition, data) {
    try {
        condition = loadPlaceholders(condition, data);
        //console.log(condition)
        //console.log(eval('"Danny" != "Danny"'))
        // Evaluate the final condition string
        return new Function("data", `with (data) { return ${condition}; }`)(
            data
        );
    } catch (error) {
        console.error(
            `Error evaluating condition "${condition}": ${error.message}`
        );
        return false;
    }
}

function parseTemplate(template) {
    const regex = /\{%\s*(#if|#else|#endif|#for|#endfor)\s*([^%]*)%\}/g;
    const result = [];
    let lastIndex = 0;
    let match;
    const stack = [];

    while ((match = regex.exec(template)) !== null) {
        const [fullMatch, type, expression] = match;
        const beforeText = template.slice(lastIndex, match.index);
        if (beforeText.trim()) {
            if (stack.length > 0) {
                stack[stack.length - 1].content.push(beforeText);
            } else {
                result.push(beforeText);
            }
        }

        if (type === "#if") {
            const newBlock = {
                type: "if",
                condition: expression.trim(),
                content: [],
                elseContent: []
            };
            if (stack.length > 0) {
                stack[stack.length - 1].content.push(newBlock);
            } else {
                result.push(newBlock);
            }
            stack.push(newBlock);
        } else if (type === "#else") {
            const currentBlock = stack[stack.length - 1];
            if (currentBlock && currentBlock.type === "if") {
                stack.pop();
                currentBlock.elseBlock = { type: "else", content: [] };
                stack.push(currentBlock.elseBlock);
            }
        } else if (type === "#endif") {
            stack.pop();
        } else if (type === "#for") {
            const [item, collection] = expression.trim().split(" in ");
            const newBlock = {
                type: "for",
                item: item.trim(),
                collection: collection.trim(),
                content: []
            };
            if (stack.length > 0) {
                stack[stack.length - 1].content.push(newBlock);
            } else {
                result.push(newBlock);
            }
            stack.push(newBlock);
        } else if (type === "#endfor") {
            stack.pop();
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < template.length) {
        const remainingText = template.slice(lastIndex);
        if (stack.length > 0) {
            stack[stack.length - 1].content.push(remainingText);
        } else {
            result.push(remainingText);
        }
    }

    if (stack.length > 0) {
        throw new Error("Mismatched #if/#endif tags in template.");
    }

    return result;
}

function renderTemplate(parsed, data) {
    let output = "";

    parsed.forEach(part => {
        if (typeof part === "string") {
            output += part;
        } else if (part.type === "if") {
            const conditionResult = evaluateCondition(part.condition, data);
            //console.log(conditionResult)
            if (conditionResult) {
                output += renderTemplate(part.content, data);
            } else if (part.elseBlock) {
                output += renderTemplate(part.elseBlock.content, data);
            }
        } else if (part.type === "for") {
            let collection;
            try {
                collection = JSON.parse(part.collection);
            } catch (e) {
                //console.log(e);
                if (typeof part.collection === "string") {
                    collection = getValue(data, part.collection)
                        ? getValue(data, part.collection)
                        : part.collection.split(",");
                }
            }
            //console.log(collection);
            if (Array.isArray(collection)) {
                collection.forEach(item => {
                    const newData = { ...data, [part.item]: item };
                    output += loadPlaceholders(
                        renderTemplate(part.content, newData),
                        newData,
                        (quoted = false)
                    );
                });
            }
        }
    });

    return output;
}

function processConditionals(template, data) {
    const parsedTemplate = parseTemplate(template);
    return renderTemplate(parsedTemplate, data);
}

function loadPlaceholders(template, data, quoted = true, skip_null = true) {
    const variableRegex = /\{\{([^#][^}]+)\}\}/g;
    const output = template.replace(variableRegex, (match, content) => {
        try {
            const [path, functionsStr] = content.split(":");
            let value = getValue(data, path.trim());
            if (value === null || value === undefined) {
                if (skip_null) return match;
                else return null;
            }

            if (functionsStr) {
                value = applyFunctions(value, functionsStr.trim(), data);
            }

            return quoted ? `"${value}"` : `${value}`;
        } catch (error) {
            console.error(`Error processing '${match}': ${error.message}`);
            return match;
        }
    });
    return output;
}

function convertTemplateToES6(template, data) {
    //template = processConditionals(template, data);
    let result;
    result = loadPlaceholders(template, data, (quoted = false));
    result = processConditionals(result, data);
    return loadPlaceholders(result.trim(), data, (skip_null = false));
}

module.exports = {
    convertTemplateToES6,
    loadPlaceholders
};
