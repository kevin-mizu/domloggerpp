// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

const sanitizeHtml = (str) => str.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;").replace(/"/g, "&quot;");

const updateEvent = () => {
    let rows = document.querySelectorAll(".remove-one");
    for (const el of rows) {
        el.onclick = function() {
            window.allowedDomains = window.allowedDomains.filter(d => d !== this.dataset.domain);
            extensionAPI.storage.local.set({ allowedDomains: window.allowedDomains });
            extensionAPI.runtime.sendMessage({ action: "updateDomains", data: window.allowedDomains });
            updateUIDomains(window.allowedDomains);
        }
    }
}

const updateUIDomains = (domains) => {
    const allowedDomains = document.getElementById("allowedDomains");
    if (domains.length !== 0) {
        allowedDomains.style.display = "block";
        allowedDomains.innerHTML = `${domains.map(d => `<p>
            <span class="domain-name">${sanitizeHtml(d)}</span>
            <span data-domain="${sanitizeHtml(d)}" class="remove-one">&times;</span>
        </p>`).join("")}`;
    } else {
        allowedDomains.style.display = "none";
    }
    updateEvent();
}

const updateUIHooks = (index, hooksSettings) => {
    const hooksList = document.getElementById("hooks");
    hooksList.innerHTML     = `${hooksSettings.map((c, i) => `<option value="${i}">${sanitizeHtml(c.name)}</option>`).join("")}`;
    hooksList.selectedIndex = index;
}

export {
    updateUIDomains,
    updateUIHooks
}