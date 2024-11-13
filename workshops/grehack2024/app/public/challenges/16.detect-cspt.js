await import("/challenges/checkSolve.js");

fetch(location.pathname).then(d => d.text()).then((d) => {
    document.getElementById("challenge-html").innerHTML = d;
})