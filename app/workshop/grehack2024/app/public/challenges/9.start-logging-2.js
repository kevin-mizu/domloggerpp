await import("/challenges/checkSolve.js");

await import("https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.7/purify.min.js");
const html = new URLSearchParams(location.search).get("html");
var clean = DOMPurify.sanitize(html);
document.getElementById("challenge-html").innerHTML = clean;

// Creating some noise :D
const scriptElement = document.createElement("script");
scriptElement.src = "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js";
scriptElement.onload = (e) => {
    M.FormSelect.init(document.querySelectorAll("select.materialize-select"));
}
document.getElementById("challenge-html").appendChild(scriptElement);

// The sink you need to use to XSS.
document.getElementById("challenge-html").innerHTML = document.querySelector(".debug").dataset.help;