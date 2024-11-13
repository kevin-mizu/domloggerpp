const original = window.alert;
window.alert = new Proxy(window.alert, {
    apply: function(t, thisArg, args) {
        postMessage({ solved: true }, "*");
        return Reflect.apply(original, thisArg, args);
    }
});