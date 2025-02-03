// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

import {
    save,
    remove,
    updateUIDomains,
    updateUIButtons,
    updateUITable,
    updateUIEditor,
    addHook,
    renameHook,
    errorMessage,
    checkHookConfig
} from "./utils.js";


// Sidebar events
function handleSidebarClick() {
    const navLinks = document.querySelectorAll("#sidebar-tabs a");
    
    navLinks.forEach((elem) => {
        if (elem !== this) {
            elem.classList.remove("active-tab");
            document.getElementById(elem.hash.substring(1)).style.display = "none";
            elem.querySelector("svg").classList.remove("text-color");
            elem.querySelector("svg").classList.add("background-color");
        } else {
            elem.classList.add("active-tab");
            document.getElementById(elem.hash.substring(1)).style.display = "block";
            elem.querySelector("svg").classList.remove("background-color");
            elem.querySelector("svg").classList.add("text-color");
        }
    })
}

// Remove Headers
function handleremoveHeaders() {
    extensionAPI.storage.local.set({ removeHeaders: window.removeHeaders });
    var value = this.getAttribute("data-data");
    if (value === "yes" && !window.removeHeaders) {
        window.removeHeaders = true;
        extensionAPI.storage.local.set({ removeHeaders: window.removeHeaders });
    } else if (value === "no" && window.removeHeaders) {
        window.removeHeaders = false;
        extensionAPI.storage.local.set({ removeHeaders: window.removeHeaders });
    }
    updateUIButtons("removeHeaders", window.removeHeaders);
}

// PwnFox
function handlePwnfoxSupport() {
    extensionAPI.storage.local.set({ pwnfoxSupport: window.pwnfoxSupport });
    var value = this.getAttribute("data-data");
    if (value === "yes" && !window.pwnfoxSupport) {
        window.pwnfoxSupport = true;
        extensionAPI.storage.local.set({ pwnfoxSupport: window.pwnfoxSupport });
    } else if (value === "no" && window.pwnfoxSupport) {
        window.pwnfoxSupport = false;
        extensionAPI.storage.local.set({ pwnfoxSupport: window.pwnfoxSupport });
    }
    updateUIButtons("pwnfox", window.pwnfoxSupport);
}

// Domains
function handleAddDomain(event) {
    event.preventDefault();
    const domains = this.value.replaceAll(" ", "").split(",");
    window.allowedDomains = Array.from(new Set(window.allowedDomains.concat(domains))).filter(domain => domain !== "");; // Concat and remove duplicates
    extensionAPI.storage.local.set({ allowedDomains: window.allowedDomains });
    this.value = "";
    updateUIDomains(window.allowedDomains);
}

// Webhook events
const ALLOWED_PROTOCOL = ["http:", "https:"];
function handleChangeWebhookURL() {
    var webhookURL = this.value;
    if (webhookURL) {
        try {
            if (!ALLOWED_PROTOCOL.includes(new URL(webhookURL).protocol)) {
                errorMessage(`Protocol must be one of: ${ALLOWED_PROTOCOL.join(", ")}!`, window.errorWebhook);
                return;
            }
            webhookURL = new URL(webhookURL).href;
        } catch {
            errorMessage("Invalid URL!", window.errorWebhook);
            return;
        }
    }
    extensionAPI.storage.local.set({ webhookURL: webhookURL });
    errorMessage("Webhook URL updated!", window.errorWebhook);
}

// Devtools
function handleDevtool(e) {
    var value = this.getAttribute("data-data");
    if (value === "yes" && !window.devtoolsPanel) {
        window.devtoolsPanel = true;
        extensionAPI.storage.local.set({ devtoolsPanel: window.devtoolsPanel });
    } else if (value === "no" && window.devtoolsPanel) {
        window.devtoolsPanel = false;
        extensionAPI.storage.local.set({ devtoolsPanel: window.devtoolsPanel });
    }
    updateUIButtons("devtools", window.devtoolsPanel);
}

// Table
function handleTableFormat(e) {
    updateUITable();
}

function handleVisibility(e) {
    window.tableConfig.colVisibility[this.innerText] = window.tableConfig.colVisibility[this.innerText] ? false : true;
    updateUITable();
}

function handleFontSize(e) {
    window.devtoolsFontSize = `${this.value}px`;
}

function handleTableReset(e) {
    extensionAPI.storage.local.get("tableConfig", (data) => {
        if (data.tableConfig) {
            window.tableConfig = data.tableConfig;
        }
        updateUITable();
    });

    extensionAPI.storage.local.get("devtoolsFontSize", (data) => {
        if (data.devtoolsFontSize) {
            window.devtoolsFontSize = data.devtoolsFontSize;
        }
        document.getElementById("devtools-font-size").value = window.devtoolsFontSize.replaceAll("px", "");
    });
}

