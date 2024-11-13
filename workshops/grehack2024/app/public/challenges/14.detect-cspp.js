await import("/challenges/checkSolve.js");

function parseQueryParams(queryString) {
    const result = {};
    new URLSearchParams(queryString).forEach((value, key) => {
      key.split(/\[|\].?/).reduce((acc, k, i, keys) =>
        acc[k] = acc[k] || (i === keys.length - 1 ? value : isNaN(keys[i + 1]) ? {} : []), result);
    });
    return result;
}

const params = parseQueryParams(location.search);
if (window.isSolved) alert(":)")
