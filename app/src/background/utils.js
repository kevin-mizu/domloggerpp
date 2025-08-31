const sanitizeHtml = (str) => str.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;").replace(/"/g, "&quot;");

const sha256 = async (d) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(d);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hash));
    
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
    return hashHex;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Manage chromium declarativeNetRequest rules
const removeCurrentRules = async () => {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rules.map(rule => rule.id)
    });
}

const generateRules = (domains, headers) => {
    var rules = [];
    
    responseHeaders = [];
    for (const h of headers) {
        responseHeaders.push({ header: h, operation: "remove" })
    }

    // Rules can't have an empty responseHeaders array.
    if (responseHeaders.length === 0) return rules

    for (const i in domains) {
        rules.push({
            id: getRandomInt(9999),
            action: {
                type: "modifyHeaders",
                responseHeaders: responseHeaders
            },
            condition: { urlFilter: domains[i], resourceTypes: [ "main_frame", "sub_frame" ]}
        })
    }
    return rules;
}

// Check if the Caido token is expired, if so we need to refresh it
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
        chrome.tabs.create({ url: chrome.runtime.getURL("/src/options/options.html?caidoErrorMsg=You+must+(re)connect+to+Caido!#caido") });
        return true;
    }

    return false;
}
