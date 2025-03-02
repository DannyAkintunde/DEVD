class Prefix {
    constructor(prefixes = "/") {
        // Split the prefixes by comma and store them
        this.prefixes = prefixes.split(",");
        // convert prefix to an array and excape regrex chracters of there is need to
        this.excapedPrefixes = this.prefixes.map(prefix => {
            let cleaned = "";
            prefix.split("").forEach(char => {
                if (/\.|\*|\+|\?|\^|\$|\(|\)|\{|\}|\||\[|\]|\\|\//.test(char)) {
                    char = "\\" + char;
                    cleaned += char;
                }
            });

            return cleaned.trim();
        });
        // console.log(this.excapedPrefixes)
        // Create a regular expression string from the prefixes
        this.prefixesRegrexStr = `^(${this.excapedPrefixes.join(
            "|"
        )})([^ ]+) ?([\\s\\S]*)`;
        console.debug("Prefix regrex: " + this.prefixesRegrexStr);
        this.prefixesRegrex = new RegExp(this.prefixesRegrexStr);
    }

    get(text) {
        if (!text || !this.test(text)) return;
        const [, prefix] = text.match(this.prefixesRegrex);
        return prefix;
    }

    test(text) {
        // Test if the text starts with any of the prefixes
        return this.prefixesRegrex.test(text ? text : "");
    }

    match(text) {
        if (!this.test(text)) return [];
        return text?.match(this.prefixesRegrex);
    }

    // Use Symbol.toPrimitive to return a random prefix
    get [Symbol.toPrimitive]() {
        return this.getRandomPrefix;
    }

    getRandomPrefix() {
        // Return a random prefix
        return this.prefixes[Math.floor(Math.random() * this.prefixes.length)];
    }

    toString() {
        return this.getRandomPrefix();
    }

    isPrefix(text) {
        if (!text) return false;
        const trimmedText = text.trim();
        return this.prefixes.some(prefix => trimmedText.startsWith(prefix));
    }
}

module.exports = Prefix;

// Example usage
// const prefixInstance = new Prefix(".,\\,$,/,hey\\t");
// console.log(prefixInstance.get(`$tect hello there`)); // true or false depending on the prefix
// console.log(prefixInstance.isPrefix(`.hhg yg`)); // true or false depending on the prefix
// console.log(prefixInstance.match(".hey\\t -g 6 hey there")); // true or false depending on the prefix
// console.log(String(prefixInstance));
// const [_, prefix, cmf = "", body = ""] = prefixInstance.match(".a hi gshs hd ud db dh   hdbd djd d");
// console.log(Boolean(prefix), cmf, body);
