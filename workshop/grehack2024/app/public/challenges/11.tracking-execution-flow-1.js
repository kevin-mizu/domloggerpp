const params = new URLSearchParams(location.search);
var div = document.getElementById("challenge-html");
var html = params.get("html").replace(/</g, "").replace(/>/g, "");

// This if condition is just to make sure you do the exercice properly :p
if (!html.includes("ded56df")) {
    div.innerHTML = html;
    var text = div.innerText;
    div.innerHTML = text;
}
