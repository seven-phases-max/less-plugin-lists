
'use strict';

module.exports = function(less, manager) {
    
// ............................................................

    var tree          = less.tree,
        Node          = tree.Node,
        Rule          = tree.Rule,
        Ruleset       = tree.Ruleset,
        Variable      = tree.Variable,
        Dimension     = tree.Dimension,
        isArray       = Array.isArray,
        scopeSelector = [new tree.Selector([new tree.Element('', '&')])];

// ............................................................

    function toArray(list) {
        return isArray(list.value) ? list.value : [list];    
    }

    function findFileInfo(node) {
        // Curently mixin definitions do not have index/fileInfo
        // so... let's try and force something from its rules (if any):
        // * for nested mixins it's usually `node.rules[0]`
        // * for global mixins it's usually `node.rules[0].rules[0]`
        while (node) {
            if ((node = (node.rules && node.rules[0])
                || node.node) && node.currentFileInfo) {
                    var fileInfo = node.currentFileInfo;
                    fileInfo.index = node.index;
                    return fileInfo;
            }
        }

        return {index: undefined};
    }
    
// ............................................................

    function Evaluator(node) {
        this.node = node; 
    }
    
    Evaluator.prototype = new Node();
    Evaluator.prototype.type = "ForEvaluator";
    Evaluator.prototype.evalFirst = true;
    Evaluator.prototype.accept = function(visitor) {
        this.node.rules = visitor.visitArray(this.node.rules);
    };
    
    Evaluator.prototype.eval = function(context) {
        var node  = this.node,
            args  = node.params,
            fileInfo = findFileInfo(node);

        // parse args:
        var n     = args.length,
            value = args[0],
            index = (n === 4) ? args[n - 3].name : "@__index",
            magic = args[n - 2],
            list  = args[n - 1],
            valid;

        valid = (n > 2) || (n < 5);
        valid = valid && magic && magic.value
            && (magic.value.value === "in");

        if (!valid) throw {
            type:    "Syntax",
            message: "[plugin-lists] unexpected .for-each parameters",
            index:    fileInfo.index,
            filename: fileInfo.filename
        };

        // apply:
        var result = [],
            rules  = node.rules;
        value = value.name;
        list  = toArray((new Variable(list.name,
            fileInfo.index, fileInfo)).eval(context));

        for (var i = 0; i < list.length; i++) {
            var push = true,
                iter = [new Rule(value, list[i]), 
                        new Rule(index, new Dimension(i + 1))];
                iter =  new Ruleset(scopeSelector, iter);

            if (node.condition) {
                var frames = context.frames;
                frames.unshift(iter[0], iter[1]);
                push = node.condition.eval(context);
                frames.shift(); frames.shift();
            }

            if (push) {
                Array.prototype.push.apply(iter.rules, rules); // iter.rules = iter.rules.concat(rules);
                result.push(iter);
            }
        }

        return (new Ruleset(scopeSelector, result)).eval(context);
    };

// ............................................................
    
    function Visitor() {
        this.native_ = new less.visitors.Visitor(this);
    }

    Visitor.prototype = {
        isPreEvalVisitor: true,
        isReplacing:      true,
        
        run: function(root) {
            return this.native_.visit(root);
        },
        
        visitMixinDefinition: function(node) {
            if (node.name === ".for-each")
                return new Evaluator(node);

            return node;
        },
    };
    
    manager.addVisitor(new Visitor());

// ............................................................

}; // ~ end of module.exports