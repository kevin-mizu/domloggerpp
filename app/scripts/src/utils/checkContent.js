const { log, getConfig, getTargets, checkRegexs } = require("./utils");

const checkContent = (hook, type, target) => {
    const config = getConfig(hook, type, target);
    const [ obj, attr ] = getTargets(target.split("."));

    const keep = checkRegexs(config["match"], obj[attr], false);
    const remove = checkRegexs(config["!match"], obj[attr], false);

    if (keep && !remove) {
        log(hook, type, target, obj[attr], config);
    }
}

module.exports = checkContent;
