// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

const sanitizeHtml = (str) => {
    if (!str?.toString) {
        return str;
    }

    return str.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;").replace(/"/g, "&quot;");
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

const updateUIHooks = (index, hooksSettings) => {
    const hooksList = document.getElementById("hooks");
    hooksList.innerHTML     = `${hooksSettings.map((c, i) => `<option value="${i}" ${ i==0 ? "hidden" : "" }>${sanitizeHtml(c.name)}</option>`).join("")}`;
    hooksList.selectedIndex = index;
}

const updateUICaido = (caidoConfig) => {
    const caidoSupport = document.getElementById("caidoSupport");
    caidoSupport.checked = caidoConfig.enabled;
}

const updateUIPwnfox = (checked) => {
    const pwnfoxSupport = document.getElementById("pwnfoxSupport");
    pwnfoxSupport.checked = checked;
}

const updateUIHeaders = (checked) => {
    const removeHeaders = document.getElementById("removeHeaders");
    removeHeaders.checked = checked;
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
        chrome.tabs.create({ url: chrome.runtime.getURL("/src/options/options.html?caidoErrorMsg=You+must+(re)connect+to+Caido!#caido") });
        return true;
    }

    return false;
}

export {
    updateUIDomains,
    updateUIHooks,
    updateUIPwnfox,
    updateUIHeaders,
    updateUICaido,
    isCaidoTokenExpired
}