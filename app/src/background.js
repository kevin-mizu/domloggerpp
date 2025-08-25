// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

// Chromium manifest v3 uses workers and can only loads 1 background script. Use importScripts to import everything.
const backgroundScripts = [ "utils.js", "handlers.js", "init.js", "shortcuts.js" ];
if (typeof browser === "undefined") {
    for (const c of backgroundScripts) {
        importScripts(`./background/${c}`);
    }
}

MessagesHandler = new class {
    constructor() {
        this.ports = {};
        this.storage = {}; // I'm not using extensionAPI.storage to avoid "Promise" race condition in case of multiple postMessage in a small timing.
        this.webhookConfig = { url: "", headers: Object.create(null), bodyTemplate: "" };
        this.webhookQueue = [];
        this.devtoolsPanel = true;
        this.browserStorage = {}; // Limit the number of calls to extensionAPI.storage.local.get
        this.badge = 0;
    }

    connect(port) {
        this.ports[port.name] = port;
        if (this.devtoolsPanel)
            port.postMessage({ "init": this.storage });
        port.onDisconnect.addListener(p => {
            delete this.ports[p.name];
        })
    }

    broadcast(data) {
        if (data.badge) {
            this.badge += 1;
            this.updateBadge();
        }
        if (data.notification) {
            this.sendNotification(data.dupKey, `New ${data.type} sink reached!`, `Domain: ${data.href}\nSink: ${data.sink}`);
        }

        for (const port of Object.values(this.ports)) {
            if (this.devtoolsPanel)
                port.postMessage(data);
        }
    }

    sendWebhook() {
        if (this.webhookQueue.length === 0) return;

        if (this.webhookConfig.url) {
            fetch(this.webhookConfig.url, {
                method: "POST",
                headers: Object.entries(this.webhookConfig.headers).map(([key, val]) => [key, val.value]),
                body: this.webhookConfig.bodyTemplate.replace("{data}", JSON.stringify(this.webhookQueue))
            }).catch(() => {}); // Add a logging mechanism
        }

        // Even if there is an issue sending the data, we don't want to send it twice.
        this.webhookQueue = [];
    }

    async postMessage(msg, sender) {
        // Send data to all devtools tabs
        let data = msg.data;
        if (!this.storage[data.dupKey]) {
            // Send to webhook only if not comes from JSON import -> avoid backend duplicate
            if (!data.import && this.webhookConfig.url)
                this.webhookQueue.push(data);

            // Sanitize data.data -> Datable blocks HTML tag search...
            data.data = sanitizeHtml(data.data);
            // Ensure to keep the state if devtools are close and remove duplicate rows
            this.storage[data.dupKey] = data;
            this.broadcast(data);
        }
    }

    sendNotification(id, title, msg) {
        extensionAPI.notifications.create(id, {
            type: "basic",
            iconUrl: "/icons/icon.png",
            title: title,
            message: msg
        });
    }

    updateBadge() {
        const setBadgeText = typeof extensionAPI.browserAction !== "undefined" ? extensionAPI.browserAction.setBadgeText : extensionAPI.action.setBadgeText; // Handling MV2 & MV3
        if (this.badge === 0) {
            setBadgeText({text: ""});
            return;
        }
        setBadgeText({text: this.badge.toString()});
    }
}

const main = async () => {
    // extensionAPI.storage.local.clear()
    init();
    initShortcuts();

    // Init webhook scudding
    setInterval(MessagesHandler.sendWebhook.bind(MessagesHandler), 1000);

    // extensionAPI.storage.local.get(null, data => console.log(data));
    extensionAPI.runtime.onConnect.addListener(port => MessagesHandler.connect(port))
    extensionAPI.runtime.onMessage.addListener(handleMessage);
    
    // Handle remove headers on firefox (because of chromium manifest v3, I need to use declarativeNetRequest / rules instead)
    if (typeof browser !== "undefined") {
        extensionAPI.webRequest.onHeadersReceived.addListener(handleRemoveHeaders, { urls: [ "http://*/*", "https://*/*" ] }, [ "blocking", "responseHeaders" ]);
    }

    // Handle extension auto-updates
    extensionAPI.runtime.onInstalled.addListener(handleUpdate);

    // Adding pwnfox support only on firefox
    if (typeof browser !== "undefined") {
        extensionAPI.tabs.onActivated.addListener(handleTabChange);
    }
}

main();
