const attributeHook = require("./attribute");
const { log, getConfig, stringify, checkRegexs, execCode } = require("./utils");

const proxyEvent = (hook, type, target, config) => {
    // Format: addEventListener("paste", (event) => {});
    const original = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (event_type, listener, options) {
        if (domlogger.func["Array.prototype.includes"].call(target, event_type)) {
            const config = getConfig(hook, type, event_type);
            args = execCode(target, config["hookFunction"], null, listener);
            const keep = checkRegexs(target, config["match"], null, `${listener}${options ? `;options=${stringify(options)}` : ""}`, true);
            const remove = checkRegexs(target, config["!match"], null, `${listener}${options ? `;options=${stringify(options)}` : ""}`, false);

            if (!remove && keep)
                log(hook, type, `on${event_type}`, null, `${listener}${options ? `;options=${stringify(options)}` : ""}`, config);
        }
        return original.call(this, event_type, listener, options);
    };

    // Format: onpaste = (event) => {};
    for (const t of target) {
        const config = getConfig(hook, type, t);
        if (!(`on${t}` in window)) {
            domlogger.func["console.log"](`[DOMLogger++] on${t} (event) does not exist!`);
            continue;
        }
        attributeHook(hook, type, `set:on${t}`, config);

        if (`on${t}` in HTMLElement.prototype) {
            attributeHook(hook, type, `set:HTMLElement.prototype.on${t}`, config);
        }
    }
}

module.exports = proxyEvent;
