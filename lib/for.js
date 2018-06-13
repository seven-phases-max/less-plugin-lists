
'use strict';

var abs       = Math.abs,
    sign      = Math.sign,
    floor     = Math.floor,
    isArray   = Array.isArray,
    pushArray = Array.prototype.push;

// ............................................................

module.exports = function(less, manager) {
    
// ............................................................

    var tree          = less.tree,
        Node          = tree.Node,
        Rule          = tree.Rule || tree.Declaration,
        Ruleset       = tree.Ruleset,
        Variable      = tree.Variable,
        Dimension     = tree.Dimension,
        scopeSelector = [new tree.Selector([new tree.Element('', '&')])];

// ............................................................

    function ForEachEvaluator(node) {
        this.node = node; 
    }
    
    ForEachEvaluator.prototype = new Node();
    ForEachEvaluator.prototype.type = 'ForEachEvaluator';
    ForEachEvaluator.prototype.evalFirst = true;
    ForEachEvaluator.prototype.accept = function(visitor) {
        this.node.rules = visitor.visitArray(this.node.rules);
    };

    ForEachEvaluator.prototype.eval = function(context) {
        var node     = this.node,
            args     = node.params,
            n        = args.length,
            fileInfo = findFileInfo(node);

        // parse args:

        assert((n > 2) && (n < 5), '.for-each', fileInfo);
        var values,
            value = args[0].name,
            index = (n === 4) ? args[n - 3].name : '@__index',
            magic = args[n - 2],
            list  = args[n - 1];

        assert(magic && magic.value && (magic.value.value === 'in')
            && list.name, '.for-each', fileInfo);

        if (!list.value) {
            list.value = new Variable(list.name, fileInfo.index, fileInfo);
            list.name = '@__list'; // fixme, not a good idea to pollute iter scope with "hidden" vars
                                   // same for '@__index' above, TODO
        }

        values = list.value.eval(context);
        list = new Rule(list.name, values);
        values = toArray(values);

        // apply:

        var result = [];
        for (var i = 0; i < values.length; i++) {
            var vars = [new Rule(value, values[i]),
                        new Rule(index, new Dimension(i + 1)), list];
            evalIteration(result, context, node, vars);
        }

        return (new Ruleset(scopeSelector, result)).eval(context);
    };
    
// ............................................................

    function ForEvaluator(node) {
        this.node = node; 
    }
    
    ForEvaluator.prototype = new Node();
    ForEvaluator.prototype.type = 'ForEvaluator';
    ForEvaluator.prototype.evalFirst = true;
    ForEvaluator.prototype.accept = function(visitor) {
        this.node.rules = visitor.visitArray(this.node.rules);
    };

    ForEvaluator.prototype.eval = function(context) {
        var node     = this.node,
            args     = node.params,
            fileInfo = findFileInfo(node);

        // parse args:

        assert(args.length === 2, '.for', fileInfo);
        var index = args[0],     // required
            start = index.value, // optional
            count = args[1],     // optional; fixme: it's 'endName' actually - not 'count'
            end   = count.value, // required
            step, unit;

        assert(end, '.for', fileInfo);
        index = index.name;
        start = start ? start.eval(context) : new Dimension(1);
        count = count.name || '@__end';
        end   = end.eval(context);

        // In theory it does not have to be a Dimension
        // Could be a Color, Array etc. But that barely
        // will be worth impl. complexity, so:
        assert((start.type === 'Dimension')
            && (end.type   === 'Dimension'), '.for', fileInfo);
        unit  = start.unit;
        count = new Rule(count, new Dimension(end.value, end.unit));
        start = start.value;
        end   = end.value;
        step  = sign(end - start) > 0 ? +1 : -1;

        // apply:

        var result = [],
            n = floor(abs(end - start + step)),
            i = 0;
        while (0 < n--) {
            var vars = new Dimension(start + step * i++, unit);
            evalIteration(result, context, node,
                [new Rule(index, vars), count]);
        }

        return (new Ruleset(scopeSelector, result)).eval(context);
    };
    
// ............................................................

function evalIteration(result, context, node, vars) {
    var iter = new Ruleset(scopeSelector, vars),
        push = true;

    if (node.condition) {
        var frames = context.frames;
        iter.functionRegistry = frames[0].functionRegistry;
        // ^ fixme: dirty kludge, not sure if it's related 
        // to #3054 - maybe there's more mistery (needs research)
        frames.unshift(iter);
        push = node.condition.eval(context);
        frames.shift();
    }

    if (push) {
        pushArray.apply(iter.rules, node.rules);
        result.push(iter);
    }
}

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
            if (node.name === '.for')
                return new ForEvaluator(node);
            if (node.name === '.for-each')
                return new ForEachEvaluator(node);

            return node;
        },
    };
    
    manager.addVisitor(new Visitor());

// ............................................................

}; // ~ end of module.exports

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

function error(msg, fileInfo) {
    throw {
        type:    'Syntax',
        message: '[plugin-lists] unexpected ' + msg + ' parameters',
        index:    fileInfo.index,
        filename: fileInfo.filename
    };    
}

function assert(condition, msg, fileInfo) {
    return condition || error(msg, fileInfo);
}
