## 📜 Configs

- [cspt.json](cspt.json): Useful to search for CSPT vulnerabilities in cases of path, query string, or hash reflection within fetch or resource loading.
- [dom-invader.json](dom-invader.json): Inspired by the [DOM Invader](https://portswigger.net/burp/documentation/desktop/tools/dom-invader) default configuration. Gathers information about many sinks depending on your canaries.
- [leverage-innerHTML.json](leverage-innerHTML.json): Useful to search for gadgets in case of sanitized HTML input.
- [leverage-xss.json](leverage-xss.json): Useful to search for gadgets in cases of XSS without impact. The final goal is to poison the browser storage so that the XSS will trigger repeatedly when the victim user navigates to a specific page (e.g., [draw.io diagrams backdoor](https://huntr.com/bounties/4c1c5db5-210f-4d7e-8380-b95f88fdb78d)).
- [postmessages.json](postmessages.json): Used to detect postMessage and onmessage misconfiguration like insecure regex, indexOf origin checks...