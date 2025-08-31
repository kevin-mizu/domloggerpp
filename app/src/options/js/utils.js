// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

const sanitizeHtml = (str) => {
    if (!str?.toString) {
        return str;
    }

    return str.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;").replace(/"/g, "&quot;");
}

const JSONColor = (config) => {
    // config = config.replace(/({|})/g, `<span style="color:red">$1</span>`)
    return config;
}

const updateUIEditorSelect = (index, hooksSettings) => {
    const hooksList = document.getElementById("hook");
    hooksList.innerHTML     = `${hooksSettings.map((c, i) => `<option value="${i}">${sanitizeHtml(c.name)}</option>`).join("")}`;
    hooksList.selectedIndex = index;
    if (hooksSettings.length) {
        let config = JSON.stringify(hooksSettings[index].content, null, 2);
        config = JSONColor(config);
        window.editor.setValue(config);
    }
    window.editor.setOption("readOnly", (window.hooksData.hooksSettings.length == 0 || index == 1));
}

const updateEvent = () => {
    let rows = document.querySelectorAll(".remove-one");
    for (const el of rows) {
        el.onclick = function() {
            window.allowedDomains = window.allowedDomains.filter(d => d !== this.dataset.domain);
            extensionAPI.storage.local.set({ allowedDomains: window.allowedDomains });
            updateUIDomains(window.allowedDomains);
        }
    }
}

const updateUIDomains = (domains) => {
    const allowedDomains = document.getElementById("allowedDomains");
    if (domains.length !== 0) {
        allowedDomains.innerHTML = `${domains.map(d => `<p>
            <span class="domain-name">${sanitizeHtml(d)}</span>
            <span data-domain="${sanitizeHtml(d)}" class="remove-one">&times;</span>
        </p>`).join("")}`;
    } else {
        allowedDomains.innerHTML = `<p>&nbsp;</p>`;
    }
    updateEvent();
}

const updateUIWebhook = (webhookURL) => {
    document.getElementById("webhookURL").value = webhookURL;
}

const updateUIButtons = (target, value) => {
    if (value) {
        document.getElementsByClassName(`${target}-button`)[0].style["background-color"] = "var(--text-color)"
        document.getElementsByClassName(`${target}-button`)[1].style["background-color"] = "var(--background-color)"
        document.getElementsByClassName(`${target}-button`)[0].style["color"] = "var(--background-color)"
        document.getElementsByClassName(`${target}-button`)[1].style["color"] = "var(--text-color)"
    } else {
        document.getElementsByClassName(`${target}-button`)[0].style["background-color"] = "var(--background-color)"
        document.getElementsByClassName(`${target}-button`)[1].style["background-color"] = "var(--text-color)"
        document.getElementsByClassName(`${target}-button`)[0].style["color"] = "var(--text-color)"
        document.getElementsByClassName(`${target}-button`)[1].style["color"] = "var(--background-color)"
    }
}

const updateUITable = () => {
    if (!window.table)
        return;

    // When using window.table.colReorder.order to update order, it uses the current col order as a reference
    var updateOrder  = [];
    var currentOrder = window.table.colReorder.order();
    for (const c of window.tableConfig.colOrder) {
        updateOrder.push(currentOrder.indexOf(c));
    }
    window.table.colReorder.order(updateOrder);

    for (const node of document.querySelectorAll("#colList > span")) {
        var colName  = node.innerText;
        var colIndex = window.tableConfig.colOrder.indexOf(window.tableConfig.colIds.indexOf(colName));
        var colVisibility = window.tableConfig.colVisibility[colName];
        node.classList.toggle("table-active", colVisibility);

        if (colVisibility !== window.table.column(colIndex).visible()) {
            window.table.column(colIndex).visible(colVisibility);
        }
    }
    window.table.columns.adjust().draw();
}

const updateUIEditor = (index) => {
    window.editor.setValue(window.hooksData.hooksSettings.length
      ? JSON.stringify(window.hooksData.hooksSettings[index].content, null, 2)
      : ""
    );
    window.editor.setOption("readOnly", (window.hooksData.hooksSettings.length == 0 || index == 1));
};

const updateUIColors = (colorsData) => {
    document.getElementById("text-color").value = colorsData["textColor"];
    document.getElementById("background-color").value = colorsData["backgroundColor"];
} 

const errorMessage = (msg, errorDiv) => {
    errorDiv.innerText = msg;
}

const addHook = (hook) => {
    window.hooksData.hooksSettings.push(hook);
    extensionAPI.storage.local.set({ hooksData: window.hooksData });
    window.selectedHook = window.hooksData.hooksSettings.length-1;
    updateUIEditorSelect(window.selectedHook, window.hooksData.hooksSettings);
}

