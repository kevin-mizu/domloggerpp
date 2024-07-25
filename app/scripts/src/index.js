// Log setup
const scriptURL = new URL(document.currentScript.src);
const params = new URLSearchParams(scriptURL.search);
const hookSettings = JSON.parse(decodeURIComponent(atob(params.get("hookSettings"))));

// Init
window.domlogger = {};
domlogger.clean = () => {
    domlogger["debugCanary"] = "";
};
domlogger["update"] = {} // Used to change value such as thisArg within the execCode function
domlogger["_description"] = hookSettings._description;
domlogger["globals"] = hookSettings.globals;
domlogger["hooksTargets"] = hookSettings.hooks;
domlogger["hooksConfig"]  = {};
domlogger["hookTypeHistory"] = [];
domlogger["debugCanary"] = params.get("debugCanary") === "undefined" ? undefined : params.get("debugCanary");

// Setup hooksConfig
for (const key of Object.keys(hookSettings.config)) {
    for (const subKey of key.split("|")) {
        domlogger["hooksConfig"][subKey] = hookSettings.config[key];
    }
}

// Overwrite toJSON method -> improve stringify output
RegExp.prototype.toJSON = function() {
    return this.toString();
};

// Function used within DOMLogger++ - avoid infinit loops
domlogger["func"] = {
    "Array.from": Array.from,
    "Array.prototype.filter": Array.prototype.filter,
    "Array.prototype.includes": Array.prototype.includes,
    "Array.prototype.indexOf": Array.prototype.indexOf,
    "Array.prototype.join": Array.prototype.join,
    "Array.prototype.map": Array.prototype.map,
    "Array.prototype.pop": Array.prototype.pop,
    "Array.prototype.push": Array.prototype.push,
    "Array.prototype.shift": Array.prototype.shift,
    "Array.prototype.slice": Array.prototype.slice,
    "Array.prototype.splice": Array.prototype.splice,
    "clearInterval": clearInterval.bind(window),
    "console.log": console.log,
    "crypto.subtle": crypto.subtle,
    "Date.now": Date.now,
    "Error": Error,
    "Function": Function,
    "Function.prototype.toString": Function.prototype.toString,
    "JSON.stringify": JSON.stringify,
    "Object.assign": Object.assign,
    "Object.entries": Object.entries,
    "Object.getOwnPropertyDescriptor": Object.getOwnPropertyDescriptor,
    "Object.getPrototypeOf": Object.getPrototypeOf,
    "postMessage": postMessage.bind(window),
    "Proxy": Proxy,
    "Reflect": Reflect,
    "RegExp": RegExp,
    "setInterval": setInterval.bind(window),
    "String.prototype.includes": String.prototype.includes,
    "String.prototype.match": String.prototype.match,
    "String.prototype.split": String.prototype.split,
    "String.prototype.startsWith": String.prototype.startsWith,
    "TextEncoder": TextEncoder,
    "Uint8Array": Uint8Array,
    "URL": URL
}

// Hooks functions
const hooks = {
    "function": require("./utils/function"),
    "class": require("./utils/class"),
    "attribute": require("./utils/attribute"),
    "event": require("./utils/event"),
    "custom": require("./utils/custom")
}

// Start hooking
domlogger["customTargets"] = [];
for (const [type, conf] of domlogger.func["Object.entries"](domlogger["hooksTargets"])) {
    for (const [hook, target] of domlogger.func["Object.entries"](conf)) {
        if (hook === "event") {
            hooks[hook](hook, type, target);
            continue;
        }

        for (const t of target) {
            // Limit the number of setInterval
            if (hook === "custom") {
                domlogger.customTargets.push({
                    "hook": hook,
                    "type": type,
                    "target": t
                });
                continue;
            }

            hooks[hook](hook, type, t);
        }
    }
}

// Hook all custom target at once
hooks["custom"](domlogger.customTargets);