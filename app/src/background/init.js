const init = () => {
    extensionAPI.storage.local.get(null, (data) => {
        MessagesHandler.browserStorage = data;

        //  Set default hooksData settings
        const GLOBAL_CONTENT = {
            "hooks": {},
            "config": {},
            "removeHeaders": [
                "content-security-policy",
                "x-frame-options"
            ]
        };
        if (data.hooksData === undefined) {
            extensionAPI.storage.local.set({ hooksData: {
                selectedHook: 1,
                hooksSettings: [{
                    name: "GLOBAL",
                    content: GLOBAL_CONTENT
                },{
                    name: "DEFAULT",
                    content: {
                        "hooks": {
                            "XSS": { "attribute": [ "set:Element.prototype.innerHTML" ] }
                        },
                        "config": {}
                    }
                }]
            }});
        }
        // Starting DOMLogger++ 1.0.8, a new GLOBAL config as been added, which wasn't present before.
        // Need to update the storage for that update.
        else if (data.hooksData.hooksSettings[0].name === "DEFAULT") {
            delete data.hooksData.hooksSettings[0].content.removeHeaders;
            extensionAPI.storage.local.set({ hooksData: {
                selectedHook: parseInt(data.hooksData.selectedHook)+1,
                hooksSettings: [{
                    name: "GLOBAL",
                    content: GLOBAL_CONTENT
                }].concat(data.hooksData.hooksSettings)
            }});
        }

        // Set default removeHeaders settings
        if (data.removeHeaders === undefined) {
            extensionAPI.storage.local.set({ removeHeaders: false });
        }

        // Set default colors settings
        if (data.colorsData === undefined) {
            extensionAPI.storage.local.set({ colorsData: {
                textColor: "#C6C6CA",
                backgroundColor: "#292A2D"
            }});
        }

        // Set default devtools font size
        if (data.devtoolsFontSize === undefined) {
            extensionAPI.storage.local.set({ devtoolsFontSize: "16px" });
        }

        // Set default tableConfig settings
        if (data.tableConfig === undefined) {
            extensionAPI.storage.local.set({ tableConfig: {
                colIds: [ "dupKey", "tag", "alert", "type", "date", "href", "frame", "sink", "data", "trace", "debug" ],
                colVisibility: {
                    "dupKey": false, "tag": false, "alert": true, "type": false, "date": true, "href": true, "frame": true, "sink": true, "data": true, "trace": true, "debug": true
                },
                colOrder: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
            }});
        }

        // Set webhookConfig attribute after browser restart
        if (data.webhookConfig) {
            MessagesHandler.webhookConfig = data.webhookConfig;
        }

        // Set default caidoConfig settings
        if (data.caidoConfig === undefined) {
            extensionAPI.storage.local.set({ caidoConfig: {
                url: "",
                enabled: false,
                pluginId: null,
                accessToken: null,
                refreshToken: null,
                accessTokenExpiration: null,
                refreshTokenExpiration: null
            }});
        }

        // Set caidoConfig attribute after browser restart
        if (data.caidoConfig) {
            MessagesHandler.caidoConfig = data.caidoConfig;
        }

        // Set devtoolsPanel attribute after browser restart
        if (typeof data.devtoolsPanel === "boolean") {
            MessagesHandler.devtoolsPanel = data.devtoolsPanel;
        }

        // Setting up chromium declarativeNetRequest rules
        if (typeof browser === "undefined" && data.removeHeaders === true) {
            removeCurrentRules();
            var rules = generateRules(
                data.allowedDomains,
                data.hooksData.hooksSettings[data.hooksData.selectedHook].content.removeHeaders || data.hooksData.hooksSettings[0].content.removeHeaders || []
            );
            extensionAPI.declarativeNetRequest.updateDynamicRules({
                addRules: rules,
                removeRuleIds: []
            });
        }
    })

    // Update MessagesHandler.browserStorage on storage updates
    extensionAPI.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local") {
            for (const [key, values] of Object.entries(changes)) {
                MessagesHandler.browserStorage[key] = values.newValue;
                switch (key) {
                    case "webhookConfig":
                        MessagesHandler.webhookConfig = values.newValue;
                        break;
                    case "devtoolsPanel":
                        MessagesHandler.devtoolsPanel = values.newValue;
                        break;
                    case "caidoConfig":
                        MessagesHandler.caidoConfig = values.newValue;
                        break;
                }
            }

            // Update chromium declarativeNetRequest rules
            if (typeof browser === "undefined") {
                if (changes.removeHeaders?.newValue === false) {
                    removeCurrentRules();
                }

                if (changes.removeHeaders?.newValue === true || (MessagesHandler.browserStorage.removeHeaders === true && (changes.hooksData || changes.allowedDomains))) {
                    removeCurrentRules();
                    var rules = generateRules(
                        MessagesHandler.browserStorage.allowedDomains,
                        MessagesHandler.browserStorage.hooksData.hooksSettings[MessagesHandler.browserStorage.hooksData.selectedHook].content.removeHeaders || MessagesHandler.browserStorage.hooksData.hooksSettings[0].content.removeHeaders || []
                    );
                    extensionAPI.declarativeNetRequest.updateDynamicRules({
                        addRules: rules,
                        removeRuleIds: []
                    });
                }
            }
        }
    });
}
