const init = () => {
    extensionAPI.storage.local.get(null, (data) => {
        MessagesHandler.browserStorage = data;

        //  Set default hooksData settings
        if (data.hooksData === undefined) {
            extensionAPI.storage.local.set({ hooksData: {
                selectedHook: 0,
                hooksSettings: [{
                    name: "DEFAULT",
                    content: {
                        "hooks": {
                            "XSS": { "attribute": [ "set:Element.prototype.innerHTML" ] }
                        },
                        "config": {},
                        "removeHeaders": [
                            "content-security-policy",
                            "x-frame-options"
                        ]
                    }
                }]
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

        // Set default tableConfig settings
        if (data.tableConfig === undefined) {
            extensionAPI.storage.local.set({ tableConfig: {
                colIds: [ "dupKey", "type", "alert", "hook", "date", "href", "frame", "sink", "data", "trace", "debug" ],
                colVisibility: {
                    "dupKey": false, "type": false, "alert": true, "hook": false, "date": true, "href": true, "frame": true, "sink": true, "data": true, "trace": true, "debug": true
                },
                colOrder: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
            }});
        }

        // Set webhookURL attribute after browser restart
        if (data.webhookURL) {
            MessagesHandler.webhookURL = data.webhookURL;
        } else {
            MessagesHandler.webhookURL = "";
        }

        // Set devtoolsPanel attribute after browser restart
        if (typeof data.devtoolsPanel === "boolean") {
            MessagesHandler.devtoolsPanel = data.devtoolsPanel;
        } else {
            MessagesHandler.devtoolsPanel = true;
        }

        // Setting up chromium declarativeNetRequest rules
        if (typeof browser === "undefined" && data.removeHeaders === true) {
            removeCurrentRules();
            var rules = generateRules(data.allowedDomains, data.hooksData.hooksSettings[data.hooksData.selectedHook].content.removeHeaders || []);
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
                    case "webhookURL":
                        MessagesHandler.webhookURL = values.newValue;
                        break;
                    case "devtoolsPanel":
                        MessagesHandler.devtoolsPanel = values.newValue;
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
                    var rules = generateRules(MessagesHandler.browserStorage.allowedDomains, MessagesHandler.browserStorage.hooksData.hooksSettings[MessagesHandler.browserStorage.hooksData.selectedHook].content.removeHeaders || []);
                    extensionAPI.declarativeNetRequest.updateDynamicRules({
                        addRules: rules,
                        removeRuleIds: []
                    });
                }
            }
        }
    });
}
