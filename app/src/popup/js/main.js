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
    handleRemoveAllDomain
} from "./handlers.js";

import {
    updateUIDomains,
    updateUIHooks
} from "./utils.js";


const initColors = () => {
    extensionAPI.storage.local.get("colorsData", (data) => {
        if (data.colorsData) {
            window.colorsData = data.colorsData;
        } else {
            window.colorsData = {
                textColor: "#C6C6CA",
                backgroundColor: "#292A2D"
            }
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
    extensionAPI.storage.local.get("allowedDomains", (data) => {
        if (data.allowedDomains) {
            window.allowedDomains = data.allowedDomains;
        } else {
            window.allowedDomains = [];
        }
        updateUIDomains(window.allowedDomains);
    });

    extensionAPI.storage.local.get("hooksData", (data) => {
        if (data.hooksData) {
            window.hooksData = data.hooksData;
        } else {
            window.hooksData = {
                selectedHook: 0,
                hooksSettings: []
            }
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
}

window.addEventListener("DOMContentLoaded", main);
