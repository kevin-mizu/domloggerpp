const { sha256 } = require("./crypto");

const trace = () => {
    let error = new domlogger.func["Error"]();
    let stack = error.stack;
    stack = domlogger.func["String.prototype.split"].call(stack, "\n");
    if (domlogger["isChromium"] === "true") {
        return domlogger.func["Array.prototype.filter"].call(stack, (line => !(domlogger.func["String.prototype.includes"].call(line, "/src/domloggerpp-bundle.js"))));
    } else {
        // On firefox, extension's js filename isn't present in the stack trace...
        // I hope there is no weird case where 3 isn't the magic number...
        return domlogger.func["Array.prototype.splice"].call(stack, 3);
    }
}

const computeCanary = (sink, stackTrace) => {
    var execScript = "";
    try {
        cleanUrl   = domlogger.func["String.prototype.split"].call(domlogger.func["String.prototype.split"].call(stackTrace[0], "://")[1], ":");
        execLine   = domlogger.func["Array.prototype.join"].call(domlogger.func["Array.prototype.splice"].call(cleanUrl, cleanUrl.length-2), ":");
        cleanUrl   = domlogger.func["Array.prototype.join"].call(domlogger.func["Array.prototype.splice"].call(cleanUrl, 0, 2), ":");
        execScript = `${new domlogger.func["URL"](`https://${cleanUrl}`).origin}:${execLine}`;
    } catch {
        execScript = stackTrace[0];
    }
    return sha256(`${execScript}||${sink}`);
}

const getWindowContext = (c, t=top, cc="top") => {
    if (c === top) {
        return "top";
    }

    if (c === opener) {
        return "opener";
    }

    for (let i = 0; i < t.frames.length; i++) {
        if (c === t.frames[i]) {
            return `${cc}.frames[${i}]`;
        } else {
            const result = getWindowContext(c, t.frames[i], `${cc}.frames[${i}]`);
            if (result) {
                return result;
            }
        }
    }
    return null;
};

const log = (hook, type, sink, thisArg, sinkData, config) => {
    // Retrieve the stack trace of the current sink. Remove the first raw linked to the extension.
    var stackTrace = trace();
    if (stackTrace[0] === "Error")
        domlogger.func["Array.prototype.shift"].call(stackTrace);

    // Used to find the sink. Doesn't takes the data into account has data might change while looking at it.
    const canary = computeCanary(sink, stackTrace);
    if (domlogger["debugCanary"] === canary)
        debugger;

    // Used to manage duplicate on the devtools. This time, we need different data on the same sink to be present.
    const dupKey = sha256(`${canary}||${stringify(sinkData)}`);

    // Avoid postMessage looks like "window.onmessage = (e) => document.body.innerHTML = e.data".
    if (domlogger.func["Array.prototype.includes"].call(domlogger["dupKeyHistory"], dupKey)) {
        return;
    }
    domlogger.func["Array.prototype.push"].call(domlogger["dupKeyHistory"], dupKey);

    // Verify if the trace content is allowed.
    const keep = checkRegexs(sink, config["matchTrace"], thisArg, stackTrace, true);
    const remove = checkRegexs(sink, config["!matchTrace"], thisArg, stackTrace, false);
    if (remove || !keep) {
        return;
    }

    // Alert system
    var badge = false;
    var notification = false;
    if (config.alert) {
        const keep = checkRegexs(sink, config.alert["match"], thisArg, sinkData, true);
        const remove = checkRegexs(sink, config.alert["!match"], thisArg, sinkData, false);

        if (!remove && keep) {
            badge = true;
            if (config.alert.notification)
                notification = true;
        }
    }

    let data = {
        ext: "domlogger++",
        date: domlogger.func["Date.now"](),
        href: location.href,
        type: type,
        hook: hook,
        frame: getWindowContext(self),
        sink: sink,
        data: stringify(sinkData),
        trace: stackTrace,
        debug: canary,
        dupKey: dupKey,
        badge: badge,
        notification: notification,
    };

    if (!domlogger.func["Array.prototype.includes"].call(domlogger["hookTypeHistory"], type)) {
        domlogger.func["Array.prototype.push"].call(domlogger["hookTypeHistory"], type);
    }

    if (domlogger.logOnly) {
        console.log("[DOMLogger++]", data);
        return;
    }

    if (checkRequired(config)) {
        domlogger.func["postMessage"](data, "*");
    }
}

