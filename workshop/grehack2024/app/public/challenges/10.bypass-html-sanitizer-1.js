await import("/challenges/checkSolve.js");

await import("https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.7/purify.min.js");
const html = new URLSearchParams(location.search).get("html");
document.getElementById("challenge-html").innerHTML = DOMPurify.sanitize(html);

const scriptElement = document.createElement("script");
scriptElement.src = "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js";
scriptElement.onload = (e) => {
    M.FormSelect.init(document.querySelectorAll("select.materialize-select"));
}
document.getElementById("challenge-html").appendChild(scriptElement);