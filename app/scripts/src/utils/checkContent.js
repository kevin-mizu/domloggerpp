const { log, getConfig, getTargets, checkRegexs } = require("./utils");

const checkContent = (hook, type, target) => {
    const config = getConfig(hook, type, target);
    const [ obj, attr ] = getTargets(target.split("."));
    value = JSON.stringify(obj[attr]);

    const keep = checkRegexs(config["match"], value, false);
    const remove = checkRegexs(config["!match"], value, false);

    if (keep && !remove) {
        log(hook, type, target, value, config);
    }
}

module.exports = checkContent;
