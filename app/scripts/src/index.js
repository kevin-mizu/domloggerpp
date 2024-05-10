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
domlogger["hooksTargets"] = hookSettings.hooks;
domlogger["hooksConfig"]  = hookSettings.config;
domlogger["hookTypeHistory"] = [];
domlogger["domlogger_debug_canary"] = params.get("debugCanary") === "undefined" ? undefined : params.get("debugCanary");

// Function used within DOMLogger++ - avoid infinit loops
domlogger["func"] = {
    "Array.from": Array.from,
    "Array.prototype.filter": Array.prototype.filter,
    "Array.prototype.includes": Array.prototype.includes,
    "Array.prototype.join": Array.prototype.join,
    "Array.prototype.map": Array.prototype.map,
    "Array.prototype.pop": Array.prototype.pop,
    "Array.prototype.push": Array.prototype.push,
    "Array.prototype.shift": Array.prototype.shift,
    "Array.prototype.slice": Array.prototype.slice,
    "clearInterval": clearInterval.bind(window),
    "console.log": console.log,
    "Date.now": Date.now,
    "Error": Error,
    "Function": Function,
    "Function.prototype.toString": Function.prototype.toString,
    "isNaN": isNaN,
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
    "TextEncoder": TextEncoder,
    "Uint8Array": Uint8Array
}

// Start hooking
for (const [type, conf] of domlogger.func["Object.entries"](domlogger["hooksTargets"])) {
    for (const [hook, target] of domlogger.func["Object.entries"](conf)) {
        if (hook === "event") {
            hooks[hook](hook, type, target);
            continue;
        }

        for (const t of target) {
            hooks[hook](hook, type, t);
        }
    }
}