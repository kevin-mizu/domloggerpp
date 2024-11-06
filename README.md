<p align="center">
    <img src="./.github/banner.png" width="80%"><br>
    A browser extension that allows you to monitor, intercept, and debug JavaScript sinks based on customizable configurations.
    <br>
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/kevin-mizu/DOMLoggerpp">
    <a href="https://twitter.com/intent/follow?screen_name=kevin_mizu" title="Follow"><img src="https://img.shields.io/twitter/follow/podalirius_?label=kevin_mizu&style=social"></a>
    <br>
</p>

## 📦 Installation

**From extension stores**:

- Firefox: https://addons.mozilla.org/en-US/firefox/addon/domloggerpp
- Chromium: https://chrome.google.com/webstore/detail/domlogger%2B%2B/lkpfjhmpbmpflldmdpdoabimdbaclolp
- Safari: Not yet available.

**Manual installation**:

Download the latest release: https://github.com/kevin-mizu/domloggerpp/releases/

- Firefox: Go to `about:debugging#/runtime/this-firefox` and click on `Load Temporary Add-on`.

<p align="center">
    <img src="./.github/images/firefox_manual.png">
</p>

- Chromium: Go to `chrome://extensions/`, enable `Developer mode` and click on `Load unpacked`.

<p align="center">
    <img src="./.github/images/chromium_manual.png">
</p>

*if you want to build the extension by yourself, check the [app](./app/) folder.*

<br>

## 🌟 Features

- [x] Regex-based domain management.
- [x] Flexible hooking configuration (`class`, `function`, `attribute`, `event`).
- [x] Regex-based hooks arguments and stack trace filtering (`match`, `!match`, `matchTrace`, `!matchTrace`).
- [x] Dynamic regex generation (`exec:`).
- [x] Dynamic sinks arguments update (`hookFunction`).
- [x] Customizable notifications system (`alert`, `notification`).
- [x] Required hook logging condition (`requiredHook`).
- [x] On-demand debugging breakpoints.
- [x] Integrated Devtools log panel.
- [x] Response headers filtering.
- [x] Remote logging via webhooks.
- [x] Extensive theme customization.

<br>

## 📝 Usage example

https://github.com/kevin-mizu/domloggerpp/assets/48991194/d6ac9f90-0f44-4cd2-a5e6-890cd44b0aeb

<br>

## 🛠️ Devtools

![](./.github/images/devtools.png)

1. `Custom filter buttons`: Dynamically generated from your custom settings, these buttons facilitate log filtering.
2. `Data/Canary search bar`: Easily filter and highlight logs using specific criteria related to a sink's args data.
3. `Advanced column search`: Tailor your search to specific column criteria, like `sink=innerHTML;frame=top`, for more refined results.
4. `Global search bar`: This default datatable feature enables searching across all columns.
5. `Debug button`: Navigate directly to the page triggering the sink, with an automatic breakpoint for debugging.
6. `Log data management buttons`:
   - Import JSON log data.
   - Clear existing log data.
   - Export log data in JSON format.

<br>

## 💬 Popup

<p align="center">
    <img src="./.github/images/popup.png" width="262" height="450">
</p>

