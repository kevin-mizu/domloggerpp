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
    extensionAPI.storage.local.get("colorsData", (data) => {
        if (data.colorsData) {
            window.colorsData = data.colorsData;
        } else {
            window.colorsData = {
                textColor: "#C6C6CA",
                backgroundColor: "#292A2D"
            }
        }
        var root = document.documentElement;
        root.style.setProperty("--text-color", window.colorsData["textColor"]);
        root.style.setProperty("--background-color", window.colorsData["backgroundColor"]);
        root.style.setProperty("--highlight-color", getHighlightColor(window.colorsData["backgroundColor"], window.colorsData["textColor"]));
        document.body.style.opacity = "1";
    });
}

const initButtons = () => {
    extensionAPI.storage.local.get("hooksData", (data) => {
        if (data.hooksData) {
            window.hookKeys = Object.keys(data.hooksData.hooksSettings[data.hooksData.selectedHook].content["hooks"]);
        } else {
            window.hookKeys = [];
        }
        $("#filter-buttons").html(`
        <button class="filter-button" data-filter="All" style="background-color: var(--text-color); color: var(--background-color)"><b>ALL</b></button>
        ${window.hookKeys.map(k => `<button class="filter-button" data-filter="${k.toUpperCase()}"><b>${k.toUpperCase()}</b></button>`).join(" ")}
        `)
        $(".filter-button").on("click", handleFilterButton);
    })
}

const initTable = () => {
    window.colIds = [ "dupKey", "type", "alert", "date", "href", "frame", "sink", "data", "trace", "debug" ];
    window.table = $("#table").DataTable({
        order: [[window.colIds.indexOf("date"), "desc"]],
        paging: true,
        scrollCollapse: true,
        scrollY: "600px",
        data: [],
        search: {
            smart: false
        },
        columnDefs: [{ 
            targets: [window.colIds.indexOf("dupKey"), window.colIds.indexOf("type")],
            visible: false,
            searchable: true
        }],
        columns: [
            { data: "dupKey", render: $.fn.dataTable.render.text() }, // Avoid datatable DOM Based XSS...
            { data: "type", render: $.fn.dataTable.render.text() },
            { data: "badge", render: renderAlert},
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
    window.init = init;
    initColors();
    initButtons();
    initTable();
}

window.addEventListener("DOMContentLoaded", main);
