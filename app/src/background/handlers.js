// Handle incoming messages
const handleMessage = (msg, sender) => {
    if (msg.action) {
        handleAction(msg, sender);
        return;
    }
    MessagesHandler.postMessage(msg, sender);
}

// Handle pwnfox support
const handleTabChange = async (activeInfo) => {
    let tabId = activeInfo.tabId;
    const { cookieStoreId } = await browser.tabs.get(tabId);
    if (cookieStoreId === "firefox-default") {
        extensionAPI.storage.local.set({ activeTab: "firefox-default" })
    } else {
        const identity = await browser.contextualIdentities.get(cookieStoreId)
        extensionAPI.storage.local.set({ activeTab: identity.name })
    }
}

// Handle extension updates
const handleUpdate = (details) => {
    if (details.reason === extensionAPI.runtime.OnInstalledReason.UPDATE) {
        const previousVersion = details.previousVersion;
        const currentVersion = extensionAPI.runtime.getManifest().version;
        if (previousVersion !== currentVersion) {
            MessagesHandler.sendNotification("extensionUpdate", "Extension Updated", `DOMLogger++ has been updated to version ${currentVersion}!\nClick here to see changelog :D`);
        }
    }
}

// Handle remove response headers (firefox only)
const handleRemoveHeaders = async (response) => {
    const data = MessagesHandler.browserStorage;
    if (data.removeHeaders !== true) {
        return;
    }

    // Same origin check as the content script
    if (!data.pwnfoxSupport || !data.activeTab.startsWith("PwnFox-")) {
        var validDomain = false;
        if (data.allowedDomains) {
            for (let d of data.allowedDomains) {
                if (response.url.match(d)) {
                    validDomain = true;
                }
            }
        }

        if (!validDomain) {
            return;
        }
    }

    // Removing response headers
    const { responseHeaders: origHeaders } = response
    const headers = data.hooksData.hooksSettings[data.hooksData.selectedHook].content.removeHeaders || [];
    const newHeaders = origHeaders.filter(({ name }) => {
        return !headers.includes(name.toLowerCase());
    })
    return { responseHeaders: newHeaders };
}

// Handle specific actions from postMessages
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
    }
}
