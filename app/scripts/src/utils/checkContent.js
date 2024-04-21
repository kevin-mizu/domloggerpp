const { log, getConfig, getTargets, checkRegexs, execCode } = require("./utils");

const checkContent = (hook, type, target) => {
    const config = getConfig(hook, type, target);
    const [ obj, attr ] = getTargets(target.split("."));
    var value = obj[attr];

    const keep = checkRegexs(config["match"], value, false);
    const remove = checkRegexs(config["!match"], value, false);

    if (keep && !remove) {
        value = execCode(config["hookFunction"], value);
        log(hook, type, target, value, config);
    }
}

module.exports = checkContent;
