// Log setup
const dataset = document.currentScript.dataset;
const hookSettings = JSON.parse(dataset.hookSettings);
const getParams = new URLSearchParams(location.search);

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
domlogger["dupKeyHistory"] = [];
domlogger["hookTypeHistory"] = [];
domlogger["debugCanary"] = dataset.debugCanary === "undefined" ? getParams.get("domloggerpp-canary") || undefined : dataset.debugCanary;
domlogger["isChromium"] = dataset.isChromium // I prefer using "typeof browser === undefined" instead of "navigator.vendor" to be sure a specific chromium based browser doesn't overwrite this value.

// Setup hooksConfig
hookSettings.config = hookSettings.config || {};
for (const key of Object.keys(hookSettings.config)) {
    for (const subKey of key.split("|")) {
        domlogger["hooksConfig"][subKey] = hookSettings.config[key];
    }
}

// Check console.log only mode
domlogger["logOnly"] = dataset.logOnly;

// Overwrite toJSON method -> improve stringify output
RegExp.prototype.toJSON = function() {
    return this.toString();
};
Function.prototype.toJSON = function() {
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
    "Date": Date,
    "Date.now": Date.now,
    "Error": Error,
    "Function": Function,
    "Function.prototype.toString": Function.prototype.toString,
    "JSON.stringify": JSON.stringify,
    "Object.assign": Object.assign,
    "Object.create": Object.create,
    "Object.defineProperty": Object.defineProperty,
    "Object.entries": Object.entries,
    "Object.keys": Object.keys,
    "Object.getOwnPropertyDescriptor": Object.getOwnPropertyDescriptor,
    "Object.getPrototypeOf": Object.getPrototypeOf,
    "postMessage": postMessage.bind(window),
    "Proxy": Proxy,
    "Reflect": Reflect,
    "RegExp": RegExp,
    "setInterval": setInterval.bind(window),
    "String.prototype.includes": String.prototype.includes,
    "String.prototype.match": String.prototype.match,
    "String.prototype.replace": String.prototype.replace,
    "String.prototype.slice": String.prototype.slice,
    "String.prototype.split": String.prototype.split,
    "String.prototype.startsWith": String.prototype.startsWith,
    "TextEncoder": TextEncoder,
    "Uint8Array": Uint8Array,
    "URL": URL
}

// Hooks functions
domlogger.hooks = {
    "function": require("./utils/function"),
    "class": require("./utils/class"),
    "attribute": require("./utils/attribute"),
    "event": require("./utils/event"),
    "custom": require("./utils/custom")
}

// Retrieve config function
const { getConfig } = require("./utils/utils");

// Start hooking
domlogger["customTargets"] = [];
for (const [type, conf] of domlogger.func["Object.entries"](domlogger["hooksTargets"])) {
    for (const [hook, target] of domlogger.func["Object.entries"](conf)) {
        if (hook === "custom") {
            domlogger.func["console.log"](`[DOMLogger++] The custom type can no longer be used directly. To hook ${target}, use the associated type instead!`);
            continue;
        }

        if (hook === "event") {
            domlogger.hooks[hook](hook, type, target);
            continue;
        }

        for (var t of target) {
            domlogger.hooks[hook](hook, type, t, getConfig(hook, type, t));
        }
    }
}

// Trigger the onload event
const { execCode } = require("./utils/utils");

if (hookSettings.onload) {
    execCode(null, hookSettings.onload);
}