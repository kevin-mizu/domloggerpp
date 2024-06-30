// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

import {
    updateUIDomains
} from "./utils.js";

function addDomain(domains) {
    window.allowedDomains = Array.from(new Set(window.allowedDomains.concat(domains))).filter(domain => domain !== "");
    extensionAPI.storage.local.set({ allowedDomains: window.allowedDomains });
    extensionAPI.runtime.sendMessage({ action: "updateDomains", data: window.allowedDomains });
    updateUIDomains(window.allowedDomains);
}

// Domains events
function handleAddDomain(event) {
    event.preventDefault();
    const domains = this.value.replaceAll(" ", "").split(",");
    addDomain(domains);
    this.value = "";
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

function handleAddCurrentDomain() {
    extensionAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const domain = new URL(tabs[0].url).hostname;
        addDomain([domain]);
    });
}

function handleSettingsNavigation() {
    extensionAPI.runtime.openOptionsPage();
}

function handlePwnfoxSupport() {
    window.pwnfoxSupport = this.checked;
    extensionAPI.storage.local.set({ pwnfoxSupport: window.pwnfoxSupport });
}

export {
    // Domains
    handleAddDomain,
    // Hooks
    handleSelectHooks,
    // Buttons
    handleRemoveAllDomain,
    handleSettingsNavigation,
    handleAddCurrentDomain,
    // Checkbox
    handlePwnfoxSupport
}