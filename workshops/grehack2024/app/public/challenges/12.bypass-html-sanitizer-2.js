await import("/challenges/checkSolve.js");

await import("https://code.jquery.com/jquery-3.4.1.js");
const scriptElement = document.createElement("script");
scriptElement.src = "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.0.0/purify.min.js";
scriptElement.onload = () => {
    const html = new URLSearchParams(location.search).get("html");
    var clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true }});
    $("#challenge-html").html(clean);
}
document.getElementById("challenge-html").appendChild(scriptElement);
