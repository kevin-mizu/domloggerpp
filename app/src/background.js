// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

MessagesHandler = new class {
    constructor() {
        this.ports = {};
        this.storage = {}; // I'm not using extensionAPI.storage to avoid "Promise" race condition in case of multiple postMessage in a small timing.
        this.webhookURL = "";
        this.devtoolsPanel = true;
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

    async getDupKey(data) {
        // Need to see all sink(x), sink(y)... In order to not miss something important
        var dupKey = await sha256(`${data.debug}||${data.data}`)
        return dupKey;
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

    webhook(data, sender) {
        if (this.webhookURL && ["http:", "https:"].includes((new URL(this.webhookURL).protocol))) {
            fetch(this.webhookURL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).catch(() => {}); // Add a logging mechanism
        }
    }

    async postMessage(msg, sender) {
        // Ensure to keep the state if devtools are close and remove duplicate rows
        let data = msg.data;
        let dupKey = await this.getDupKey(data);
        data.dupKey = dupKey;

        // Send data to all devtools tabs
        if (!this.storage[dupKey]) {
            // Send to webhook only if not comes from JSON import -> avoid backend duplicate
            if (!data.import)
                this.webhook(data, sender);

            // Sanitize data.data -> Datable blocks HTML tag search...
            data.data = sanitizeHtml(data.data);
            this.storage[dupKey] = data;
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

// Utils function
const sanitizeHtml = (str) => str.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;").replace(/"/g, "&quot;");

const sha256 = async (d) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(d);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hash));
    
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
    return hashHex;
}

const handleAction = (msg, sender) => {
    switch (msg.action) {
        case "clearBadge":
            MessagesHandler.badge = 0;
            MessagesHandler.updateBadge();
            break;
        case "openURL":
            extensionAPI.tabs.create({ url: msg.data, openerTabId: msg.tabId }); // Set opener link in order to keep session context in case the new tab get closed
            break;
        case "debugSink":
            const listener = (tabId, changeInfo, tab) => {
                if (tabId === msg.tabId && changeInfo.status === "complete") {
                    extensionAPI.tabs.onUpdated.removeListener(listener); 

                    // 3. Set the debug canary
                    extensionAPI.storage.local.set({ debugCanary: {
                        href: msg.url,
                        canary: msg.canary
                    }}, () => {
                        // 4. Reload (true) without the cache to find the sink
                        extensionAPI.tabs.reload(msg.tabId, { bypassCache: true });
                    })
                }
            };

            // 1. Set up listener for tab update completion
            if (msg.canary)
                extensionAPI.tabs.onUpdated.addListener(listener);
            // 2. Go to the desired page
            extensionAPI.tabs.update(msg.tabId, { url: msg.url });
            break;
        case "removeRow":
            delete MessagesHandler.storage[msg.data];
            MessagesHandler.broadcast(msg);
            break;
        case "openSettings":
            extensionAPI.runtime.openOptionsPage();
            break;
        case "clearStorage":
            MessagesHandler.storage = {};
            MessagesHandler.broadcast(msg);
            break;
        case "webhookURL":
            MessagesHandler.webhookURL = msg.data;
            break;
        case "devtoolsPanel":
            MessagesHandler.devtoolsPanel = msg.data;
            break;
        case "updateTableConfig":
        case "updateConfig":
        case "updateColors":
            MessagesHandler.broadcast(msg);
            break;
    }
}

const handleMessage = (msg, sender) => {
    if (msg.action) {
        handleAction(msg, sender);
        return;
    }
    MessagesHandler.postMessage(msg, sender);
}

// For pwnfox support
const handleTabChange = async (activeInfo) => {
    let tabId = activeInfo.tabId;
    const { cookieStoreId } = await browser.tabs.get(tabId)
    if (cookieStoreId === "firefox-default"){
        extensionAPI.storage.local.set({ activeTab: "firefox-default" })
    } else {
        const identity = await browser.contextualIdentities.get(cookieStoreId)
        extensionAPI.storage.local.set({ activeTab: identity.name })
    }
}

const init = () => {
    // Create DEFAULT hook if none exist
    extensionAPI.storage.local.get("hooksData", (data) => {
        if (data.hooksData === undefined) {
            extensionAPI.storage.local.set({ hooksData: {
                selectedHook: 0,
                hooksSettings: [{
                    name: "DEFAULT",
                    content: {
                        "hooks": {
                            "XSS": { "attribute": [ "set:Element.prototype.innerHTML" ] }
                        },
                        "config": {}
                    }
                }]
            }});
        }
    });
    // Set default colors settings
    extensionAPI.storage.local.get("colorsData", (data) => {
        if (data.colorsData === undefined) {
            extensionAPI.storage.local.set({ colorsData: {
                textColor: "#C6C6CA",
                backgroundColor: "#292A2D"
            }});
        }
    });
    // Set default tableConfig settings
    extensionAPI.storage.local.get("tableConfig", (data) => {
        if (data.tableConfig === undefined) {
            extensionAPI.storage.local.set({ tableConfig: {
                colIds: [ "dupKey", "type", "alert", "hook", "date", "href", "frame", "sink", "data", "trace", "debug" ],
                colVisibility: {
                    "dupKey": false, "type": false, "alert": true, "hook": false, "date": true, "href": true, "frame": true, "sink": true, "data": true, "trace": true, "debug": true
                },
                colOrder: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
            }});
        }
    });

    // Set webhookURL attribute after browser restart
    extensionAPI.storage.local.get("webhookURL", (data) => {
        if (data.webhookURL) {
            MessagesHandler.webhookURL = data.webhookURL;
        } else {
            MessagesHandler.webhookURL = "";
        }
    });
    // Set devtoolsPanel attribute after browser restart
    extensionAPI.storage.local.get("devtoolsPanel", (data) => {
        if (typeof data.devtoolsPanel === "boolean") {
            MessagesHandler.devtoolsPanel = data.devtoolsPanel;
        } else {
            MessagesHandler.devtoolsPanel = true;
        }
    });
}

const main = async () => {
    // extensionAPI.storage.local.clear()
    init();
    // extensionAPI.storage.local.get(null, data => console.log(data));
    extensionAPI.runtime.onConnect.addListener(port => MessagesHandler.connect(port))
    extensionAPI.runtime.onMessage.addListener(handleMessage);
    // Adding pwnfox support only on firefox
    if (typeof browser !== "undefined") {
        extensionAPI.tabs.onActivated.addListener(handleTabChange);
    }
}

main();
