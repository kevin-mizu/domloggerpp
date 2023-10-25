const { log, getConfig, getTargets, getOwnPropertyDescriptor, checkRegexs } = require("./utils");

const proxyClass = (type, target) => {
    const config = getConfig(target);
    var [ parentObject, cls ] = getTargets(target.split("."));

    if (!parentObject || !(cls in parentObject)) {
        console.log(`[DOMLogger++] ${target} (class) does not exist!`);
        return;
    }

    if (!(typeof parentObject[cls] === "function")) {
        console.log(`[DOMLogger++] ${target} is not a class!`);
        return;
    }

    // Non-configurable property can't be proxy
    if (!getOwnPropertyDescriptor(parentObject, cls).configurable) {
        console.log(`[DOMLogger++] ${target} is not configurable, can't hook it!`);
        return;
    }

    parentObject[cls] = new Proxy(parentObject[cls], {
        construct: function(t, args) {
            const keep = checkRegexs(config["match"], args, true);
            const remove = checkRegexs(config["!match"], args, false);

            if (config["hookFunction"])
                args = Function("args", config["hookFunction"])(args);

            if (!remove && keep)
                log(type, target, JSON.stringify(args), config);

            return new t(...args);
        }
    });
}

module.exports = proxyClass;
