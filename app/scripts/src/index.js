// Hooks functions
const hooks = {
    "function": require("./utils/function"),
    "class": require("./utils/class"),
    "attribute": require("./utils/attribute"),
    "event": require("./utils/event"),
    "checkContent": require("./utils/checkContent"),
    "custom": require("./utils/custom")
}

// Log setup
const scriptURL = new URL(document.currentScript.src);
const params = new URLSearchParams(scriptURL.search);
const hookSettings = JSON.parse(atob(params.get("hookSettings")));

// Init
window.domlogger = {};
window.domlogger["hooksTargets"] = hookSettings.hooks;
window.domlogger["hooksConfig"]  = hookSettings.config;
window.domlogger["hookTypeHistory"] = [];
window.domlogger["domlogger_debug_canary"] = params.get("debugCanary");

// Start hooking
for (const [type, conf] of Object.entries(window.domlogger["hooksTargets"])) {
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