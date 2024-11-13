await import("/challenges/checkSolve.js");

const scriptElement = document.createElement("script");
scriptElement.src = "data:,alert(':)')";
document.getElementById("challenge-html").appendChild(scriptElement);