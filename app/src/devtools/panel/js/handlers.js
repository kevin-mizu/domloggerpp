// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

import {
    getLink,
    downloadData,
    colorFilter,
    cleanData,
    colorData,
    unsanitizeHtml
} from "./utils.js"

// Handle table events
function handleTableRedraw() {
    colorFilter();
}

// Show modal events
function handleShowData() {
    const filterData = $("#filter-data").val();
    const data = $(this).attr("data-data");
    $("#modal-content").html(`
    <span class="close">&times;</span>
    <h3 class="mgb-30">Data passed into the sink</h3>
    <div style="text-align:left">
        <p>${filterData ? colorData(cleanData(data), filterData) : cleanData(data)}</p>
    </div>`);
    $("#modal").css("display", "block");
}

function handleShowTrace() {
    const dataTrace = $(this).data("trace").split("||||");
    $("#modal-content").html(`
    <span class="close">&times;</span>
    <h3 class="mgb-30">Stack trace</h3>
    ${dataTrace.map(l => `<p><a href="#" class="no-deco open-view-source" data-url="${getLink(l)}" target="_blank">${l}</a></p>`).join("")}
    `);
    $("#modal").css("display", "block");

    // Chromium blocks a tag to open view-source link from extension's devtools
    $(".open-view-source").on("click", function(e) {
        e.preventDefault();
        const url = "view-source:" + $(this).data("url");
        // Firefox block extensionAPI.tabs.create in devtools
        extensionAPI.runtime.sendMessage({ action: "openURL", data: url, tabId: extensionAPI.devtools.inspectedWindow.tabId });
    });
}

// Modal events
function handleCloseModal() {
    $("#modal").css("display", "none");
}

function handleOutModal(event) {
    if (event.target == $("#modal")[0]) {
        $("#modal").css("display", "none");
    }
}

// Filter events
function handleFilterButton() {
    $(".filter-button").css("color", "var(--text-color)");
    $(".filter-button").css("background-color", "var(--background-color)");
    $(this).css("color", "var(--background-color)");
    $(this).css("background-color", "var(--text-color)");
    var filterData = $(this).data("filter");

    if (filterData == "All") {
        window.table.column(window.tableConfig.colIds.indexOf("type")).search("");
    } else {
        window.table.column(window.tableConfig.colIds.indexOf("type")).search(filterData);
    }
    window.table.draw();
}

function handleFilterData() {
    const filterData = $(this).val();
    const colId = window.tableConfig.colIds.indexOf("data");

    window.table.column(colId).search(filterData, false, false);
    window.table.draw();
}

function handleAdvancedSearch(event) {
    event.preventDefault();
    const filters = this.filters.value.split(";");

    window.table.columns().every( function() {
        if (window.tableConfig.colIds[this.index()] !== "data")
            this.search('');
    });
    for (const f of filters) {
        var [ key, value ] = f.split("=");
        if (value && window.tableConfig.colIds.indexOf(key) !== -1 && key !== "data")
            window.table.column(window.tableConfig.colIds.indexOf(key)).search(value);
    }

    table.draw();
}

function handleFilterSpan() {
    var filterData = $(this).text() === window.table.search() ? "" : $(this).text();
    window.table.search(filterData);
    window.table.draw();
}

// Debug events
function handleStartDebug() {
    var debugCanary = $(this).data("debug");
    var debugHref = $(this).data("href");
    extensionAPI.runtime.sendMessage({
        action: "debugSink",
        tabId: extensionAPI.devtools.inspectedWindow.tabId,
        url: debugHref,
        canary: debugCanary
    })
}

function handleRedirection() {
    var debugHref = $(this).data("href").replaceAll("'", "\\'");
    extensionAPI.runtime.sendMessage({
        action: "debugSink",
        tabId: extensionAPI.devtools.inspectedWindow.tabId,
        url: debugHref,
        canary: false
    })
}

// Misc events
function handleRemoveRow() {
    table.row($(this).parents("tr")).remove();
    extensionAPI.runtime.sendMessage({ action: "removeRow", data: $(this).attr("data-dupKey") });
    table.draw();
}

// Buttons events
function handleImportClick() {
    $("#importFile").click();
}

function handleImport(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        var data = {};
        try {
            data = JSON.parse(e.target.result);
        } catch {}

        // Sending data to background script to avoid duplicates
        for (var l of data) {
            if (l.date && l.href && l.type && l.frame && l.sink && l.data && l.trace && l.debug) {
                l["import"] = true;
                extensionAPI.runtime.sendMessage({ data: l });
            }
        }
    }
    reader.readAsText(file);
}

function handleClear() {
    window.table.clear().draw();
    extensionAPI.runtime.sendMessage({ action: "clearStorage" });
}

function handleExport() {
    var data = window.table.rows().data().toArray();

    // Unsanitize data HTML before exporting (check background.js)
    for (let i=0; i<data.length; i++) {
        data[i].data = unsanitizeHtml(data[i].data);
    }

    data = JSON.stringify(data, null, 2);
    downloadData("export.json", data);
}

function handleSettingsNavigation() {
    extensionAPI.runtime.sendMessage({ action: "openSettings" });
}

export {
    // Table
    handleTableRedraw,
    // Show modal
    handleShowData,
    handleShowTrace,
    // Modal
    handleCloseModal,
    handleOutModal,
    // Filter
    handleFilterData,
    handleFilterButton,
    handleAdvancedSearch,
    handleFilterSpan,
    // Debug
    handleStartDebug,
    handleRedirection,
    // Misc
    handleRemoveRow,
    // Buttons
    handleImportClick,
    handleImport,
    handleClear,
    handleExport,
    handleSettingsNavigation
}