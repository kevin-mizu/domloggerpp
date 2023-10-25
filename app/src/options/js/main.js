// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

import {
    updateUIDomains,
    updateUIWebhook,
    updateUIDevtools,
    updateUIColors,
    updateUIEditorSelect,
    updateUIEditor
} from "./utils.js";

import {
    // Sidebar
    handleSidebarClick,
    // Domains
    handleAddDomain,
    // Webhook
    handleChangeWebhookURL,
    // Devtools
    handleDevtool,
    // Editor
    handleAdd,
    handleSave,
    handleRemove,
    handleRename,
    handleImportClick,
    handleImport,
    handleSelect,
    handleTabEditor,
    // Modal
    handleModalCloseClick,
    handleModalClose,
    handleModalSubmition,
    // Color
    handleColorChange,
    handleColorReset,
    handleColorDefault,
    handleColorConfirm
} from "./handlers.js";


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
        updateUIColors(window.colorsData);
    });
}

const initSidebar = () => {
    const navLinks = document.querySelectorAll("#sidebar-tabs a");
    const navLinksHref = [...navLinks].map(link => link.href);
    
    if (navLinksHref.includes(location.href)) {
        const index = navLinksHref.indexOf(location.href);
        navLinks[index].classList.add("active-tab");
        document.getElementById(navLinks[0].hash.substring(1)).style.display = "none";
        document.getElementById(navLinks[index].hash.substring(1)).style.display = "block";
        navLinks[index].querySelector("svg").classList.remove("background-color");
        navLinks[index].querySelector("svg").classList.add("text-color");
    } else {
        navLinks[0].classList.add("active-tab");
        document.getElementById(navLinks[0].hash.substring(1)).style.display = "block";
        navLinks[0].querySelector("svg").classList.remove("background-color");
        navLinks[0].querySelector("svg").classList.add("text-color");
    }

    navLinks.forEach(link => {
        link.addEventListener("click", handleSidebarClick);
    });
}

const initStorageVariables = () => {
    extensionAPI.storage.local.get("allowedDomains", (data) => {
        if (data.allowedDomains) {
            window.allowedDomains = data.allowedDomains;
        } else {
            window.allowedDomains = [];
        }
        updateUIDomains(window.allowedDomains);
    });

    extensionAPI.storage.local.get("webhookURL", (data) => {
        if (data.webhookURL) {
            window.webhookURL = data.webhookURL;
        } else {
            window.webhookURL = "";
        }
        updateUIWebhook(window.webhookURL);
    });

    extensionAPI.storage.local.get("devtoolsPanel", (data) => {
        if (typeof data.devtoolsPanel === "boolean") {
            window.devtoolsPanel = data.devtoolsPanel;
        } else {
            window.devtoolsPanel = true;
        }
        updateUIDevtools(window.devtoolsPanel);
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
        window.selectedHook = window.hooksData.selectedHook;
        updateUIEditorSelect(window.selectedHook, window.hooksData.hooksSettings);
        updateUIEditor(window.selectedHook);
    })

    // Handle popup update
    extensionAPI.runtime.onMessage.addListener((msg, sender) => {
        switch (msg.action) {
            case "updateDomains":
                window.allowedDomains = msg.data;
                updateUIDomains(window.allowedDomains);
                break;
            case "updateConfig":
                window.hooksData.selectedHook = msg.data;
                break;
        }
    });
}

const main = async () => {
    // Colors
    initColors();

    // Sidebar
    initSidebar();

    // Global variables
    initStorageVariables();
    window.editor = document.getElementById("editor");
    window.modal = document.getElementById("modal");
    window.modalAction = document.getElementById("modalAction");
    window.modalButton = document.getElementById("modalButton");
    window.hookName = document.getElementById("hookName");
    window.errorWebhook = document.getElementById("errorWebhook");
    window.errorConfig = document.getElementById("errorConfig");

    // Domains
    document.getElementById("addDomains").addEventListener("change", handleAddDomain);

    // Webhook
    document.getElementById("webhookURL").addEventListener("change", handleChangeWebhookURL);

    // Devtools
    document.getElementsByClassName("devtools-button")[0].addEventListener("click", handleDevtool);
    document.getElementsByClassName("devtools-button")[1].addEventListener("click", handleDevtool);

    // Editor
    document.getElementById("editor").addEventListener("keydown", handleTabEditor);
    document.getElementById("hook").addEventListener("change", handleSelect);
    document.getElementById("add").addEventListener("click", handleAdd);
    document.getElementById("rename").addEventListener("click", handleRename);
    document.getElementById("save").addEventListener("click", handleSave);
    document.getElementById("remove").addEventListener("click", handleRemove);
    document.getElementById("import").addEventListener("click", handleImportClick);
    document.getElementById("importFile").addEventListener("change", handleImport);

    // Modal
    document.getElementsByClassName("close")[0].addEventListener("click", handleModalCloseClick);
    window.addEventListener("click", handleModalClose);
    document.getElementById("modalButton").addEventListener("click", handleModalSubmition);

    // Colors
    document.getElementById("text-color").addEventListener("change", handleColorChange);
    document.getElementById("background-color").addEventListener("change", handleColorChange);
    document.getElementById("color-reset").addEventListener("click", handleColorReset);
    document.getElementById("color-default").addEventListener("click", handleColorDefault);
    document.getElementById("color-confirm").addEventListener("click", handleColorConfirm);
    if (top !== window)
        document.getElementById("preview-iframe").style.display = "none";
}

window.addEventListener("DOMContentLoaded", main);
