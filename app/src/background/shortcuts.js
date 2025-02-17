const initShortcuts = () => {
    extensionAPI.commands.onCommand.addListener((command) => {
        if (command === "open_settings") {
            extensionAPI.tabs.create({ url: chrome.runtime.getURL("/src/options/options.html") });
        }
    });
}