const renameHook = (index, hookName) => {
    if (index == 0 || index == 1) {
        errorMessage(`Can't rename ${window.hooksData.hooksSettings[index].name} settings!`, window.errorConfig);
        return;
    }
    window.hooksData.hooksSettings[index].name = hookName;
    extensionAPI.storage.local.set({ hooksData: window.hooksData });
    updateUIEditorSelect(window.selectedHook, window.hooksData.hooksSettings);
}

const save = (index, hookContent) => {
    if (index == 1) {
        errorMessage(`Can't edit ${window.hooksData.hooksSettings[index].name} settings!`, window.errorConfig);
        return;
    }
    hookContent = checkHookConfig(hookContent);
    if (hookContent) {
        window.hooksData.hooksSettings[index].content = hookContent;
        extensionAPI.storage.local.set({ hooksData: window.hooksData });
        updateUIEditorSelect(window.selectedHook, window.hooksData.hooksSettings);
        errorMessage("Config updated!", window.errorConfig);
    }
}

const remove = (index) => {
    if (index == 0 || index == 1) {
        errorMessage(`Can't remove ${window.hooksData.hooksSettings[index].name} settings!`, window.errorConfig);
        return;
    }
    window.hooksData.hooksSettings.splice(index, 1);
    if (window.hooksData.selectedHook == index) {
        window.hooksData.selectedHook = 1;
    }
    extensionAPI.storage.local.set({ hooksData: window.hooksData });
    window.selectedHook = 0;
    updateUIEditor(window.selectedHook);
    updateUIEditorSelect(window.selectedHook, window.hooksData.hooksSettings);
}

