const { log, getConfig, getTargets } = require("./utils");

const hooks = {
    "function": require("./function"),
    "class": require("./class"),
    "attribute": require("./attribute")
}

const proxyCustom = (hook, type, target) => {
    const info = domlogger.func["String.prototype.split"].call(target, ":");
    const interval = !domlogger.func["isNaN"](info[info.length-1]) ? domlogger.func["Array.prototype.pop"].call(info) : 50;
    const config = getConfig(hook, type, domlogger.func["Array.prototype.join"].call( domlogger.func["Array.prototype.slice"].call(info, 1), ":"));

    const t = domlogger.func["Array.prototype.pop"].call( domlogger.func["Array.prototype.slice"].call(info, 1));
    const wait = domlogger.func["setInterval"](() => {
        var [ obj, attr ] = getTargets(domlogger.func["String.prototype.split"].call(t, "."));
        if (obj && attr in obj) { // Doing in check in order to allow prototype pollution search
            domlogger.func["clearInterval"](wait);

            // In case of set attr, log when attribute is set for the first time
            if (info[0] === "attribute" && (info[1] === "set" || info[2] === "set"))
                log(hook, type, domlogger.func["Array.prototype.join"].call(domlogger.func["Array.prototype.slice"].call(info, 1), ":"), obj[attr], config);

            hooks[info[0]](hook, type, domlogger.func["Array.prototype.join"].call(domlogger.func["Array.prototype.slice"].call(info, 1), ":"));
        }
    }, interval);
}

module.exports = proxyCustom;
