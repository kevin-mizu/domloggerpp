// Making extension firefox & chrome compatible
const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

const sanitizeHtml = (str) => `${str}`.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;").replace(/"/g, "&quot;");

const unsanitizeHtml = (str) => `${str}`.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const applyFilter = (data, filterData, nbChar=20) => {
    // Avoid filter length pb on &amp;
    data = unsanitizeHtml(data);
    var output = {};

    if (filterData) {
        const index = data.toLowerCase().indexOf(filterData.toLowerCase()); // indexOf is case sensitive
        output["before"] = index-nbChar > 0 ? true : false;
        output["after"] = index+filterData.length+nbChar < data.length ? true : false;
        output["data"] = data.substring(index-nbChar, index+filterData.length+nbChar);
    } else if (data.length >= nbChar*2) {
        output["after"] = true;
        output["data"] = data.slice(0, nbChar*2);
    } else {
        output["data"] = data;
    }

    output["data"] = sanitizeHtml(output["data"]);
    return output;
}

const escapeRegExp = (reg) => {
    return reg.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
}

function getHighlightColor(backgroundColor, textColor) {
    function hexToRgb(hex) {
        let bigint = parseInt(hex.slice(1), 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;

        return { r, g, b };
    }

    function isCloseToRed({ r, g, b }) {
        return r > 150 && g < 100 && b < 100;
    }

    function isCloseToWhite({ r, g, b }) {
        return r > 200 && g > 200 && b > 200;
    }

    function isCloseToBlack({ r, g, b }) {
        return r < 50 && g < 50 && b < 50;
    }


    const bgRgb = hexToRgb(backgroundColor);
    const textRgb = hexToRgb(textColor);

    if (isCloseToRed(textRgb) && isCloseToWhite(bgRgb)) {
        return "#000000"; // black
    }

    if (isCloseToRed(textRgb) && isCloseToBlack(bgRgb)) {
        return "#FFFFFF"; // white
    }

    if (isCloseToRed(bgRgb) && isCloseToWhite(textRgb)) {
        return "#000000"; // black
    }

    if (isCloseToRed(bgRgb) && isCloseToBlack(textRgb)) {
        return "#FFFFFF"; // white
    }

    return "#FF0000"; // red
}

const cleanData = (data) => {
    data = data.replaceAll(" ", "&nbsp;");
    data = data.replaceAll("\t", "&#011;");
    data = data.replaceAll("\n", "<br>");
    data = data.replaceAll("\r", "<br>");
    return data;
}

const colorData = (data, filterData) => {
    const regex = new RegExp(sanitizeHtml(escapeRegExp(filterData)), "gi");
    data = data.replace(regex, `<span class="highlight">$&</span>`);
    return data;
}

const colorFilter = () => {
    const filterData = $("#filter-data").val();

    $(".show-data").each(function() {
        let data = $(this).attr("data-data");
        data = applyFilter(data, filterData);
        if (filterData) {
            data["data"] = colorData(data["data"], filterData);
        }
        data = `${data["before"] ? sanitizeHtml("<redacted>") : ""} ${data["data"]} ${data["after"] ? sanitizeHtml("<redacted>") : ""}`;
        $(this).html(`${data}<br><u>View more</u>`);
    });
}

const getLink = (debugLine) => {
    var link = "#";
    if (debugLine && extensionAPI === chrome) {
        debugLine = debugLine.split("(").pop().slice(0, -1);
    } else if (debugLine) {
        debugLine = debugLine.split("@")[1];
    }
    link = debugLine.split(":").slice(0, -2).join(":");
    return link;
}

const downloadData = (filename, data) => {
    var e = document.createElement("a");
    e.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
    e.setAttribute("download", filename);
    e.style.display = "none";
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
}

export {
    sanitizeHtml,
    unsanitizeHtml,
    applyFilter,
    getHighlightColor,
    colorData,
    cleanData,
    colorFilter,
    getLink,
    downloadData
}