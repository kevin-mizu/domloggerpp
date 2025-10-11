const { log, getTargets, getOwnPropertyDescriptor, checkRegexs, execCode, stringify } = require("./utils");

const proxyFunction = (type, tag, target, config) => {
    var [ parentObject, func ] = getTargets(domlogger.func["String.prototype.split"].call(target, "."));

    if (!parentObject || !(func in parentObject)) {
        // The target property doesn't exist, using the custom hooking mechanism instead.
        domlogger.hooks["custom"](type, tag, target, config)
        return;
    }

    if (!(typeof parentObject[func] === "function")) {
        domlogger.func["console.log"](`[DOMLogger++] ${target} is not a function!`);
        return;
    }

    // Non-configurable property can't be proxy
    if (!getOwnPropertyDescriptor(parentObject, func).configurable) {
        domlogger.func["console.log"](`[DOMLogger++] ${target} is not configurable, can't hook it!`);
        return;
    }

    const original = parentObject[func];
    // Keeping a reference to the original function for execCode usage
    if (!(domlogger.func["Array.prototype.includes"].call(domlogger.func["Object.keys"](domlogger.func), target))) {
        domlogger.func[target] = original;
    }
    parentObject[func] = new domlogger.func["Proxy"](parentObject[func], {
        apply: function(t, thisArg, args) {
            args = execCode(target, config["hookFunction"], thisArg, args);
            if (domlogger.update.thisArg) {
                thisArg = domlogger.update.thisArg;
            }
            domlogger.update.thisArg = null;

            const keep = checkRegexs(target, config["match"], thisArg, args, true);
            const remove = checkRegexs(target, config["!match"], thisArg, args, false);

            if (!remove && keep) {
                log(type, tag, target, thisArg, (config["showThis"]) ? `this=${stringify(thisArg)}\n\nargs=${stringify(args)}` : args, config);
            }

            try {
                return domlogger.func["Reflect"].apply(original, thisArg, args);
            } catch (error) {
                if (error.message === 'CreateListFromArrayLike called on non-object') {
                    throw `TypeError: second argument to Function.prototype.apply must be an array
"hookFunction": "return  2 "  // BAD
"hookFunction": "return [2]"  // GOOD`;
                }
                throw error;
            }
        }
    });
}

module.exports = proxyFunction;
