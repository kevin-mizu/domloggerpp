const { log, getConfig, getTargets, checkRegexs, execCode } = require("./utils");

const checkContent = (hook, type, target) => {
    const config = getConfig(hook, type, target);
    const [ obj, attr ] = getTargets(domlogger.func["String.prototype.split"].call(target, "."));
    var value = obj[attr];

    const keep = checkRegexs(target, config["match"], value, false);
    const remove = checkRegexs(target, config["!match"], value, false);

    if (keep && !remove) {
        value = execCode(target, config["hookFunction"], value);
        log(hook, type, target, value, config);
    }
}

module.exports = checkContent;
