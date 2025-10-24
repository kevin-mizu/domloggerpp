# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.11] - 2025-10-24

### Added

- It’s now possible to pass a specific globalContext as the last argument to domlogger.hooks.
- nodeName has been added to the sink information for events.

### Updated

- Improved Makefile to install web-ext ([#54](https://github.com/kevin-mizu/domloggerpp/pull/54)) (thanks [villu164](https://github.com/villu164)).
- Added more detailed Chromium messaging for invalid hookFunction values ([#54](https://github.com/kevin-mizu/domloggerpp/pull/54)) (thanks [villu164](https://github.com/villu164)).

### Fixed

- In the options editor, fixed the macOS Cmd+S shortcut ([#54](https://github.com/kevin-mizu/domloggerpp/pull/54)) (thanks [villu164](https://github.com/villu164)).

## [1.0.10] - 2025-09-15

### Fixed

- Data will no longer be encoded before being sent to Caido.  
- Ensured that the body size never exceeds Caido’s limit for JSON requests.

## [1.0.9] - 2025-09-02

### Added

- Full Caido session handling has been added (this is going to be useful with a plugin that should be released in October 2025).
- It's now possible to supply the sink debug canary from the 'domloggerpp-canary' get parameter.
- The settings webhook tab has been improved to make it fully configurable.
- A new dompurify-bypass-replace.json config file is available, allowing tracking of DOMPurify sanitization to find replace misconfigurations.
- A new domloggerpp.utils has been added to create notifications from the DOM.
- The cspt.json config file has been updated to no longer log in devtools but only console.log + create a notification.

### Updated

- The postmessages.json config file has been updated to add colored console.log inspired by postMessage-tracker.
- Stack trace parsing has been improved using '# sourceURL='.
- Internal finding attributes have been renamed: hook → type, type → tag.
- Date format has been updated to use 'toLocaleString'.
- Canaries are now encoded with base64 instead of using sha256 to improve performance.
- Stopped using a custom sha256 implementation on https websites to avoid performance issues on most websites.
- Internal data flow has been improved to always use actions.

### Fixed

- Small issue in stringify breaking some conversions ([#41](https://github.com/kevin-mizu/domloggerpp/pull/41)) (Thanks [vitorfhc](https://github.com/vitorfhc)).
- New config creation had "removeHeaders" for no reason.
- The GreHack workshop has been fixed based on the recent update (i.e., custom hooking handling).
- Fixed a bug regarding custom hooking which was crashing in getTargets with null/undefined objects ([#44](https://github.com/kevin-mizu/domloggerpp/pull/44)) (Thanks [abdilahrf](https://github.com/abdilahrf)).
- The Chromium devtools 'desync' has been fixed. It should no longer be required to close / reopen devtools to update the data on Chromium.
- Fixed a bug which was blocking multiple custom attribute hookings on the same object.
- Forced default value on the datatable to ensure no errors are created in case of weird postMessages.

## [1.0.8] - 2025-02-27

### Added

- A new title hint has been added to the options config editor ([#35](https://github.com/kevin-mizu/domloggerpp/pull/35)) (Thanks [Maltemo](https://github.com/Maltemo)).
- Introduced a new logOnly storage dev flag (this will be useful in upcoming versions).
- Several shortcuts have been added to the options config editor, making JSON editing easier (see [README.md](https://github.com/kevin-mizu/domloggerpp/blob/main/README.md)).
- Two new shortcuts have been added on all pages for quick access to the popup and options (see [README.md](https://github.com/kevin-mizu/domloggerpp/blob/main/README.md)).
- The JSON editor now features syntax highlighting and line numbers.
- A new GLOBAL.json config file is available, allowing shared common settings across configurations.

### Updated

- Custom types have been removed. The custom object is now transparent and no longer causes a race condition that hide certain sinks from the logger.
- The hideThis option has been removed and replaced with showThis. Now, by default, this= will not appear in logs.
- The CSPT.json config has been updated to log the method as well.

### Fixed

- The "Go to" button is now working again. It should no longer incorrectly match every identical sink in a JavaScript file.
- Hooking Object.defineProperty should no longer cause a DoS.
- Several fixes have been applied to the workshop application ([#33](https://github.com/kevin-mizu/domloggerpp/pull/33)) (Thanks [owalid](https://github.com/owalid)).
- An HTML injection in the DevTools panel has been fixed (Thanks [W0rty](https://github.com/W0rty)).
- The DataTables error in DevTools has been fixed, and the alert error should no longer appear.

## [1.0.7] - 2024-11-14

### Added

- New hideThis configuration key to hide thisArg in devtools for function sinks ([#29](https://github.com/kevin-mizu/domloggerpp/issues/29)) (Thanks [aristosMiliaressis](https://github.com/aristosMiliaressis)).
- Improved leverage-innerHTML.json config to detect potential document DOM clobbering sinks.
- New Client-Side Prototype Pollution detection (cspp.json) configuration file.
- Devtools font size can now be configured from the settings.

### Updated

- The CSPT config has been improved to properly handle "fetch(new Request('/'))".
- Banned words have been updated in all configs.
- The thisArg notation in devtools has been improved to make it easier to read ([#29](https://github.com/kevin-mizu/domloggerpp/issues/29)) (Thanks [aristosMiliaressis](https://github.com/aristosMiliaressis)).
- JavaScript injection has been improved on Firefox (wasn't needed for Chromium) to limit the init race condition.
- The dupKey value is now computed in the DOM instead of the background script.

### Fixed

- Fixed a bug that made attribute hooking impossible without set/get.
- Fixed a bug that blocked hooking postMessage without typing window.postMessage ([#25](https://github.com/kevin-mizu/domloggerpp/issues/25)).
- Fixed a DOS loop issue in the onmessage handler that triggered a hooked sink.

## [1.0.6] - 2024-08-04

### Added

- New configuration files (postMessage & leverage-xss.json) are available in the configs folder (it will be improved soon).
- A new globals root key is associated with the domlogger.globals variable for execCode shortcut.
- A new onload root key is used to execute code after the extension loads.
- New matchTrace and !matchTrace directives have been added to the config root key, allowing filtering based on the sink's stack trace ([#13](https://github.com/kevin-mizu/domloggerpp/issues/13)) (Thanks [jonathann403](https://github.com/jonathann403)).
- Hooked functions and classes are now available in domlogger.func for execCode usage to avoid DoS due to recursive hook/usage.
- The domlogger.update.thisArg property can be used within the hookFunction directive to overwrite the thisArg value.
- A new full-screen mode has been added in DevTools ([#20](https://github.com/kevin-mizu/domloggerpp/pull/20)) (Thanks [xanhacks](https://github.com/xanhacks)).
- New tooltips have been added to the popup and DevTools icons ([#23](https://github.com/kevin-mizu/domloggerpp/pull/23)) (Thanks [xanhacks](https://github.com/xanhacks)).

### Updated

- The frames column now properly describes which frames the sink has been found in (e.g., top.frames[1].frames[0]).
- The RegExp.prototype.toJSON method has been overwritten to properly log the regex value instead of {}.
- Arguments passed in the exec: directive are no longer stringified, making their usage easier.
- The exec: and hookFunction directives now have 3 parameters: thisArg, args, and target.
- The CSPT config has been updated to work properly with the new updates.

### Fixed

- The DevTools tab should work better now; I'll aim to completely fix it in the next release.
- Fixed a bug that was blocking URLSearchParams.prototype.get from being hooked ([#15](https://github.com/kevin-mizu/domloggerpp/pull/15)) (Thanks [matanber](https://github.com/matanber)).
- Stopped using crypto.subtle, which isn't exposed over HTTP (making the extension unavailable in that case) ([#14](https://github.com/kevin-mizu/domloggerpp/issues/14)) (Thanks [FeelProud](https://github.com/FeelProud)).
- The "Add Current eTLD+1" button in the popup now properly handles public eTLDs (e.g., .co.uk) and IPs ([#17](https://github.com/kevin-mizu/domloggerpp/issues/17)) (Thanks [xnl-h4ck3r](https://github.com/xnl-h4ck3r)).
- Unicode characters in the config should no longer cause the extension to crash.
- The hookFunction directive should now be working properly.
- The extension should no longer crash if the config root key is absent.
- The UI for the "Remove Headers" settings has been fixed ([#19](https://github.com/kevin-mizu/domloggerpp/issues/19)) (Thanks [xanhacks](https://github.com/xanhacks)).

## [1.0.5] - 2024-07-16

### Added

- A new (CSPT) config is available in the configs folder.
- New feature to remove response headers based on the JSON config.
- CTRL+S can now be used to save JSON configs ([#4](https://github.com/kevin-mizu/domloggerpp/issues/4)) (Thanks [FeelProud](https://github.com/FeelProud)).
- Config keys can now contain several targets using "|".
- Information about the current thisArg is now logged ([#3](https://github.com/kevin-mizu/domloggerpp/issues/3)) (Thanks [aristosMiliaressis](https://github.com/aristosMiliaressis)).
- The exec: regex directive now provides a target argument equal to the currently found sink.
- A new _comment root key is available within the configuration JSON ([#6](https://github.com/kevin-mizu/domloggerpp/issues/6)) (Thanks [xnl-h4ck3r](https://github.com/xnl-h4ck3r)).
- New "current domain" and "current etld+1" buttons available in the popup ([#8](https://github.com/kevin-mizu/domloggerpp/pull/8)) (Thanks [Aituglo](https://github.com/Aituglo))
- New pwnfox integration for Firefox ([#8](https://github.com/kevin-mizu/domloggerpp/pull/8)) (Thanks [Aituglo](https://github.com/Aituglo))

### Updated

- The whole background script code has been segmented and optimized into several files.
- The usage of sendMessage has been replaced by storage.onChanged for cross-context data exchange.
- Devtools clearStorage & removeRow buttons now update all Devtools tabs.

### Fixed

- Devtools data highlighting is now working fine in "show more" ([#5](https://github.com/kevin-mizu/domloggerpp/pull/5)) (Thanks [AetherBlack](https://github.com/AetherBlack)).
- Event directive now properly hooks HTMLElement events.
- allowedDomains regex now properly handles IP domains.
- The Devtools should now stop having sync issues that require reloading them.

## [1.0.4] - 2024-05-16

### Added

- New configs available in the configs folder.
- New requiredHooks config option.
- New exec: match and !match directives -> generate your regex using JavaScript.
- It is now possible to fully configure the devtools table (hiding columns, reordering, etc.).
- New domlogger.clean() function to reset the current Canary debugger.

### Updated

- hookFunction now ensures that the provided code is valid.
- In case of attribute hooking, if neither get: nor set: is specified, both will be hooked.
- The goto function has been optimized and should always be working.

### Fixed

- Internally used functions are now safely utilized, avoiding any DOS issues.
- The devtools table is now perfectly responsive.

## [1.0.3] - 2023-10-25

### Added

- First public release.
