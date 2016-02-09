
module.exports = function(less) {

    var tree       = less.tree,
        Expression = tree.Expression,
        Anonymous  = tree.Anonymous,
        Keyword    = tree.Keyword,
        Value      = tree.Value,
        Node       = tree.Node,
        mergeRules = less.visitors.ToCSSVisitor.prototype._mergeRules,
        isArray    = Array.isArray;

    // ........................................................

    function newLessList(list, type) {
        var ReturnType = (type === "Expression")
            ? Expression : Value;
        return new ReturnType(list);
    }

    // ........................................................

    function toString(list, pre, post) {
        return !isArray(list.value) ? list.toCSS()
            : pre + list.value.map(function(a) {
                return toString(a, pre, post);
            }).join(list.type === "Expression"
                ? " " : ", ") + post;
    }

    // ........................................................

    function evalIndex(list, index, default_) {
        if (index && ((index.type !== "Dimension") ||
            !index.unit.isEmpty())) throw {
                type:    "Argument",
                message: "unexpected index `" + index.toCSS() + "`"
        };

        index = (index === undefined)
            ? default_ : index.value;
        return index + ((index < 1)
            ? list.value.length : -1);
    }

    // ........................................................

    function atKey(list, index) {
        if (!isArray(list.value))
            return;

        // see docs/impl-notes.md#at-1
        list = (!isArray(list.value[0].value) &&
            (list.type === "Expression"))
                ? [list] : list.value;

        var pair, type, key;
        for (var i = 0; i < list.length; i++) {
            pair = list[i];
            // return empty thing if value is missing but key matches:
            if (!isArray(pair) &&
                (Node.compare(index, pair) === 0))
                    return new Node();

            type = pair.type;
            pair = pair.value;
            key  = pair[0];
            if (Node.compare(index, key) === 0)
                return (pair.length < 2) ? pair[1]
                    : newLessList(pair.slice(1), type);
        }
    }

// ............................................................

    var functions = {

        // ....................................................

        at: function(list, index) {
            if ((index.type !== "Dimension") ||
                 !index.unit.isEmpty())
                    return atKey(list, index);

            list = isArray(list.value)
                ? list.value : [list];
            return list[index.value - 1];
        },

        // ....................................................

        cat: function() {
            var returnType, list = [];
            for (var i = 0; i < arguments.length; i++) {
                var arg = arguments[i];
                if (isArray(arg.value)) {
                    returnType = returnType || arg.type;
                    arg = arg.value;
                }
                list = list.concat(arg);
            }

            return newLessList(list, returnType);
        },

        // ....................................................

        l: function() {
            if (arguments.length < 2)
                return;

            var list = new Array(arguments.length);
            for (var i = 0; i < arguments.length; i++)
                list[i] = arguments[i];
            return new Value(list);
        },

        // ....................................................

        slice: function(list, start, end) {
            if (list && isArray(list.value)) {
                start = evalIndex(list, start, 1);
                end   = evalIndex(list, end, 0);

                // see docs/impl-notes.md#slice-1
                return newLessList(list.value
                    .slice(start, end), list.type);
            }
        },

        // ....................................................

        splice: function(list, start, end, value) {
            if (list && isArray(list.value)) {
                start = evalIndex(list, start, 1);
                end   = evalIndex(list, end, start + 2) - start;

                var copy = list.value.slice();
                value // jshint expr: true
                    ? copy.splice(start, end, value)
                    : copy.splice(start, end);
                return newLessList(copy, list.type);
            }
        },

        // ....................................................

        flatten: function(list, type) {
            if (!isArray(list.value))
                return list;

            function flatten_(list) {
                return list.reduce(function(a, b) {
                    return a.concat(isArray(b.value)
                        ? flatten_(b.value) : b);
                }, []);
            }

            // TODO: should not it try to determine the default return type by the type
            // of the input list top dimension? (for consistency with `cat`?)

            var ReturnType = type ? {
                comma: Value,
                space: Expression,
                ",":   Value,
                " ":   Expression
            }[type.value] : Value;

            if (!ReturnType) throw {
                type:    "Argument",
                message: "invalid `" + type.toCSS()
                    + "` delimiter. Expected `comma`, `space`, `,` or ` `\n"
            };

            return new ReturnType(flatten_(list.value));
        },

        // ....................................................

        transpose: function(list) {
            if (!isArray(list.value))
                return list;

            var listType, row, rowType;
            rowType  = list.type;
            list     = list.value;
            listType = list[0].type;
            row      = list[0].value;

            list = (isArray(row) ? row : [row]).map(function(col, i) {
                return newLessList(list.map(function(row) {
                    return (isArray(row.value)
                        ? row.value : [row])[i]
                            || new Node();
                }), rowType);
            });

            return newLessList(list, listType);
        },

        // ....................................................

        join: function(list, delim) {
            return new Anonymous(!isArray(list.value)
                ? list.toCSS()
                : list.value.map(function(a) {
                    return toString(a, "", "");
                }).join(delim ? delim.value : ", "));
        },
        
        // ....................................................

        "to-list": function(obj) {
            // it's actually questionable if we should fully evaluate DR here at all
            // but we must evaluate (at least partially) and merge property names   
            var list  = [], 
                rules = obj.callEval(this.context).rules;
            mergeRules(rules);
            for (var i = 0; i < rules.length; i++) {
                var rule = rules[i];
                if (rule.type === "Rule") {
                    // console.log([rule.name, rule.value]);
                    list.push(new Expression([new Keyword(rule.name
                        .slice(rule.variable)), rule.value]));
                }
            }

            return new Value(list);
        },

        // ....................................................

        _inspect: function(list, prefix, postfix) {
            prefix  = prefix  ? prefix.value  : "[";
            postfix = postfix ? postfix.value : "]";
            return new Anonymous(toString(list, prefix, postfix));
        }

        // ....................................................

    };

    return functions;

// ............................................................

};
