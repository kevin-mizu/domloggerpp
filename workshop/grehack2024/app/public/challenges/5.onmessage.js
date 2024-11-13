await import("/challenges/checkSolve.js");

window.addEventListener("message", (e) => {
    if (e.data.log)
        console.log("[message]", e.data.log);
})

window.addEventListener("message", (e) => {
    // postMessage proxy -> Origin spoofing
    if (opener)
        opener.postMessage(e.data, "*");
})

window.addEventListener("message", (e) => {
    document.getElementById("challenge-html").innerText = e.data;
})

window.addEventListener("message", (e) => {
    // Invalid origin check
    if (e.origin.indexOf("http://localhost") !== -1) return;

    document.getElementById("challenge-html").innerHTML = e.data;
})

window.addEventListener("message", (e) => {
    if (e.data.html) {
        // Dangerous data usage
        document.getElementById("challenge-html").innerHTML = e.data.html;
    }
})