function handleTableDefault(e) {
    window.tableConfig = {
        colIds: [ "dupKey", "type", "alert", "hook", "date", "href", "frame", "sink", "data", "trace", "debug" ],
        colVisibility: {
            "dupKey": false, "type": false, "alert": true, "hook": false, "date": true, "href": true, "frame": true, "sink": true, "data": true, "trace": true, "debug": true
        },
        colOrder: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
    }
    window.devtoolsFontSize = "16px";
    document.getElementById("devtools-font-size").value = window.devtoolsFontSize.replaceAll("px", "");
    updateUITable();
}

function handleTableSave(e) {
    window.tableConfig.colOrder = window.table.colReorder.order();
    extensionAPI.storage.local.set({ tableConfig: window.tableConfig });
    extensionAPI.storage.local.set({ devtoolsFontSize: window.devtoolsFontSize });
    errorMessage("Table config saved!", window.errorTable);
    updateUITable();
}

// Misc events
function handleTabEditor(e) {
    if (e.key === "Tab") {
        e.preventDefault();

        const start = this.selectionStart;
        const end = this.selectionEnd;

        this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 1;
    }
}

// Toolbar events
function handleSelect() {
    window.selectedHook = this.value;
    updateUIEditor(window.selectedHook);
}

function handleAdd() {
    window.modalButton.innerText = "Create";
    window.modalAction.value   = "add";
    window.modal.style.display = "block";
    window.hookName.focus();
}

function handleRename() {
    if (window.selectedHook == 0) {
        errorMessage("Can't rename DEFAULT settings!", window.errorConfig);
        return;
    }
    window.hookName.value = window.hooksData.hooksSettings[window.selectedHook].name;
    window.modalButton.innerText = "Rename";
    window.modalAction.value   = "rename";
    window.modal.style.display = "block";
    window.hookName.focus();
}

function handleSave() {
    save(window.selectedHook, window.editor.getValue());
}

function handleRemove() {
    remove(window.selectedHook);
}

function handleImportClick() {
    document.getElementById("importFile").click();
}

function handleImport(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const hookContent = checkHookConfig(e.target.result);
        if (hookContent) {
            addHook({
                "name": file.name.split(".")[0],
                "content": hookContent
            })
        }
    }
    reader.readAsText(file);
}

// Modal events
function handleModalCloseClick() {
    window.hookName.value = "";
    window.modalAction.value = "";
    window.modal.style.display = "none";
}

function handleModalClose(event) {
    if (event.target === modal) {
        window.hookName.value = "";
        window.modalAction.value = "";
        window.modal.style.display = "none";
    }
}

function handleModalSubmition() {
    if (window.hookName.value && window.modalAction.value === "add") {
        addHook({
            "name": window.hookName.value,
            "content": {
                hooks: {},
                config: {},
                removeHeaders: [
                    "content-security-policy",
                    "x-frame-options"
                ]
            }
        });
    }

    if (window.hookName.value && window.modalAction.value === "rename") {
        renameHook(window.selectedHook, window.hookName.value);
    }

    window.hookName.value = "";
    window.modalAction.value = "";
    window.modal.style.display = "none";
}

// Colors event
function setColors(textColor, backgroundColor) {
    var ifr = document.getElementById("preview-iframe").contentDocument.documentElement;
    ifr.style.setProperty("--text-color", textColor);
    ifr.style.setProperty("--background-color", backgroundColor);

    document.getElementById("text-color").value = textColor;
    document.getElementById("background-color").value = backgroundColor;
}

function handleColorChange() {
    var ifr = document.getElementById("preview-iframe").contentDocument.documentElement;
    if (this.name === "text-color") {
        ifr.style.setProperty("--text-color", this.value);
    } else if (this.name === "background-color") {
        ifr.style.setProperty("--background-color", this.value);
    }
}

function handleColorReset() {
    setColors(window.colorsData["textColor"], window.colorsData["backgroundColor"]);
}

function handleColorDefault() {
    setColors("#C6C6CA", "#292A2D");
}

function handleColorConfirm() {
    var textColor = document.getElementById("text-color").value;
    var backgroundColor = document.getElementById("background-color").value;

    extensionAPI.storage.local.set({ colorsData: {
        textColor: textColor,
        backgroundColor: backgroundColor
    }});

    var root = document.documentElement;
    root.style.setProperty("--text-color", textColor);
    root.style.setProperty("--background-color", backgroundColor);
}

export {
    // Sidebar
    handleSidebarClick,
    // Remove Headers
    handleremoveHeaders,
    // PwnFox
    handlePwnfoxSupport,
    // Domains
    handleAddDomain,
    // Webhook
    handleChangeWebhookURL,
    // Devtools
    handleDevtool,
    // Table
    handleTableFormat,
    handleVisibility,
    handleFontSize,
    handleTableReset,
    handleTableDefault,
    handleTableSave,
    // Editor
    handleSelect,
    handleAdd,
    handleRename,
    handleSave,
    handleRemove,
    handleImportClick,
    handleImport,
    handleTabEditor,
    // Modal
    handleModalCloseClick,
    handleModalClose,
    handleModalSubmition,
    // Colors
    handleColorChange,
    handleColorReset,
    handleColorDefault,
    handleColorConfirm
}