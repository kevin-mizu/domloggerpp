// Hooks
const hooks = {
    "function": require("./utils/function"),
    "class": require("./utils/class"),
    "attribute": require("./utils/attribute"),
    "event": require("./utils/event"),
    "custom": require("./utils/custom")
}

// Log setup
const scriptURL = new URL(document.currentScript.src);
const params = new URLSearchParams(scriptURL.search);
const hookSettings = JSON.parse(params.get("hookSettings"));

window.hooksTargets = hookSettings.hooks;
window.hooksConfig  = hookSettings.config;
window.domlogger_debug_canary = params.get("debugCanary");

for (const [type, conf] of Object.entries(window.hooksTargets)) {
    for (const [hook, target] of Object.entries(conf)) {
        if (hook === "event") {
            hooks[hook](hook, type, target);
            continue;
        }

        for (const t of target) {
            // Avoid recursive loops
            if (t.split(".").pop() === "postMessage") {
                window.originalPostMessage = window.postMessage;
            }

            hooks[hook](hook, type, t);
        }
    }
}
