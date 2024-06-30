install:
	cd scripts && npm install

build:
	cd scripts && npm run build
	cp firefox/manifest.json . && web-ext build --overwrite-dest --filename {name}_firefox-{version}.zip && rm manifest.json
	cp chrome/manifest.json . && web-ext build --overwrite-dest --filename {name}_chromium-{version}.zip && rm manifest.json

dev-firefox:
	cd scripts && npm run build
	cp firefox/manifest.json . && web-ext run -t firefox-desktop --devtools

dev-chromium:
	cd scripts && npm run build
	cp chrome/manifest.json . && web-ext run -t chromium --devtools