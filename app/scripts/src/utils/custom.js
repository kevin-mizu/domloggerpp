const { log, getConfig, getTargets } = require("./utils");

const hooks = {
    "function": require("./function"),
    "class": require("./class"),
    "attribute": require("./attribute")
}

const proxyCustom = (type, target) => {
    const info = target.split(":");
    const interval = info.pop();
    const config = getConfig(info.slice(1,).join(":"));
    
    const t = info.slice(1,).pop();
    const wait = setInterval(() => {
        var [ obj, attr ] = getTargets(t.split("."));
        if (obj && attr in obj) { // Doing in check in order to allow prototype pollution search
            clearInterval(wait);

            // In case of set attr, log when attribute is set for the first time
            if (info[0] === "attribute" && (info[1] === "set" || info[2] === "set"))
                log(type, info.slice(1,).join(":"), JSON.stringify(obj[attr]), config);

            hooks[info[0]](type, info.slice(1,).join(":"));
        }
    }, interval);
}

module.exports = proxyCustom;
