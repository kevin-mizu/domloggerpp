const { log, getTargets, getOwnPropertyDescriptor, checkRegexs, execCode } = require("./utils");

const proxyClass = (hook, type, target, config) => {
    var [ parentObject, cls ] = getTargets(domlogger.func["String.prototype.split"].call(target,"."));

    if (!parentObject || !(cls in parentObject)) {
        // The target property doesn't exist, using the custom hooking mechanism instead.
        domlogger.hooks["custom"](hook, type, target, config)
        return;
    }

    if (!(typeof parentObject[cls] === "function")) {
        domlogger.func["console.log"](`[DOMLogger++] ${target} is not a class!`);
        return;
    }

    // Non-configurable property can't be proxy
    if (!getOwnPropertyDescriptor(parentObject, cls).configurable) {
        domlogger.func["console.log"](`[DOMLogger++] ${target} is not configurable, can't hook it!`);
        return;
    }

    if (!(domlogger.func["Array.prototype.includes"].call(domlogger.func["Object.keys"](domlogger.func), target))) {
        domlogger.func[target] = parentObject[cls];
    }
    parentObject[cls] = new domlogger.func["Proxy"](parentObject[cls], {
        construct: function(t, args) {
            args = execCode(target, config["hookFunction"], null, args);
            const keep = checkRegexs(target, config["match"], null, args, true);
            const remove = checkRegexs(target, config["!match"], null, args, false);

            if (!remove && keep)
                log(hook, type, target, t, args, config);

            return new t(...args);
        }
    });
}

module.exports = proxyClass;
