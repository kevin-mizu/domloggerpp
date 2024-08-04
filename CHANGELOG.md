# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
