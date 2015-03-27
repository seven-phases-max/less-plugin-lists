
function LessPluginLists(options) {
    this.options = options;
}

LessPluginLists.prototype = {
    install: function(less, pluginManager) { // jshint unused: false
        less.functions.functionRegistry
            .addMultiple(require("./functions")(less));
    }
};

module.exports = LessPluginLists;
