const init = () => {
    // Create DEFAULT hook if none exist
    extensionAPI.storage.local.get("hooksData", (data) => {
        if (data.hooksData === undefined) {
            extensionAPI.storage.local.set({ hooksData: {
                selectedHook: 0,
                hooksSettings: [{
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
    });

    // Set default colors settings
    extensionAPI.storage.local.get("colorsData", (data) => {
        if (data.colorsData === undefined) {
            extensionAPI.storage.local.set({ colorsData: {
                textColor: "#C6C6CA",
                backgroundColor: "#292A2D"
            }});
        }
    });

    // Set default tableConfig settings
    extensionAPI.storage.local.get("tableConfig", (data) => {
        if (data.tableConfig === undefined) {
            extensionAPI.storage.local.set({ tableConfig: {
                colIds: [ "dupKey", "type", "alert", "hook", "date", "href", "frame", "sink", "data", "trace", "debug" ],
                colVisibility: {
                    "dupKey": false, "type": false, "alert": true, "hook": false, "date": true, "href": true, "frame": true, "sink": true, "data": true, "trace": true, "debug": true
                },
                colOrder: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
            }});
        }
    });

    // Set webhookURL attribute after browser restart
    extensionAPI.storage.local.get("webhookURL", (data) => {
        if (data.webhookURL) {
            MessagesHandler.webhookURL = data.webhookURL;
        } else {
            MessagesHandler.webhookURL = "";
        }
    });

    // Set devtoolsPanel attribute after browser restart
    extensionAPI.storage.local.get("devtoolsPanel", (data) => {
        if (typeof data.devtoolsPanel === "boolean") {
            MessagesHandler.devtoolsPanel = data.devtoolsPanel;
        } else {
            MessagesHandler.devtoolsPanel = true;
        }
    });
}
