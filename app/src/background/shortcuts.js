const initShortcuts = () => {
    extensionAPI.commands.onCommand.addListener((command) => {
        switch(command) {
            case "open_options":
                extensionAPI.tabs.create({ url: chrome.runtime.getURL("/src/options/options.html") });
                break;
            case "open_popup":
                // Firefox manifest v2 requires to use browserAction
                if (typeof browser !== "undefined") {
                    extensionAPI.browserAction.openPopup();
                } else {
                    extensionAPI.action.openPopup();
                }
                break;
        }
    });
}