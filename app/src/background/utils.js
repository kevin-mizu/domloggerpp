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
