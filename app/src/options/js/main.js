// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

import {
    updateUIDomains,
    updateUIWebhook,
    updateUIButtons,
    updateUITable,
    updateUIColors,
    updateUIEditorSelect,
    updateUIEditor
} from "./utils.js";

import {
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


const initTable = () => {
    window.table = $('#tablePreview').DataTable({
        order: [[window.tableConfig.colIds.indexOf("date"), "desc"]],
        colReorder: true,
        responsive: true,
        paging: true,
        scrollCollapse: true,
        scrollY: "600px",
        data: [
            ["91b260af6b0490aac6a5ae8189e682b7a12d45a0df8ff13aebd752801015ff25", "XSS", "", "attribute", "05/12/2024, 07:20:08 PM", "https://mizu.re/", "top", "get:body.dataset", `{}<br><u>View more</u>`, "<u>Show</u>", "<u>Goto</u>"],
            ["2810e6ef303ef8f1338cc909f2c6d29c63dcf4fa560ca167a3d72efe07c2d5a5", "XSS", ` <svg width="20px" viewBox="0 0 512 512" class="text-color mgr-10"><use xlink:href="./img/bell-solid.svg#bell-icon"></use></svg>`, "attribute", "05/12/2024, 07:20:08 PM", "https://mizu.re/", "top", "set:span.innerHTML", `2024<br><u>View more</u>`, "<u>Show</u>", "<u>Goto</u>"],
            ["977184c96c985b95ec6dcf36b4dc8f06961b287a6761265812ef7950fecabef9", "XSS", "", "event", "05/12/2024, 07:20:08 PM", "https://mizu.re/", "top", "onmessage", `function() { [native code] }<br><u>View more</u>`, "<u>Show</u>", "<u>Goto</u>"]
        ],
        search: {
            smart: false
        }
    });
}

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
    window.allowedDomains = [];
    extensionAPI.storage.local.get("allowedDomains", (data) => {
        if (data.allowedDomains) {
            window.allowedDomains = data.allowedDomains;
        }
        updateUIDomains(window.allowedDomains);
    });

    window.webhookURL = "";
    extensionAPI.storage.local.get("webhookURL", (data) => {
        if (data.webhookURL) {
            window.webhookURL = data.webhookURL;
        }
        updateUIWebhook(window.webhookURL);
    });

    window.devtoolsPanel = true;
    extensionAPI.storage.local.get("devtoolsPanel", (data) => {
        if (typeof data.devtoolsPanel === "boolean") {
            window.devtoolsPanel = data.devtoolsPanel;
        }
        updateUIButtons("devtools", window.devtoolsPanel);
    });

    window.removeHeaders = false;
    extensionAPI.storage.local.get("removeHeaders", (data) => {
        if (typeof data.removeHeaders === "boolean") {
            window.removeHeaders = data.removeHeaders;
        }
        updateUIButtons("removeHeaders", window.removeHeaders);
    })
    document.getElementById("removeHeaders-tab").style.display = "block";

    window.pwnfoxSupport = false;
    if (typeof browser !== "undefined") {
        extensionAPI.storage.local.get("pwnfoxSupport", (data) => {
            if (typeof data.pwnfoxSupport === "boolean") {
                window.pwnfoxSupport = data.pwnfoxSupport;
            }
            updateUIButtons("pwnfox", window.pwnfoxSupport);
        })
        document.getElementById("pwnfox-tab").style.display = "block";
    }

    window.devtoolsFontSize = "18px";
    if (typeof browser !== "undefined") {
        extensionAPI.storage.local.get("devtoolsFontSize", (data) => {
            if (typeof data.devtoolsFontSize === "string") {
                window.devtoolsFontSize = data.devtoolsFontSize;
            }
            document.getElementById("devtools-font-size").value = window.devtoolsFontSize.replaceAll("px", "");
        })
    }

    window.tableConfig = {
        colIds: [ "dupKey", "type", "alert", "hook", "date", "href", "frame", "sink", "data", "trace", "debug" ],
        colVisibility: {
            "dupKey": false, "type": false, "alert": true, "hook": false, "date": true, "href": true, "frame": true, "sink": true, "data": true, "trace": true, "debug": true
        },
        colOrder: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
    }
    extensionAPI.storage.local.get("tableConfig", (data) => {
        if (data.tableConfig) {
            window.tableConfig = data.tableConfig;
        }
        updateUITable();
    });

    window.hooksData = {
        selectedHook: 0,
        hooksSettings: []
    }
    extensionAPI.storage.local.get("hooksData", (data) => {
        if (data.hooksData) {
            window.hooksData = data.hooksData;
        }
        window.selectedHook = window.hooksData.selectedHook;
        updateUIEditorSelect(window.selectedHook, window.hooksData.hooksSettings);
        updateUIEditor(window.selectedHook);
    })

    // Handle storage updates
    extensionAPI.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local") {
            for (const [key, values] of Object.entries(changes)) {
                switch (key) {
                    case "allowedDomains":
                        window.allowedDomains = values.newValue;
                        updateUIDomains(window.allowedDomains);
                        break;
                    case "hooksData":
                        window.hooksData = values.newValue;
                        window.hooksData.selectedHook = values.newValue.selectedHook;
                        break;
                    case "pwnfoxSupport":
                        window.pwnfoxSupport = values.newValue;
                        updateUIButtons("pwnfox", window.pwnfoxSupport);
                        break;
                    case "removeHeaders":
                        window.removeHeaders = values.newValue;
                        updateUIButtons("removeHeaders", window.removeHeaders);
                        break;
                }
            }
        }
    })
}

