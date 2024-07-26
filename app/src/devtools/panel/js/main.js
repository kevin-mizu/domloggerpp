// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

import {
    renderAlert,
    renderDate,
    renderHref,
    renderFrame,
    renderSink,
    renderData,
    renderTrace,
    renderDebug
} from "./render.js";

import {
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
    handleRedirection,
    handleStartDebug,
    // Fullscreen
    handleFullscreen,
    // Misc
    handleRemoveRow,
    // Buttons
    handleImportClick,
    handleImport,
    handleClear,
    handleExport,
    handleSettingsNavigation
} from "./handlers.js";

import {
    getHighlightColor
} from "./utils.js";

const initColors = () => {
    window.colorsData = {
        textColor: "#C6C6CA",
        backgroundColor: "#292A2D"
    }
    extensionAPI.storage.local.get("colorsData", (data) => {
        if (data.colorsData) {
            window.colorsData = data.colorsData;
        }
        var root = document.documentElement;
        root.style.setProperty("--text-color", window.colorsData["textColor"]);
        root.style.setProperty("--background-color", window.colorsData["backgroundColor"]);
        root.style.setProperty("--highlight-color", getHighlightColor(window.colorsData["backgroundColor"], window.colorsData["textColor"]));
        document.body.style.opacity = "1";
    });
}

const initButtons = () => {
    window.hookKeys = [];
    extensionAPI.storage.local.get("hooksData", (data) => {
        if (data.hooksData) {
            window.hookKeys = Object.keys(data.hooksData.hooksSettings[data.hooksData.selectedHook].content["hooks"]);
        }
        $("#filter-buttons").html(`
        <button class="filter-button" data-filter="All" style="background-color: var(--text-color); color: var(--background-color)"><b>ALL</b></button>
        ${window.hookKeys.map(k => `<button class="filter-button" data-filter="${k.toUpperCase()}"><b>${k.toUpperCase()}</b></button>`).join(" ")}
        `)
        $(".filter-button").on("click", handleFilterButton);
    })
}

const updateUITable = () => {
    // When using window.table.colReorder.order to update order, it uses the current col order as a reference
    var updateOrder  = [];
    var currentOrder = window.table.colReorder.order();
    for (const c of window.tableConfig.colOrder) {
        updateOrder.push(currentOrder.indexOf(c));
    }

    // Devtools table has one more column for row deletion
    updateOrder.push(11);
    window.table.colReorder.order(updateOrder);
    currentOrder = window.table.colReorder.order();

    for (const colName of window.tableConfig.colIds) {
        var colVisibility = window.tableConfig.colVisibility[colName];
        var colIndex = currentOrder.indexOf(window.tableConfig.colIds.indexOf(colName));

        if (colVisibility !== window.table.column(colIndex).visible()) {
            window.table.column(colIndex).visible(colVisibility);
        }
    }
    window.table.columns.adjust().draw();
}

const initTable = () => {
    window.tableConfig = {
        colIds: [ "dupKey", "type", "alert", "hook", "date", "href", "frame", "sink", "data", "trace", "debug" ],
        colVisibility: {
            "dupKey": false, "type": false, "alert": true, "hook": false, "date": true, "href": true, "frame": true, "sink": true, "data": true, "trace": true, "debug": true
        },
        colOrder: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
    }
    extensionAPI.storage.local.get("tableConfig", (data) => {
        if (data.tableConfig) {
            window.tableConfig = data.tableConfig;
        }
        updateUITable();
    });

    window.table = $("#table").DataTable({
        order: [[window.tableConfig.colIds.indexOf("date"), "desc"]],
        colReorder: true,
        paging: true,
        scrollCollapse: true,
        scrollY: "600px",
        data: [],
        search: {
            smart: false
        },
        columnDefs: [{ 
            targets: [window.tableConfig.colIds.indexOf("dupKey"), window.tableConfig.colIds.indexOf("type")],
            visible: false,
            searchable: true
        }],
        columns: [
            { data: "dupKey", render: $.fn.dataTable.render.text() }, // Avoid datatable DOM Based XSS...
            { data: "type", render: $.fn.dataTable.render.text() },
            { data: "badge", render: renderAlert},
            { data: "hook", render: $.fn.dataTable.render.text() },
            { data: "date", render: renderDate},
            { data: "href", render: renderHref},
            { data: "frame", render: renderFrame},
            { data: "sink", render: renderSink},
            { data: "data", render: renderData},
            { data: "trace", render: renderTrace},
            { data: "debug", render: renderDebug},
            { title: "", data: null, orderable: false, render: (data, type, row) => { return `<span data-dupKey="${row.dupKey}" class="remove-one">&times;</span>` }}
        ],
        drawCallback: handleTableRedraw
    });

    // Show modal
    $("#table").on("click", ".show-data", handleShowData);
    $("#table").on("click", ".show-trace", handleShowTrace);

    // Modal event
    $("#modal-content").on("click", ".close", handleCloseModal);
    window.onclick = handleOutModal;

    // Debug
    $("#table").on("click", ".goto-link", handleRedirection);
    $("#table").on("click", ".start-debug", handleStartDebug);

    // Fullscreen
    $("#fullscreen").on("click", handleFullscreen);

    // Filters
    $("#filter-data").on("keyup", handleFilterData);
    $("#advanced-search").on("submit", handleAdvancedSearch);
    $("#table").on("click", ".filter-span", handleFilterSpan);

    // Remove line
    $("#table").on("click", ".remove-one", handleRemoveRow);

    // Buttons
    $("#import").on("click",handleImportClick);
    $("#importFile").on("change", handleImport);
    $("#remove").on("click",handleClear);
    $("#export").on("click",handleExport);
    $("#settings").on("click", handleSettingsNavigation);
}

const handleMessage = (data) => {
    let table = $("#table").DataTable();
    table.row.add(data);
    table.draw();
}

const init = (data) => {
    let table = $("#table").DataTable();
    table.rows.add(data);
    table.draw();
}
const main = async () => {
    window.handleMessage = handleMessage;
    window.initButtons = initButtons;
    window.initColors = initColors;
    window.updateUITable = updateUITable;
    window.init = init;
    initColors();
    initButtons();
    initTable();

    // Handle storage updates
    extensionAPI.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local") {
            for (const [key, values] of Object.entries(changes)) {
                switch (key) {
                    case "hooksData":
                        window.initButtons();
                        break;
                    case "colorsData":
                        window.initColors();
                        break;
                    case "tableConfig":
                        window.tableConfig = values.newValue;
                        window.updateUITable();
                        break;
                }
            }
        }
    })
}

const resize = () => {
    if (window.table)
        window.table.columns.adjust().draw();
}

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("resize", resize);
