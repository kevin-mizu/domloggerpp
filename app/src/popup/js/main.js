// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

import {
    // Domains
    handleAddDomain,
    // Hooks
    handleSelectHooks,
    // Misc
    handleSettingsNavigation,
    // Buttons
    handleRemoveAllDomain,
    handleAddCurrentDomain
} from "./handlers.js";

import {
    updateUIDomains,
    updateUIHooks
} from "./utils.js";


const initColors = () => {
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
}

const main = async () => {
    // Color
    initColors();

    // Clear badge
    extensionAPI.runtime.sendMessage({ action: "clearBadge" });

    // init
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

    // Events
    document.getElementById("domains").addEventListener("change", handleAddDomain);
    document.getElementById("hooks").addEventListener("change", handleSelectHooks);

    // Buttons
    document.getElementById("remove").addEventListener("click", handleRemoveAllDomain);
    document.getElementById("settings").addEventListener("click", handleSettingsNavigation);
    document.getElementById("addCurrentDomain").addEventListener("click", handleAddCurrentDomain);
}

window.addEventListener("DOMContentLoaded", main);
