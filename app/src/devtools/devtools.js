// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

// Init
const title = "DOMLogger++"
const icon = "/icons/icon.png"
const panel = "/src/devtools/panel/panel.html"

// chrome API return a callback while browser API a promise. This function aim to standardized the code:
const promisifyChromeAPI = (method) => {
    return (...args) => {
        return new Promise((resolve) => {
            method(...args, (result) => {
                resolve(result);
            });
        });
    };
}


(extensionAPI === chrome
    ? promisifyChromeAPI(extensionAPI.devtools.panels.create) 
    : extensionAPI.devtools.panels.create)(title, icon, panel).then(panel => {
    const port = extensionAPI.runtime.connect({ name: `devtools-${extensionAPI.devtools.inspectedWindow.tabId}` });
    let msgHistory = {};
    let _window = null;

    port.onMessage.addListener((data) => {
        // Handle actions only if DOM loaded
        if (_window) {
            switch (data.action) {
                case "clearStorage":
                    _window.table.clear().draw();
                    break;
                case "removeRow":
                    var key = data.data;
                    _window.table.rows((idx, data, node) => {
                        return data.dupKey === key;
                    }).remove().draw();
                    break;
                case "updateConfig":
                    _window.initButtons();
                    break;
                case "updateColors":
                    _window.initColors();
                    break;
                case "updateTableConfig":
                    _window.tableConfig = data.tableConfig;
                    _window.updateUITable();
                    break;
            }
            return;
        }

        // Handle msg historic
        if (data.init) {
            msgHistory = Object.assign(msgHistory, data.init);
            return;
        }

        // Handle each message if DOM loaded
        if (_window) {
            _window.handleMessage(data);
        } else {
            msgHistory[data.key] = data;
        }
    });

    panel.onShown.addListener(function (panelWindow) {
        panel.onShown.removeListener(this);
        _window = panelWindow;
        _window.init(Object.values(msgHistory));
        msgHistory = {};
    });
})
