const { log, getConfig, getTargets, getOwnPropertyDescriptor, checkRegexs } = require("./utils");

const proxyAttribute = (hook, type, target) => {
    const config = getConfig(target);
    const propProxy = target.split(":");
    target = propProxy.pop();
    const [ obj, attr ] = getTargets(target.split("."));

    if (!obj || !(attr in obj)) {
        console.log(`[DOMLogger++] ${target} (attribute) does not exist!`);
        return;
    }

    try {
        // Some attribute can't be access obj[attr] -> crash (ie: Element.prototype.innerHTML)
        if (typeof obj[attr] === "function") {
            console.log(`[DOMLogger++] ${target} can't be a function or a class!`);
            return;
        }
    } catch {}

    const original = getOwnPropertyDescriptor(obj, attr); // Doing getOwnPropertyDescriptor recursively to handle x.__proto__.target set with custom type

    // Non-configurable property can't be proxy
    if (!original.configurable) {
        console.log(`[DOMLogger++] ${target} is not configurable, can't hook it!`);
        return;
    }

    // Handle setter / getter issues + read only properties
    var currentValue;
    if (!original.set || !original.get) {
        try {
            currentValue = obj[attr];
        } catch {
            // In this case, 
            if (!original.set && original.get) {
                if (propProxy.includes("set")) {
                    console.log(`[DOMLogger++] Only the getter can be hooked for ${target}, remove set!`);
                    return;
                }
            }
            // Default error response
            else {
                console.log(`[DOMLogger++] ${target} can't be hook for now!`);
                return;
            }
        }
    }

    Object.defineProperty(obj, attr, {
        get: function() {
            // Custom property case -> window.mizu -> get() / set() does not exist -> Object { value: "abaab", writable: true, enumerable: true, configurable: true }
            if (original.get) {
                output = original.get.call(this);
            } else {
                output = currentValue;
            }

            if (propProxy.includes("get")) {
                if (config["hookFunction"])
                    output = Function("output", config["hookFunction"])(output);

                log(hook, type,
                    `${this.nodeName ? `get:${this.nodeName.toLowerCase()}.${attr}` : target}`,
                    JSON.stringify(output),
                    config
                );
            }
            return output;
        },
        set: function(value) {
            if(propProxy.includes("set") && value) {
                const keep = checkRegexs(config["match"], value, true);
                const remove = checkRegexs(config["!match"], value, false);

                if (config["hookFunction"])
                    value = Function("args", config["hookFunction"])(value);

                if (!remove && keep) {
                    log(hook, type,
                        `${this.nodeName ? `set:${this.nodeName.toLowerCase()}.${attr}` : target}`,
                        JSON.stringify(value),
                        config
                    );
                }
            }
            // Custom property case -> window.mizu -> get() / set() does not exist -> Object { value: "abaab", writable: true, enumerable: true, configurable: true }
            if (original.set) {
                return original.set.call(this, value);
            } else {
                currentValue = value
                return;
            }
        }
    });
}

module.exports = proxyAttribute;
