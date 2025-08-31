import {
    sanitizeHtml
} from "./utils.js"

function renderAlert(data, type) {
    if (type === "display") {
        data = data ? `<svg width="21px" viewBox="0 0 512 512" class="pointer text-color mgl-10 mgr-10">
            <use xlink:href="./img/bell-solid.svg#bell-icon"></use>
        </svg>` : "";
    }
    return data;
}

function renderDate(data, type) {
    return data;
}

function renderHref(data, type, row) {
    if (type === "display") {
        let href = new URL(row.href);
        data = `<span class="filter-span">${sanitizeHtml(href.origin + href.pathname)}</span>&nbsp;<img src="./img/arrow-up-right-from-square-solid.svg" data-href="${sanitizeHtml(row.href)}" width="15px" class="goto-link svg-color">`;
    }
    return data;
}

function renderFrame(data, type) {
    if (type === "display") {
        data = `<span class="filter-span">${sanitizeHtml(data)}</span>`;
    }
    return data;
}

function renderSink(data, type) {
    if (type === "display") {
        data = `<span class="filter-span">${sanitizeHtml(data)}</span>`;
    }
    return data;
}

function renderData(data, type) {
    if (type === "display") {
        var preview = data.replace(/\n/g, " ");
        if (preview.length >= 50)
            preview = `${preview.slice(0,50)} <redacted>`;

        var filterData = $("#filter-data").val();
        if (filterData)
            preview = preview.replaceAll(filterData, `<span class="highlight">${filterData}</span>`);
        data = `<span class="show-data" data-data="${sanitizeHtml(data)}"></span>`;
    }
    return data;
}

function renderTrace(data, type) {
    if (type === "display") {
        data = `<span class="show-trace" data-trace="${data.split("\n").map(l => sanitizeHtml(l)).join("||||")}"><u>Show</u></span>`;
    }
    return data;
}

function renderDebug(data, type, row) {
    if (type === "display") {
        data = `<span class="start-debug" data-href="${row.href}" data-debug="${data}"><u>Goto</u></span>`;
    }
    return data;
}

export {
    renderAlert,
    renderDate,
    renderHref,
    renderFrame,
    renderSink,
    renderData,
    renderTrace,
    renderDebug
}