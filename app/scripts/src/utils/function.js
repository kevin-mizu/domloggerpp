const { log, getConfig, getTargets, getOwnPropertyDescriptor, isThisInteresting, checkRegexs, execCode, stringify } = require("./utils");

const proxyFunction = (hook, type, target) => {
    const config = getConfig(hook, type, target);
    var [ parentObject, func ] = getTargets(domlogger.func["String.prototype.split"].call(target, "."));

    if (!parentObject || !(func in parentObject)) {
        domlogger.func["console.log"](`[DOMLogger++] ${target} (function) does not exist!`);
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
    parentObject[func] = new domlogger.func["Proxy"](parentObject[func], {
        apply: function(t, thisArg, args) {
            const keep = checkRegexs(target, config["match"], thisArg, args, true);
            const remove = checkRegexs(target, config["!match"], thisArg, args, false);
            args = execCode(target, config["hookFunction"], thisArg, args);

            if (!remove && keep) {
                log(hook, type, target, thisArg, isThisInteresting(parentObject, thisArg) ? `this=${stringify(thisArg)}; ${stringify(args)}` : args, config);
            }

            return domlogger.func["Reflect"].apply(original, thisArg, args);
        }
    });
}

module.exports = proxyFunction;
