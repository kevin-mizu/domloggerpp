// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

import {
    // Domains
    handleAddDomain,
    // Hooks
    handleSelectHooks,
    // Misc
    handleSettingsNavigation,
    handlePwnfoxSupport,
    handleRemoveHeaders,
    // Buttons
    handleRemoveAllDomain,
    handleAddCurrentDomain,
    handleAddCurrentETLD
} from "./handlers.js";

import {
    updateUIDomains,
    updateUIHooks,
    updateUIPwnfox,
    updateUIHeaders
} from "./utils.js";


const main = async () => {
    // Clear badge
    extensionAPI.runtime.sendMessage({ action: "clearBadge" });

    // Loading TLD list
    fetch("./js/allTLD.json").then(d => d.json()).then((d) => {
        window.allTLD = d;
    })

    // init
    window.colorsData = {
        textColor: "#C6C6CA",
        backgroundColor: "#292A2D"
    }
    extensionAPI.storage.local.get("colorsData", (data) => {
        if (data.colorsData) {
            window.colorsData = data.colorsData;
        }
        var root = document.documentElement;
        root.style.setProperty("--text-color", window.colorsData["textColor"]);
        root.style.setProperty("--background-color", window.colorsData["backgroundColor"]);
        document.body.style.opacity = "1";
    });

    window.allowedDomains = [];
    extensionAPI.storage.local.get("allowedDomains", (data) => {
        if (data.allowedDomains) {
            window.allowedDomains = data.allowedDomains;
        }
        updateUIDomains(window.allowedDomains);
    });

    window.hooksData = {
        selectedHook: 0,
        hooksSettings: []
    }
    extensionAPI.storage.local.get("hooksData", (data) => {
        if (data.hooksData) {
            window.hooksData = data.hooksData;
        }
        window.selectedHook =  window.hooksData.selectedHook;
        updateUIHooks(window.selectedHook, window.hooksData.hooksSettings);
    })

    window.pwnfoxSupport = false;
    if (typeof browser !== "undefined") {
        extensionAPI.storage.local.get("pwnfoxSupport", (data) => {
            if (data.pwnfoxSupport) {
                window.pwnfoxSupport = data.pwnfoxSupport;
            }
            updateUIPwnfox(window.pwnfoxSupport);
        })
        document.getElementById("pwnfoxDiv").style.display = "flex";
    }

    window.removeHeaders = false;
    extensionAPI.storage.local.get("removeHeaders", (data) => {
        if (data.removeHeaders) {
            window.removeHeaders = data.removeHeaders;
        }
        updateUIHeaders(window.removeHeaders);
    })

    // Events
    document.getElementById("domains").addEventListener("change", handleAddDomain);
    document.getElementById("hooks").addEventListener("change", handleSelectHooks);
    document.getElementById("pwnfoxSupport").addEventListener("change", handlePwnfoxSupport);
    document.getElementById("removeHeaders").addEventListener("change", handleRemoveHeaders);

    // Buttons
    document.getElementById("remove").addEventListener("click", handleRemoveAllDomain);
    document.getElementById("settings").addEventListener("click", handleSettingsNavigation);
    document.getElementById("addCurrentDomain").addEventListener("click", handleAddCurrentDomain);
    document.getElementById("addCurrentETLD").addEventListener("click", handleAddCurrentETLD);
}

window.addEventListener("DOMContentLoaded", main);
