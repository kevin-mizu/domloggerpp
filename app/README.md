## 🏗️ Building steps

Follow these steps to build the extension.

### Build hooking scripts

```bash
cd ./scripts/
npm install
npm run build
```

### Setup manifest file

- For Firefox: `ln -sf manifest-firefox.json manifest.json`.
- For Chrome: `ln -sf manifest-chrome.json manifest.json`.

### Build the extension

```
web-ext build
```

*Final zip file should be located into: `./web-ext-artifacts/domlogger_-${version}.zip`.*

### Using Makefile

```bash
# Release
make install
make build

# Development
make dev-chromium
## or
make dev-firefox
```