const initEditorShortcuts = () => {
    document.addEventListener("keydown", function(event) {
        // [ALT]+Arrow Up | previous config
        if (event.altKey && (event.key === "ArrowUp")) {
            event.preventDefault();
            if (window.selectedHook < window.hooksData.hooksSettings.length-1) {
                window.selectedHook = parseInt(window.selectedHook)+1;
                updateUIEditorSelect(window.selectedHook, window.hooksData.hooksSettings);
                updateUIEditor(window.selectedHook);
            }
        }
        // [ALT]+Arrow Down | previous config
        if (event.altKey && (event.key === "ArrowDown")) {
            event.preventDefault();
            if (window.selectedHook > 0) {
                window.selectedHook = parseInt(window.selectedHook)-1;
                updateUIEditorSelect(window.selectedHook, window.hooksData.hooksSettings);
                updateUIEditor(window.selectedHook);
            }
        }
        // [ALT]+A | add a config
        if (event.altKey && (event.key === "a" || event.key === "A")) {
            event.preventDefault();
            handleAdd();
        }
        // [ALT]+R | rename a config
        if (event.altKey && (event.key === "r" || event.key === "R")) {
            event.preventDefault();
            handleRename();
        }
        // [CTRL]+S | save a config
        if (event.ctrlKey && (event.key === "s" || event.key === "S")) {
            event.preventDefault();
            handleSave();
        }
        // [ALT]+Suppr | remove a config
        if (event.altKey && (event.key === "Backspace" || event.key === "Delete")) {
            event.preventDefault();
            handleRemove();
        }
        // [ALT]+W | word wrap
        if (event.altKey && (event.key === "z" || event.key === "Z")) {
            event.preventDefault();
            window.editor.lineWrapping = !window.editor.lineWrapping;
            window.editor.setOption("lineWrapping", window.editor.lineWrapping);
        }
        // [ENTER] | validate in create / edit modal
        if (window.modalAction.value && event.key === "Enter") {
            handleModalSubmition();
        }
        // [ESCAPE] | leave modal context
        if (event.key === "Escape") {
            event.preventDefault();
            handleModalCloseClick();
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
    window.editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        mode: "application/json",
        theme: "dracula",
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true
    });
    window.editor.lineWrapping = false;
    window.modal = document.getElementById("modal");
    window.modalTitle = document.getElementById("modalTitle");
    window.modalAction = document.getElementById("modalAction");
    window.modalButton = document.getElementById("modalButton");
    window.hookName = document.getElementById("hookName");
    window.errorWebhook = document.getElementById("errorWebhook");
    window.errorConfig = document.getElementById("errorConfig");
    window.errorTable = document.getElementById("errorTable");

    // Remove Headers
    document.getElementsByClassName("removeHeaders-button")[0].addEventListener("click", handleremoveHeaders);
    document.getElementsByClassName("removeHeaders-button")[1].addEventListener("click", handleremoveHeaders);


    // PwnFox
    document.getElementsByClassName("pwnfox-button")[0].addEventListener("click", handlePwnfoxSupport);
    document.getElementsByClassName("pwnfox-button")[1].addEventListener("click", handlePwnfoxSupport);

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
    initEditorShortcuts();

    // Modal
    document.getElementsByClassName("close")[0].addEventListener("click", handleModalCloseClick);
    window.addEventListener("click", handleModalClose);
    document.getElementById("modalButton").addEventListener("click", handleModalSubmition);

    // Table
    document.getElementById("tablink-customize").addEventListener("click", handleTableFormat);
    initTable();
    for (const node of document.querySelectorAll("#colList > span")) {
        node.addEventListener("click", handleVisibility);
    }
    document.getElementById("devtools-font-size").addEventListener("change", handleFontSize);
    document.getElementById("table-reset").addEventListener("click", handleTableReset);
    document.getElementById("table-default").addEventListener("click", handleTableDefault);
    document.getElementById("table-save").addEventListener("click", handleTableSave);

    // Colors
    document.getElementById("text-color").addEventListener("change", handleColorChange);
    document.getElementById("background-color").addEventListener("change", handleColorChange);
    document.getElementById("color-reset").addEventListener("click", handleColorReset);
    document.getElementById("color-default").addEventListener("click", handleColorDefault);
    document.getElementById("color-confirm").addEventListener("click", handleColorConfirm);
    if (top !== window)
        document.getElementById("preview-iframe").style.display = "none";
}

const resize = () => {
    if (window.table)
        window.table.columns.adjust().draw();
}


window.addEventListener("DOMContentLoaded", main);
window.addEventListener("resize", resize);
