install:
	cd scripts && npm install

build:
	cd scripts && npm run build
	ln -sf manifest-firefox.json manifest.json && web-ext build --overwrite-dest --filename {name}_firefox-{version}.zip
	ln -sf manifest-chrome.json manifest.json && web-ext build --overwrite-dest --filename {name}_chromium-{version}.zip

dev-firefox:
	cd scripts && npm run build
	ln -sf manifest-firefox.json manifest.json && web-ext run -t firefox-desktop --devtools

dev-chromium:
	cd scripts && npm run build
	ln -sf manifest-chrome.json manifest.json && web-ext run -t chromium --devtools