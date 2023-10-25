// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

import {
    updateUIDomains
} from "./utils.js";


// Domains events
function handleAddDomain(event) {
    event.preventDefault();
    const domains = this.value.replaceAll(" ", "").split(",");
    window.allowedDomains = Array.from(new Set(window.allowedDomains.concat(domains))).filter(domain => domain !== "");; // Concat and remove duplicates
    extensionAPI.storage.local.set({ allowedDomains: window.allowedDomains });
    extensionAPI.runtime.sendMessage({ action: "updateDomains", data: window.allowedDomains });
    this.value = "";
    updateUIDomains(window.allowedDomains);
}

// Hooks events
function handleSelectHooks() {
    window.hooksData.selectedHook = this.value;
    extensionAPI.storage.local.set({ hooksData: window.hooksData });
    extensionAPI.runtime.sendMessage({ action: "updateConfig", data: window.hooksData.selectedHook });
}

// Buttons events
function handleRemoveAllDomain() {
    window.allowedDomains = [];
    extensionAPI.storage.local.set({ allowedDomains: window.allowedDomains });
    extensionAPI.runtime.sendMessage({ action: "updateDomains", data: window.allowedDomains });
    updateUIDomains(window.allowedDomains);
}

function handleSettingsNavigation() {
    extensionAPI.runtime.openOptionsPage();
}

export {
    // Domains
    handleAddDomain,
    // Hooks
    handleSelectHooks,
    // Buttons
    handleRemoveAllDomain,
    handleSettingsNavigation
}