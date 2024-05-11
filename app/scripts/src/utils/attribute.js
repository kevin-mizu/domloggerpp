const { log, getConfig, getTargets, getOwnPropertyDescriptor, checkRegexs, execCode } = require("./utils");

const proxyAttribute = (hook, type, target) => {
    const config = getConfig(hook, type, target);
    var propProxy = domlogger.func["String.prototype.split"].call(target, ":");
    target = domlogger.func["Array.prototype.pop"].call(propProxy);
    const [ obj, attr ] = getTargets(domlogger.func["String.prototype.split"].call(target, "."));

    // No propProxy empty hook get and set
    if (propProxy.length === 0) {
        propProxy = [ "set", "get" ];
    }

    if (!obj || !(attr in obj)) {
        domlogger.func["console.log"](`[DOMLogger++] ${target} (attribute) does not exist!`);
        return;
    }

    try {
        // Some attribute can't be access obj[attr] -> crash (ie: Element.prototype.innerHTML)
        if (typeof obj[attr] === "function") {
            domlogger.func["console.log"](`[DOMLogger++] ${target} can't be a function or a class!`);
            return;
        }
    } catch {}

    const original = getOwnPropertyDescriptor(obj, attr); // Doing getOwnPropertyDescriptor recursively to handle x.__proto__.target set with custom type

    // Non-configurable property can't be proxy
    if (!original.configurable) {
        window.domlogger["functions"]["console.log"](`[DOMLogger++] ${target} is not configurable, can't hook it!`);
        return;
    }

    // Handle setter / getter issues + read only properties
    var currentValue;
    if (!original.set || !original.get) {
        try {
            currentValue = obj[attr];
        } catch {
            // In this case, XXX
            if (!original.set && original.get) {
                if (domlogger.func["Array.prototype.includes"].call(propProxy, "set")) {
                    domlogger.func["console.log"](`[DOMLogger++] Only the getter can be hooked for ${target}, remove set!`);
                    return;
                }
            }
            // Default error response
            else {
                domlogger.func["console.log"](`[DOMLogger++] ${target} can't be hook for now!`);
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

            if (domlogger.func["Array.prototype.includes"].call(propProxy, "get")) {
                output = execCode(config["hookFunction"], output);

                log(hook, type,
                    this.nodeName ? `get:${this.nodeName.toLowerCase()}.${attr}` : `get:${target}`,
                    output,
                    config
                );
            }
            return output;
        },
        set: function(value) {
            if(domlogger.func["Array.prototype.includes"].call(propProxy, "set") && value) {
                const keep = checkRegexs(config["match"], value, true);
                const remove = checkRegexs(config["!match"], value, false);
                value = execCode(config["hookFunction"], value);

                if (!remove && keep) {
                    log(hook, type,
                        this.nodeName ? `set:${this.nodeName.toLowerCase()}.${attr}` : `set:${target}`,
                        value,
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
