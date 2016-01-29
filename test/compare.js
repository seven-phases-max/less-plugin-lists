
module.exports = function (grunt) { return function() {

    var jsdiff = require('diff'),
        files = grunt.file.expandMapping(
            grunt.config.get('compare.src'),
            grunt.config.get('compare.dest'),
            {flatten: true});

    var ret = files.every(function(file) {
        var src = file.src[0],
            dst = file.dest;
        if (!grunt.file.exists(dst)) {
            grunt.log.error((dst + " not found.").red);
            return false;
        }

        var left  = grunt.file.read(dst),
            right = grunt.file.read(src);
        if (left === right) {
            grunt.log.ok((src + " - ok").green);
            return true;
        }

        grunt.log.writeln();
        var diff = jsdiff.diffLines(left, right),
            line = 0;
        diff.every(function(part, i) {
            line += part.count;
            if (part.added || part.removed) {
                grunt.log.error((src + " error at L" + line + ":").red);
                grunt.log.write(part.value.green);
                part = diff[i + 1];
                grunt.log.write(part.value.red);
                return false;
            }
            return true;
        });

        return false;
    });

    grunt.log.writeln();
    return ret;

};};
