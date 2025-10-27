const attributeHook = require("./attribute");
const { log, getConfig, stringify, checkRegexs, execCode } = require("./utils");

const proxyEvent = (type, tag, target, globalContext=window) => {
    // Format: addEventListener("paste", (event) => {});
    const original = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (event_type, listener, options) {
        if (domlogger.func["Array.prototype.includes"].call(target, event_type)) {
            const config = getConfig(type, tag, event_type);
            args = execCode(target, config["beforeEnter"], null, listener);
            const keep = checkRegexs(target, config["match"], null, `${listener}${options ? `;options=${stringify(options)}` : ""}`, true);
            const remove = checkRegexs(target, config["!match"], null, `${listener}${options ? `;options=${stringify(options)}` : ""}`, false);

            if (!remove && keep)
                log(type, tag,
                    this.nodeName ? `${this.nodeName.toLowerCase()}.on${event_type}` : `on${event_type}`,
                    null,
                    `${listener}${options ? `;options=${stringify(options)}` : ""}`,
                    config
                );

            var return_value = original.call(this, event_type, listener, options);
            return_value = execCode(target, config["afterEnter"], null, return_value);
            return return_value;
        } else {
            return original.call(this, event_type, listener, options);
        }
    };

    // Format: onpaste = (event) => {};
    for (const t of target) {
        const config = getConfig(type, tag, t);
        if (!(`on${t}` in window)) {
            domlogger.func["console.log"](`[DOMLogger++] on${t} (event) does not exist!`);
            continue;
        }
        attributeHook(type, tag, `set:on${t}`, config, globalContext);

        if (`on${t}` in HTMLElement.prototype) {
            attributeHook(type, tag, `set:HTMLElement.prototype.on${t}`, config, globalContext);
        }
    }
}

module.exports = proxyEvent;
