
'use strict';

module.exports = function(less) {

// ............................................................

    var tree       = less.tree,
        Expression = tree.Expression,
        Operation  = tree.Operation,
        Anonymous  = tree.Anonymous,
        Value      = tree.Value,
        Node       = tree.Node,
        isArray    = Array.isArray,
        builtinArithmEval;

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
            var n = arguments.length;
            if (n < 2)
                return arguments[0];

            var list = new Array(n);
            for (var i = 0; i < n; i++)
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

        reverse: function(list) {
            if (isArray(list.value)) {
                list.value = list.value.reverse();
            }

            return list;
        },

        // ....................................................

        _inspect: function(list, prefix, postfix) {
            prefix  = prefix  ? prefix.value  : "[";
            postfix = postfix ? postfix.value : "]";
            return new Anonymous(toString(list, prefix, postfix));
        }

        // ....................................................

    };
       
    less.functions.functionRegistry.addMultiple(functions);
    installVectorArithmetic();
    
// ............................................................
// helpers:

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
    
    function arithmEval(context) {
        // this = <tree.Operation object>
        // jshint validthis: true

        if (!context.isMathOn())
            return builtinArithmEval.call(this, context);
        
        var a = this.operands[0].eval(context),
            b = this.operands[1].eval(context),
            type, values, n;
            
        if (isArray(a.value)) {
            type   = a.type;
            a      = a.value;  
            n      = a.length; 
            values = a1bn; 
            if (isArray(b.value)) {
                b      = b.value;
                values = anbn;   
                if (n !== b.length) throw {
                    type:    "Evaluation",
                    message: "`" + this.op
                        + "` op, incompatible lists length ("
                        + n + " vs. " + b.length + ")"
                };
            }
        } else if (isArray(b.value)) {
            type   = b.type;
            b      = b.value;  
            n      = b.length;
            values = anb1;
        } else {
            return builtinArithmEval.call(this, context);    
        }

        var list = [], op = this.op, isSpaced = this.isSpaced;
        for (var i = 0; i < n; i++)
            list.push((new Operation(op,
                values(a, b, i), isSpaced)).eval(context));        
        
        return newLessList(list, type);
    }
    
    function a1bn(a, b, i) {return [a[i], b];}
    function anb1(a, b, i) {return [a,    b[i]];}
    function anbn(a, b, i) {return [a[i], b[i]];}
    
    // ........................................................
        
    function installVectorArithmetic() {
        // plugin.install can be used several times per Less session
        // (e.g. Grunt compiling multiple files per task), hence ensure
        // we hook to the real built-in instead of an earlier hook:
        var id = '__pluginListsArithm',
            p  = Operation.prototype;
        builtinArithmEval = p.eval;
        if (builtinArithmEval[id])
            builtinArithmEval = builtinArithmEval[id].builtin;
        p.eval     = arithmEval;
        p.eval[id] = {builtin: builtinArithmEval};
        
    }

// ............................................................

}; // ~ end of module.exports
