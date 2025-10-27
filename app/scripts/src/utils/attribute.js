const { log, getTargets, getOwnPropertyDescriptor, checkRegexs, execCode } = require("./utils");

const proxyAttribute = (type, tag, target, config, globalContext=window) => {
    var propProxy = domlogger.func["String.prototype.split"].call(target, ":");
    target = domlogger.func["Array.prototype.pop"].call(propProxy);
    const [ obj, attr ] = getTargets(domlogger.func["String.prototype.split"].call(target, "."), globalContext);

    // No propProxy empty hook get and set
    if (propProxy.length === 0) {
        propProxy = [ "set", "get" ];
    }

    if (!obj || !(attr in obj)) {
        // The target property doesn't exist, using the custom hooking mechanism instead.
        domlogger.hooks["custom"](type, tag, target, config, globalContext);
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
        domlogger.func["console.log"](`[DOMLogger++] ${target} is not configurable, can't hook it!`);
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

    domlogger.func["Object.defineProperty"](obj, attr, {
        get: function() {
            // Custom property case -> window.mizu -> get() / set() does not exist -> Object { value: "abaab", writable: true, enumerable: true, configurable: true }
            if (original.get) {
                output = original.get.call(this);
            } else {
                output = currentValue;
            }

            if (domlogger.func["Array.prototype.includes"].call(propProxy, "get")) {
                // In getter access, there isn't any call which change the value between beforeEnter and afterEnter
                for (const key of ["beforeEnter", "afterEnter"]) {
                    output = execCode(target, config[key], this, output);
                }
                const keep = checkRegexs(target, config["match"], this, output, true);
                const remove = checkRegexs(target, config["!match"], this, output, false);

                if (!remove && keep) {
                    log(type, tag,
                        this.nodeName ? `get:${this.nodeName.toLowerCase()}.${attr}` : `get:${target}`,
                        this,
                        output,
                        config
                    );
                }
            }
            return output;
        },
        set: function(value) {
            if(domlogger.func["Array.prototype.includes"].call(propProxy, "set") && value) {
                value = execCode(target, config["beforeEnter"], this, value);
                const keep = checkRegexs(target, config["match"], this, value, true);
                const remove = checkRegexs(target, config["!match"], this, value, false);

                if (!remove && keep) {
                    log(type, tag,
                        this.nodeName ? `set:${this.nodeName.toLowerCase()}.${attr}` : `set:${target}`,
                        this,
                        value,
                        config
                    );
                }
            }
            // Custom property case -> window.mizu -> get() / set() does not exist -> Object { value: "abaab", writable: true, enumerable: true, configurable: true }
            if (original.set) {
                var return_value = original.set.call(this, value);
                return_value = execCode(target, config["afterEnter"], null, return_value);
                return return_value;
            } else {
                currentValue = value
                return_value = execCode(target, config["afterEnter"], null, currentValue);
                return return_value;
            }
        }
    });
}

module.exports = proxyAttribute;
