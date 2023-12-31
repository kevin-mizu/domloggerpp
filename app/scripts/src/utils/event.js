const attributeHook = require("./attribute");
const { log, getConfig, checkRegexs } = require("./utils");

const proxyClass = (type, target) => {
    // Format: addEventListener("paste", (event) => {});
    const original = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (event_type, listener, options) {
        if (target.includes(event_type)) {
            const config = getConfig(event_type);
            const keep = checkRegexs(config["match"], `${listener}${options ? `;options=${JSON.stringify(options)}` : ""}`, true);
            const remove = checkRegexs(config["!match"], `${listener}${options ? `;options=${JSON.stringify(options)}` : ""}`, false);

            if (config["hookFunction"])
                args = Function("args", config["hookFunction"])(listener);

            if (!remove && keep)
                log(type, `on${event_type}`, `${listener}${options ? `;options=${JSON.stringify(options)}` : ""}`, config);
        }
        return original.call(this, event_type, listener, options);
    };

    // Format: onpaste = (event) => {};
    for (const t of target) {
        if (!(`on${t}` in window)) {
            console.log(`[DOMLogger++] on${t} (event) does not exist!`);
            continue;
        }
        attributeHook(type, `set:on${t}`);
    }
}

module.exports = proxyClass;
