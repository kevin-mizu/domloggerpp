// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

const handleMessage = (event) => {
	if (event.data.ext == "domlogger++") {
		extensionAPI.runtime.sendMessage({ data: event.data });
	}
};

const DANGEROUS_KEYS = [ "prototype", "constructor", "__proto__" ];
function deepMerge(obj1, obj2) {
	for (let key in obj2) {
		if (obj2.hasOwnProperty(key)) {
			if (obj2[key] instanceof Object && obj1[key] instanceof Object && !DANGEROUS_KEYS.includes(key)) {
				obj1[key] = deepMerge(obj1[key], obj2[key]);
			} else {
				obj1[key] = obj2[key];
			}
		}
	}
	return obj1;
}

const main = async () => {
	extensionAPI.storage.local.get(null, async (data) => {
		let debugCanary;
		let hookSettings;

		if (!data.pwnfoxSupport || !data.activeTab.startsWith("PwnFox-")) {
			// Checking if current domain is allowed
			var validDomain = false;
			if (data.allowedDomains) {
				for (let d of data.allowedDomains) {
					try {
						if (location.host.match(d)) {
							validDomain = true;
						}
					} catch {
						console.log(`[DOMLogger++] ${d} (domain regex) is invalid!`);
					}
				}
			}

			if (!validDomain) {
				return;
			}
		}

		// Page loaded from debug goto
		if (data.debugCanary?.href === location.href) {
			debugCanary = data.debugCanary?.canary;
			chrome.storage.local.remove(["debugCanary"]);
		}

		// Hooking settings
		if (data.hooksData) {
			hookSettings = JSON.stringify(
				deepMerge(
					data.hooksData.hooksSettings[0].content, // GLOBAL
					data.hooksData.hooksSettings[data.hooksData.selectedHook].content
				)
			);
		}

		// Setup the script
		let script = document.createElement("script");
		script.dataset.hookSettings = hookSettings;
		script.dataset.debugCanary = debugCanary;
		script.dataset.logOnly = data.logOnly || "";
		script.dataset.isChromium = typeof browser === "undefined" || "false";

		// Firefox (Manifest V2) doesn't load content script-appended JavaScript in a separate thread (async).
		// Because of this, I need to use innerText to load the script as quickly as possible (or https://github.com/kevin-mizu/domloggerpp/issues/10 won't works).
		// In contrast, Chromium (Manifest V3) blocks inline script loading, but appends JavaScript in an async manner.
		if (typeof browser === "undefined") {
			script.src = extensionAPI.runtime.getURL("src/domloggerpp-bundle.js");
		} else {
			const bundle = await fetch(extensionAPI.runtime.getURL("src/domloggerpp-bundle.js"));
			script.textContent = await bundle.text() + "\n//# sourceURL=domloggerpp-bundle.js"; // I'm adding the new line comment to update the execution script name in the stack trace. This helps to discriminate between the extension's script.
		}

		(document.head || document.documentElement).appendChild(script);
		script.onload = () => {
			script.parentNode.removeChild(script);
		};
	});

	// Setup DOM -> Background script connection
	window.addEventListener("message", handleMessage);
};

main();