- `Domains`: Define allowed domains using regex to specify from which sites you'd like to receive logs.
- `Hooking`: Choose the hooking configuration to apply on the selected website.
- `Misc`: Enable or disable specific configuration settings.
    * `PwnFox support`: Allow all the [PwnFox](https://github.com/yeswehack/PwnFox) containers (Firefox only).
    * `Remove response headers`: Removes response headers according to your configuration file.
<br>

## ⚙️ Settings

https://github.com/kevin-mizu/domloggerpp/assets/48991194/0827eef3-6c16-42fc-b84d-d8ea16def6bf

- `Settings`: Manage your hooking configurations - create, edit, modify, and remove as per your needs.
- `Domains`: Easily manage allowed domains, similar to the functionality in the popup menu.
- `Webhook`: Specify a remote host that will receive logs based on your configuration settings.
- `Devtools`: If you're using a backend server and prefer not to display information in your devtool panel, this section lets you disable that feature.
- `Table`: Personalize the devtools tables to align with your preferences.
- `Customize`: Personalize the application's theme to align with your preferences.

<br>

## 🔗 Hooking configuration

### Global JSON structure

```json
{
    "_description": "JSON config example",

    "hooks": {
        "category": {
            "type_1": [ "sink_1", "sink_2" ],
            "type_2": [ "sink_1", "sink_2" ]
        }
    },

    "config": {
        "*": {},
        "sink_1": {
            "match": [ "regex_1", "regex_2", "exec:return 'regex_3'" ],
            "!match": [ "regex_1", "regex_2", "exec:return 'regex_3'" ],
            "matchTrace": [ "regex_1", "regex_2", "exec:return 'regex_3'" ],
            "!matchTrace": [ "regex_1", "regex_2", "exec:return 'regex_3'" ],
            "hookFunction": "return args",
            "requiredHook": [ "type_2" ],
            "alert": {
                "match": [ "regex_1", "regex_2", "exec:return 'regex_3'" ],
                "!match": [ "regex_1", "regex_2", "exec:return 'regex_3'" ],
                "notification": true
            },
            "hideThis": true
        }
    },

    "globals": {
        "Blacklist": [ "api", "app" ]
    },

    "onload": "console.log(1)",

    "removeHeaders": [ "content-security-policy" ]
}
```

*None of the specified keys in the configuration are mandatory; they can be manage to fit specific needs or omitted as desired.*

### _Description

This key aims to provide a way to insert notes within the configuration JSON itself. The value can be whatever you want as long as the JSON remains valid.

### Hooks

- `category`: Acts as a filter in the devtools panel, helping you organize and identify the sinks.
- `type_X`: Specifies the type of sink you're targeting. The possible types are:
    + class
    + attribute
    + function
    + event
    + custom
- `sink_X`: This denotes the name of the sink that needs to be hooked, the notation varies based on type:
    + `class` & `function`: Use the target name directly, such as `URLSearchParams`.
    + `event`: Only use the event name. For instance, for the `onmessage` event, simply use `message`.
    + `attribute`: Prefix with `set:` or/and `get:` as appropriate. An example would be `set:Element.prototype.innerHTML`.
    + `custom`: Format it as `type:sink_X`. For example, `attribute:set:jQuery.prototype.add`.

### Config

- `sink`: Refers to the target sink to be configured. It's essential for this to be present in the hooks section.
- `match` || `matchTrace`: An array of regular expressions. The `parameters` || `stack trace` of the sink must respect to these patterns.
- `!match` || `!matchTrace`:: An array of regular expressions that the `parameters` || `stack trace` of the sink should not match.
- `hookFunction`: This key should contain a raw JavaScript function that will be executed before the sink itself (and before any DOMLogger++ checks). The function receives 3 arguments: `target`, `thisArg`, and `args`, all of which refer to the currently identified sink. For example, using `return [args[0] + '*2']` on `eval('2')` will result in `4`.
- `requiredHook`: Specifies a list of hooks or sinks that must be triggered at least once before the target sinks start logging information. An example of this can be found in the [leverage-innerHTML.json](./configs/leverage-innerHTML.json) configuration file.
- `alert`: Triggers an alert badge on the extension icon based on specific conditions.
    + `match` & `!match`: Additional regular expressions that the sink parameters must respect to or avoid, respectively, in order to trigger the alert.
    + `notification`: If set to `true`, a notification popup will appear when all conditions are satisfied.
- `hideThis`: If set to `true`, the `this=` object won't be logged in the context of a function call.

Since version `1.0.4`, it is now possible to use the `exec:` regex directive, which allows you to generate a regex from JavaScript execution. For instance: `exec:return document.location.pathname`.

*For more detailed examples and insights, please refer to the [configs](./configs/) folder.*

### globals

The content of this key will be accessible in the `domlogger.globals` variable. It is designed to facilitate the modification of specific variables used in the `exec:` or `hookFunction` directives. An example of its usage can be found in the [cspt.json](./configs/cspt.json) configuration file.

### onload

This key should contain a raw JavaScript function that will be executed after DOMLogger++ has loaded.

### removeHeaders

Thanks to this key, you'll be able to provide a list of response headers (in lower case) that you want to remove if the remove headers feature is enabled. This is especially useful for removing security headers during tests.

<br>

## 🖥️ Backend

Not yet developed.

<br>

## 🗺️ Road map

- Set up an integrated backend server.
- Improve the scaling of the devtools panel.
- Find a way to hook the document.location property.
- Simplify headless browser compatibility.
- Fix a DOS with Reflect.apply, this.nodeName.toLowerCase... hooking.
- Fix the devtools goto button when the sink is reached within an iframe (it should redirect on the top frame).
- Find a way to avoid document.write breaking the extension.

<br>

## 🤝 Contributors

Many people helped and help DOMLogger++ become what it is and need to be acknowledged here!

[@xanhacks](https://twitter.com/xanhacks), [@kire_devs_hacks](https://twitter.com/kire_devs_hacks), [aristosMiliaressis](https://github.com/aristosMiliaressis), [@MtnBer](https://twitter.com/MtnBer), [@FeelProud_sec](https://twitter.com/FeelProud_sec), [@jonathan404_](https://x.com/jonathan404_), [@PikuHaku](https://x.com/PikuHaku), [@aituglo](https://x.com/aituglo), [@xnl_h4ck3r](https://x.com/xnl_h4ck3r), [AetherBlack](https://github.com/AetherBlack), [@me0wday](https://x.com/me0wday), [@k1ng_pr4wn](https://x.com/k1ng_pr4wn)

*Special thanks to [@BitK\_](https://twitter.com/BitK_) for the well-structured code in [Pwnfox](https://github.com/yeswehack/PwnFox), it helped me a lot to understand browsers extensions ❤️*