const getConfig = (hook, type, key) => {
    var configGlobal = domlogger["hooksConfig"]["*"] ? domlogger["hooksConfig"]["*"] : {};
    var configHook   = domlogger["hooksConfig"][hook] ? domlogger["hooksConfig"][hook] : {};
    var configType   = domlogger["hooksConfig"][type] ? domlogger["hooksConfig"][type] : {};
    var configTarget = domlogger["hooksConfig"][key] ? domlogger["hooksConfig"][key] : {};

    return domlogger.func["Object.assign"]({}, configGlobal, configTarget, configHook, configType);
}

const getTargets = (target) => {
    var attr = domlogger.func["Array.prototype.pop"].call(target);
    var obj  = window;

    // In case window.x
    if (target[0] === "window")
        domlogger.func["Array.prototype.shift"].call(target);

    for (const t of target) {
        if (!(t in obj))
            return [ null, null ];

        obj = obj[t]
    }
    return [ obj, attr ]
}

const getOwnPropertyDescriptor = (obj, prop) => {
    while (obj) {
        const descriptor = domlogger.func["Object.getOwnPropertyDescriptor"](obj, prop);
        if (descriptor) {
            return descriptor;
        }
        obj = domlogger.func["Object.getPrototypeOf"](obj);
    }
    return undefined;
}

const stringify = (args) => {
    // JSON.stringify(undefined) = undefined -> .match = crash
    if (typeof args === "undefined") {
        args = "undefined";
    } else if (typeof args === "function") {
        args = domlogger.func["Function.prototype.toString"].call(args);
    } else if (!(typeof args === "string")) {
        try {
            args = domlogger.func["JSON.stringify"](args);
        // Handle 'Converting circular structure to JSON' error -> ie stringify(window)
        } catch {
            args = `${args}`;
        }
    }

    return args
}

const checkRegexs = (target, regex, thisArg, args, def) => {
    if (!regex) {
        return def;
    }

    argsString = stringify(args);

    for (let r of regex) {
        // Allow the use of variable like location.pathname within the regex value
        if (domlogger.func["String.prototype.split"].call(r, ":")[0] === "exec")
            r = execCode(target, r, thisArg, args);

        // Check regex
        try { new domlogger.func["RegExp"](r) } catch {
            domlogger.func["console.log"](`[DOMLogger++] ${r} (regex) is invalid!`);
            continue
        };

        if (domlogger.func["String.prototype.match"].call(argsString, r)) {
            return true;
        }
    }
    return false;
}

const checkRequired = (config) => {
    if (config && config.requiredHooks) {
        for (const rHook of config.requiredHooks) {
            if (!domlogger.func["Array.prototype.includes"].call(domlogger["hookTypeHistory"], rHook))
                return false;
        }
    }

    return true;
}

const execCode = (target, code, thisArg="", args="") => {
    if (!code)
        return args;

    if (domlogger.func["String.prototype.split"].call(code, ":")[0] === "exec") {
        code = domlogger.func["String.prototype.split"].call(code, ":").splice(1).join(":");
    }
    var output = args;
    try {
        output = domlogger.func["Function"]("thisArg", "args", "target", code)(thisArg, args, target);
    } catch(e) {
        domlogger.func["console.log"](`[DOMLogger++] ${stringify(code)} is an invalid code to evaluate!\nError: ${e.message}`);
    }

    return output;
}

// Exposing domlogger utils within execCode function
domlogger["utils"] = {
    trace,
    sha256,
    computeCanary,
    getWindowContext,
    log,
    getConfig,
    getTargets,
    getOwnPropertyDescriptor,
    stringify,
    checkRegexs,
    execCode
}

module.exports = {
    trace,
    sha256,
    computeCanary,
    getWindowContext,
    log,
    getConfig,
    getTargets,
    getOwnPropertyDescriptor,
    stringify,
    checkRegexs,
    execCode
}
