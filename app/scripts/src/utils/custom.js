const { stringify } = require("./utils");
const storage = domlogger.func["Object.create"](null);

const waitForCreation = (obj, propertiesTree, info, globalContext, storageKey, isLastProp) => {
    var attr = propertiesTree[0];
    storageKey += "." + attr;

    // If the object is already hooked, add the new properties tree to the storage
    if (storage[storageKey]) {
        storage[storageKey].push({ propertiesTree, info, isLastProp, globalContext });
        return;
    }

    storage[storageKey] = [{ propertiesTree, info, isLastProp, globalContext }];
    domlogger.func["Object.defineProperty"](obj, attr, {
        get: function() {
            return undefined;
        },
        set: function(value) {
            // Need to first set the value for the hooking process
            delete obj[attr];
            obj[attr] = value;

            for (const { propertiesTree, info, isLastProp, globalContext } of storage[storageKey]) {
                // Sometimes, the object is set directly with linked properties, like x = { y: () => {} }. That's why the tree must be traversed again.
                domlogger.func["Array.prototype.shift"].call(propertiesTree);
                
                if (isLastProp) {
                    domlogger.hooks[info.type](info.type, info.tag, info.target, info.config, globalContext);
                } else {
                    traverseTree(obj[attr], propertiesTree, info, globalContext, storageKey);
                }
            }

            return obj[attr];
        },
        configurable: true
    });
}

const traverseTree = (start, properties, info, globalContext, storageKey) => {
    let currentObject = start;
    let propertiesTree = [...properties];

    while (propertiesTree.length > 0) {
        const prop = propertiesTree[0];
        if (!currentObject[prop]) {
            break;
        }

        currentObject = currentObject[prop];
        domlogger.func["Array.prototype.shift"].call(propertiesTree);
    }

    if (propertiesTree.length > 0) {
        waitForCreation(currentObject, propertiesTree, info, globalContext, storageKey, propertiesTree.length === 0);
    } else if (propertiesTree.length === 0) {
        domlogger.hooks[info.type](info.type, info.tag, info.target, info.config, globalContext);
    }

    return [ currentObject, propertiesTree ];
}

const proxyCustom = (type, tag, target, config, globalContext=window) => {
    var t = target;
    // Remove get:set: for hooking purpose
    if (type === "attribute") {
        var propProxy = domlogger.func["String.prototype.split"].call(target, ":");
        t = domlogger.func["Array.prototype.pop"].call(propProxy);
    }

    // Retrieving the target object "tree"
    var properties = domlogger.func["String.prototype.split"].call(t, ".");
    if (properties[0] === "window") {
        domlogger.func["Array.prototype.shift"].call(properties);
    }

    // When hooking custom object like window.DOMPurify.sanitize, we need to wait for window.DOMPurify to exist before hooking .sanitize.
    // 1. Retrive the first property wich doesn't exist.
    // 2. Create a "hooking loop"
    // 3. When the final property is set, hook it.
    traverseTree(globalContext, properties, {type, tag, target, config}, globalContext, stringify(globalContext));
}

module.exports = proxyCustom;
