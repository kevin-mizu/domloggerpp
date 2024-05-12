const trace = () => {
    let error = new domlogger.func["Error"]();
    let stack = error.stack;
    stack = domlogger.func["String.prototype.split"].call(stack, "\n");
    return domlogger.func["Array.prototype.filter"].call(stack, (line => !(domlogger.func["String.prototype.includes"].call(line, "/src/bundle.js"))));
}

const sha256 = async (d) => {
    const encoder = new domlogger.func["TextEncoder"]();
    const data = encoder.encode(d);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const hashArray = domlogger.func["Array.from"](new domlogger.func["Uint8Array"](hash));

    const hashHex = domlogger.func["Array.prototype.join"].call(domlogger.func["Array.prototype.map"].call(hashArray, (byte => byte.toString(16).padStart(2, "0"))), "");
    return hashHex;
}

const computeCanary = async (sink, stackTrace) => {
    var execScript = "";
    try {
        cleanUrl   = stackTrace[0].split("@")[1].split(":");
        execLine   = cleanUrl.splice(cleanUrl.length-2).join(":");
        cleanUrl   = cleanUrl.splice(0,2).join(":");
        execScript = `${new URL(cleanUrl).origin}:${execLine}`;
    } catch {
        execScript = stackTrace[0];
    }
    return await sha256(`${execScript}||${sink}`);
}

const log = async (hook, type, sink, sinkData, config) => {
    var stackTrace = trace();
    if (stackTrace[0] === "Error")
        domlogger.func["Array.prototype.shift"].call(stackTrace);

    const canary = await computeCanary(sink, stackTrace);
    if (domlogger["debugCanary"] === canary)
        debugger;

    // Alert system
    var badge = false;
    var notification = false;
    if (config.alert) {
        const keep = checkRegexs(config.alert["match"], sinkData, true);
        const remove = checkRegexs(config.alert["!match"], sinkData, false);

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
        frame: top === self ? "top" : "subframe",
        sink: sink,
        data: stringify(sinkData),
        trace: stackTrace,
        debug: canary,
        badge: badge,
        notification: notification,
    };

    if (!domlogger.func["Array.prototype.includes"].call(domlogger["hookTypeHistory"], type)) {
        domlogger.func["Array.prototype.push"].call(domlogger["hookTypeHistory"], type);
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
        args = domlogger.func["JSON.stringify"](args);
    }

    return args
}

const checkRegexs = (regex, args, def) => {
    if (!regex) {
        return def;
    }

    args = stringify(args);
    for (let r of regex) {
        // Allow the use of variable like location.pathname within the regex value
        if (domlogger.func["String.prototype.split"].call(r, ":")[0] === "exec")
            r = execCode(r, args);

        // Check regex
        try { new domlogger.func["RegExp"](r) } catch {
            domlogger.func["console.log"](`[DOMLogger++] ${r} (regex) is invalid!`);
            continue
        };
        
        if (domlogger.func["String.prototype.match"].call(args, r)) {
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

const execCode = (code, args="") => {
    if (!code)
        return args;

    var output = args;
    try {
        output = domlogger.func["Function"]("args", code)(args);
    } catch {
        domlogger.func["console.log"](`[DOMLogger++] ${stringify(code)} is an invalid code to evaluate!`);
    }

    return output;
}

module.exports = {
    log,
    getConfig,
    getTargets,
    getOwnPropertyDescriptor,
    stringify,
    checkRegexs,
    execCode
}