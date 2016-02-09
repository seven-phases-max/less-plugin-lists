
'use strict';

module.exports = ThisPlugin;

function ThisPlugin() {}

ThisPlugin.prototype = {
    install: function(less, manager) {
        require("./main")(less, manager);
    }
};
/*
ThisPlugin.prototype = {
    install: function(less, pluginManager) {
        less.functions.functionRegistry
            .addMultiple(require("./main")(less));
    }
};*/
