const { log, getConfig, getTargets } = require("./utils");

const hooks = {
    "function": require("./function"),
    "class": require("./class"),
    "attribute": require("./attribute")
}

const proxyCustom = (targets) => {
    for (let i=0; i<targets.length; i++) {
        targets[i].info = domlogger.func["String.prototype.split"].call(targets[i].target, ":");
        targets[i].config = getConfig(targets[i].hook, targets[i].type, domlogger.func["Array.prototype.join"].call( domlogger.func["Array.prototype.slice"].call(targets[i].info, 1), ":"));
        targets[i].t = domlogger.func["Array.prototype.pop"].call( domlogger.func["Array.prototype.slice"].call(targets[i].info, 1));
    }

    const wait = domlogger.func["setInterval"].call(window, () => {
        for (const t of targets) {
            var [ obj, attr ] = getTargets(domlogger.func["String.prototype.split"].call(t.t, "."));
            if (obj && attr in obj) { // Doing in check in order to allow prototype pollution search

                // In case of set attr, log when attribute is set for the first time
                if (t.info[0] === "attribute" && (t.info.includes("set") || !t.info.includes("get")))
                    log(t.hook, t.type, domlogger.func["Array.prototype.join"].call(domlogger.func["Array.prototype.slice"].call(t.info, 1), ":"), null, obj[attr], t.config);

                hooks[t.info[0]](t.hook, t.type, domlogger.func["Array.prototype.join"].call(domlogger.func["Array.prototype.slice"].call(t.info, 1), ":"));
                domlogger.func["Array.prototype.splice"].call(targets, domlogger.func["Array.prototype.indexOf"].call(targets, t), 1);
            }
        }

        if (targets.length === 0) {
            domlogger.func["clearInterval"](wait);
        }
    }, 50);
}

module.exports = proxyCustom;
