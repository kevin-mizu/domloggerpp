const { log, getConfig, getTargets, getOwnPropertyDescriptor, checkRegexs, execCode } = require("./utils");

const proxyClass = (hook, type, target) => {
    const config = getConfig(hook, type, target);
    var [ parentObject, cls ] = getTargets(domlogger.func["String.prototype.split"].call(target,"."));

    if (!parentObject || !(cls in parentObject)) {
        domlogger.func["console.log"](`[DOMLogger++] ${target} (class) does not exist!`);
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

    parentObject[cls] = new domlogger.func["Proxy"](parentObject[cls], {
        construct: function(t, args) {
            const keep = checkRegexs(config["match"], args, true);
            const remove = checkRegexs(config["!match"], args, false);
            args = execCode(config["hookFunction"], args);

            if (!remove && keep)
                log(hook, type, target, args, config);

            return new t(...args);
        }
    });
}

module.exports = proxyClass;
