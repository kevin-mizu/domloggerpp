// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

const handleMessage = (event) => {
    if (event.data.ext == "domlogger++") {
        extensionAPI.runtime.sendMessage({"data": event.data});
    }
}

const main = async () => {
    extensionAPI.storage.local.get(null, (data) => {
        let debugCanary;
        let hookSettings;

        if(!data.pwnfoxSupport || !data.activeTab.startsWith("PwnFox-")) {
            // Checking if current domain is allowed
        var validDomain = false;
        if (data.allowedDomains) {
            for (let d of data.allowedDomains) {
                if (location.host.match(d)) {
                    validDomain = true;
                }
            }
        }

        if (!validDomain)
            return;
        }

        

        // Page loaded from debug goto
        if (data.debugCanary?.href === location.href) {
            debugCanary = data.debugCanary?.canary;
            chrome.storage.local.remove(["debugCanary"]);
        }

        // Hooking settings
        if (data.hooksData) {
            hookSettings = JSON.stringify(data.hooksData.hooksSettings[data.hooksData.selectedHook].content)
        }

        let script = document.createElement("script");
        script.src = extensionAPI.runtime.getURL(`src/bundle.js?hookSettings=${encodeURIComponent(btoa(hookSettings))}&debugCanary=${encodeURIComponent(debugCanary)}`);

        (document.head || document.documentElement).appendChild(script);
        script.onload = () => {
            script.parentNode.removeChild(script);
        };
    });

    // Setup DOM -> Background script connection
    window.addEventListener("message", handleMessage);
}

main();