// Check config content
const ROOT_KEYS   = ["_description", "hooks", "config", "removeHeaders", "globals", "onload"];
const VALID_HOOKS_TYPES = ["attribute", "class", "function", "event"];
const VALID_CONFIG_KEY = ["match", "!match", "matchTrace", "!matchTrace", "hookFunction", "alert", "requiredHooks", "showThis"]
const VALID_CONFIG_ALERT_KEY = ["match", "!match", "notification"]
const checkHookConfig = (config) => {
    var isHookingFunction = false;

    // Check JSON
    try {
        config = JSON.parse(config);
    } catch (e) {
        errorMessage("Invalid JSON!", window.errorConfig);
        return null;
    }

    // Checking JSON config content
    for (let key in config) {
        if (key === "_description" || key === "onload") {
            continue;
        }

        if (key === "removeHeaders" && !Array.isArray(config[key])) {
            errorMessage(`${key} as invalid content, must be an array!`, window.errorConfig);
            return null;
        } else if (key === "removeHeaders") {
            continue;
        }

        if (!ROOT_KEYS.includes(key)) {
            errorMessage(`${key} is an invalid root key, must be one of: ${JSON.stringify(ROOT_KEYS)}`, window.errorConfig);
            return null;
        }

        if (typeof config[key] !== "object") {
            errorMessage(`${key} as invalid content, must be an object!`, window.errorConfig);
            return null;
        }
    }

    if (config["onload"] !== undefined && typeof config["onload"] !== "string") {
        errorMessage(`onload as an invalid content, must be a string!`, window.errorConfig);
        return null;
    }

    if (config["_description"] !== undefined && typeof config["_description"] !== "string") {
        errorMessage(`_description as an invalid content, must be a string!`, window.errorConfig);
        return null;
    }

    // Check hooks structure
    for (let category in config["hooks"]) {
        if (typeof config["hooks"][category] !== "object") {
            errorMessage(`hooks["${category}"] as an invalid content, must be an object!`, window.errorConfig);
            return null;
        }

        // Type
        for (let type in config["hooks"][category]) {
            if (!VALID_HOOKS_TYPES.includes(type)) {
                errorMessage(`hooks["${category}"]["${type}"] is an invalid type, must be one of: ${JSON.stringify(VALID_HOOKS_TYPES)}`, window.errorConfig);
                return null;
            }

            if (!Array.isArray(config["hooks"][category][type])) {
                errorMessage(`hooks["${category}"]["${type}"] as an invalid content, must be an array!`, window.errorConfig);
                return null;
            }

            // Target
            for (let target of config["hooks"][category][type]) {
                if (target === "Function" || target === "window.Function")
                    isHookingFunction = true;

                if (typeof target !== "string") {
                    errorMessage(`hooks["${category}"]["${type}"] > ${JSON.stringify(target)} is invalid, must be a string!`, window.errorConfig);
                    return null;
                }
            }
        }
    }

    // Check config structure
    for (let target in config["config"]) {
        if (typeof config["config"][target] !== "object") {
            errorMessage(`config["${target}"] as an invalid content, must be an object!`, window.errorConfig);
            return null;
        }

        for (let key in config["config"][target]) {
            if (!VALID_CONFIG_KEY.includes(key)) {
                errorMessage(`config["${target}"]["${key}"] is an invalid config key, must be one of: ${JSON.stringify(VALID_CONFIG_KEY)}`, window.errorConfig);
                return null;
            }

            // Keep / Remove
            if (key === "match" || key === "!match" || key === "matchTrace" || key === "!matchTrace" || key === "requiredHooks") {
                if (!Array.isArray(config["config"][target][key])) {
                    errorMessage(`config["${target}"]["${key}"] as an invalid content, must be an array!`, window.errorConfig);
                    return null;
                }
                for (let value of config["config"][target][key]) {
                    if (typeof value !== "string") {
                        errorMessage(`config["${target}"]["${key}"] > ${JSON.stringify(value)} as an invalid content, must be a string!`, window.errorConfig);
                        return null;
                    }
                }
            }

            // Hook function
            if (key === "hookFunction") {
                if (isHookingFunction) {
                    errorMessage(`Impossible to use "hookFunction" in config when hooking Function in hooks!`, window.errorConfig);
                    return null;
                }

                if (typeof config["config"][target][key] !== "string") {
                    errorMessage(`config["${target}"]["${key}"] as an invalid content, must be a string!`, window.errorConfig);
                    return null;
                }
            }

            // Alert system
            if (key === "alert") {
                if (typeof config["config"][target][key] !== "object") {
                    errorMessage(`config["${target}"]["${key}"] as an invalid content, must be an object!`, window.errorConfig);
                    return null;
                }

                for (let subKey in config["config"][target][key]) {
                    if (!VALID_CONFIG_ALERT_KEY.includes(subKey)) {
                        errorMessage(`config["${target}"]["${key}"]["${subKey}"] is an invalid config key, must be one of: ${JSON.stringify(VALID_CONFIG_ALERT_KEY)}`, window.errorConfig);
                        return null;
                    }

                    if (subKey === "match" || subKey === "!match") {
                        if (!Array.isArray(config["config"][target][key][subKey])) {
                            errorMessage(`config["${target}"]["${key}"]["${subKey}"] as an invalid content, must be an array!`, window.errorConfig);
                            return null;
                        }
                        for (let value of config["config"][target][key][subKey]) {
                            if (typeof value !== "string") {
                                errorMessage(`config["${target}"]["${key}"]["${subKey}"] > ${JSON.stringify(value)} as an invalid content, must be a string!`, window.errorConfig);
                                return null;
                            }
                        }
                    }

                    if (subKey === "notification" && typeof config["config"][target][key][subKey] !== "boolean") {
                        errorMessage(`config["${target}"]["${key}"]["${subKey}"] > ${JSON.stringify(config["config"][target][subKey])} as an invalid content, must be a boolean!`, window.errorConfig);
                        return null;
                    }
                }
            }

            // Show this=
            if (key === "showThis") {
                if (typeof config["config"][target][key] !== "boolean") {
                    errorMessage(`config["${target}"]["${key}"] as an invalid content, must be a boolean!`, window.errorConfig);
                    return null;
                }
            }
        }
    }

    return config;
}

function isCaidoTokenExpired(caidoConfig) {
    const now = new Date();
    const accessTokenExpiration = caidoConfig.accessTokenExpiration
        ? new Date(caidoConfig.accessTokenExpiration)
        : null;
    const refreshTokenExpiration = caidoConfig.refreshTokenExpiration
        ? new Date(caidoConfig.refreshTokenExpiration)
        : null;

    const refreshTokenExpired = !caidoConfig.refreshToken || !refreshTokenExpiration || refreshTokenExpiration < now;
    const accessTokenExpired = !caidoConfig.accessToken || !accessTokenExpiration || accessTokenExpiration < now;

    // Access token is expired, but refresh token is not, create a new access token.
    if (accessTokenExpired && !refreshTokenExpired) {
        extensionAPI.runtime.sendMessage({ action: "refreshCaidoAuth" });
        return false;
    }

    // Both tokens are expired, we need to start a new authentication flow.
    if (accessTokenExpired && refreshTokenExpired) {
        errorMessage("You must (re)connect to Caido!", window.errorCaido);
        return true;
    }

    return false;
}


export {
    sanitizeHtml,
    updateUIDomains,
    updateUIWebhook,
    updateUIButtons,
    updateUITable,
    updateUIEditor,
    updateUIEditorSelect,
    updateUIColors,
    errorMessage,
    addHook,
    renameHook,
    save,
    remove,
    checkHookConfig,
    isCaidoTokenExpired
}