
## Advanced `.for` and `.for-each` Details and Usage

  - [**Syntax and name conflicts**](#syntax-and-name-conflicts)
  - [**Scope**](#scope)
  - [**Lazy-Evaluation**](#lazy-evaluation)
  - [**Guards**](#guards)
  - [**Using with the Functions plugin**](#using-with-the-functions-plugin)
  - [**Non-integer counters**](#non-integer-counters)
  - [**Counters with units**](#counters-with-units)
  - [**Defining mixins quirk**](#defining-mixins-quirk)
  - [**Arin Scrivenor and the remanent magnetization**](#arin-scrivenor-and-the-remanent-magnetization)

---------------------------------------------------------------
### Syntax and name conflicts

If you did not notice yet, both `.for` and `.for-each` statements look exactly like a mixin definition. And in fact they *are* just an ordinal mixin definitions. The only difference is thats instead of being explicitly invoked by your code, they are evaluated by this plugin automatically. 

This obviously means that you can't use `.for/.for-each` identifiers for parametric mixins of your own, otherwise the plugin will try to invoke them and fail.

On the other hand, a regular CSS rulesets named this way won't cause any conflicts:
```less
.for {
    me: is not a loop;
}

.for-each {
    me: is not a loop either;
}
```
Both will compile just fine.

---------------------------------------------------------------
### Scope

While the loop statements are defined as regular mixins, there's important difference in how they are evaluated. For instance, when you invoke/call a regular Less mixin, it exposes all of its body statements to an outer ("caller") scope. In contrast, `.for*` iterations keep their scope completely isolated from outer scopes and even from each other.

I.e. any Less object defined in the iteration statement body remains visible *only* within this body and nowhere else. This means that you can't use the loop statements to create/generate any Less own objects (i.e. variables, mixins or functions). For example:
```less
div {
    .for(@i, 3) {
        @var: 42;
    }

    result: @var; // Error: variable @var is undefined
}

span {
    .for(@i, 3) {
        .mixin() {
            color: red;
        }
    }

    .mixin(); // Error: .mixin is undefined
}

// etc.
```
This is an intentional restriction to prevent various pitfalls, misuses and abuses that would arise if code like above can work. (Such draconish scope rules, in less or more varying details, are also planned for future Less versions (most likely after 3.x), so start preparing right now).
In other words, the loop statements of this plugin are primarily (in the simplest case) meant to generate/emit a CSS code (i.e. CSS rulesets, properties, at-rules etc.), they are not meant to be used as "macros" to emit Less code/objects.

You *can* however use these loop statements to create new Less *values* (to be assigned to an outer scope variable for example) with the little help of the `less-plugin-functions` (see [Using with Functions plugin](#using-with-the-functions-plugin) section below).

---------------------------------------------------------------
### Lazy-Evaluation

All variables within the iteration statements follow standard Less [Lazy-Evaluation](http://lesscss.org/features/#variables-feature-lazy-loading) rules. It's important to keep this in mind when crafting a code involving indirect variable values:
```less
@index: 33;
@some: @index;

.for(@index, 4) {
    @{index}: @some;
}
```
result:
```css
1: 1;
2: 2;
3: 3;
4: 4;
```

For more details on the Lazy-Evaluation principle and why it's important to understand see:
  * [The World’s Most Misunderstood CSS Pre-processor](https://getcrunch.co/2015/10/08/less-the-worlds-most-misunderstood-css-pre-processor/)
  * [Variable semantics](https://www.earthli.com/news/view_article.php?id=2965)

---------------------------------------------------------------
### Guards

Both `.for` and `.for-each` statements may have [Guards](http://lesscss.org/features/#mixin-guards-feature). A guard statement is evaluated on each iteration, for example:
```less
@fruit: banana apple pear potato carrot peach;

.for-each(@value, @index in @fruit)
    when (@index > 3) {
        not-always-fruit+: @value;
}
```
results in:
```css
not-always-fruit: potato, carrot, peach;
```
Notice a false guard does not stop the loop but only makes the current iteration to be skipped.

Another example (filtering non-numeric list values):
```less
@chaos: 4 banana apple 3 2 pear 1 peach;

.for-each(@x in @chaos) when (isnumber(@x)) {
    order+: @x;
}
```
result:
```css
order: 4, 3, 2, 1;
```

---------------------------------------------------------------
### Using with the Functions plugin

As mentioned earlier in [Scope](#scope) section, you can't use a variable(s) defined within the loop iteration anywhere except the iteration body itself. But in many cases we *do* need a value created in the loop to be passed to an outer code for further manipulation/usage.

This is where the [Functions](https://github.com/seven-phases-max/less-plugin-functions) plugin comes to the rescue:

#### Get index of the specified element in a list
```less
.function-index-of(@list, @value) {
    .for-each(@item, @index in @list)
        when (@item = @value) {
            return: @index;
    }
}

div {
    @list: foo, bar, baz, qux;
    index-of-baz: index-of(@list, baz);
}
```
result:
```css
div {
  index-of-baz: 3;
}
```

#### Generate a rainbow gradient
This example is basically the same as one in the [intro](for.md#generate-a-rainbow-gradient), except that now we don't need any dreadful escaping hacks like `~"linear-gradient("`:
```less
#rainbow {
    .function-rainbow() {
        .for(@i, 7) {
            return+: spin(#e63, (@i - 1) * 360 / 7);
        }
    }

    background: linear-gradient(to right, rainbow());
}
```
result:
```css
#rainbow {
    background: linear-gradient(to right, #ee6633, #d6ee33, #35ee33, #33eed1, #336bee, #9b33ee, #ee33a0);
}
```

#### Convert a property/value map to a ruleset
```less
@template:
    margin  20px 0,
    padding 0 20px,
    color   fade(mediumspringgreen, 50%);

div {
    @styles: list2ruleset(@template);
    @styles();
}

.function-list2ruleset(@list) {
    return: @r;
    @r: {
        .for-each(@value in @list) {
            @property:   at(@value, 1);
            @{property}: slice(@value, 2);
        }
    };
}
```
result:
```css
div {
  margin: 20px 0;
  padding: 0 20px;
  color: rgba(0, 250, 154, 0.5);
}
```

---------------------------------------------------------------
### Non-integer counters

`.For` statement counters do not have to be an integer values, i.e. both non-integer `start` and `end` are valid:
```less
.for(@i: pi()/-2, 2.5) {r+: @i}
```
result:
```css
r: -1.57079633, -0.57079633, 0.42920367, 1.42920367, 2.42920367;
```

---------------------------------------------------------------
### Counters with units

A loop `start`/`end` values may also have a unit, in that case the `@index` value inherits the unit of the `start`. The `end` value unit is essentially ignored, i.e. the statement does not test if the `start` and `end` units are equal or compatible:
```less
.for(@i: 0px, @n: 3em) {
    r: @i of @n;
}
```
result:
```css
r: 0px of 3em;
r: 1px of 3em;
r: 2px of 3em;
r: 3px of 3em;
```

---------------------------------------------------------------
### Defining mixins quirk

As mentioned in [Scope](#scope) section, you can't generate mixins (to be used elsewhere) by these loops. Well... There is a Less bug that can be exploited to achieve this actually:
```less
.mixin-generator(@list) {
    .for-each(@name in @list) {
        .@{name} {
            .call(@args) {
                @{name}: @args;
            }
        }
    }
}

div {
    .mixin-generator(margin padding border);
    // use generated mixins:
    .margin.call(1px 2px 3px 4px);
    .border.call(1px solid black);
}
```
result:
```css
div {
    margin: 1px 2px 3px 4px;
    border: 1px solid black;
}
```
This snippet is provided to serve solely as a *Never Do Anything Like This* example (if you occasionally step into such possibility). And not only because the bug will be fixed eventually, but primarily because the very idea of such "Mixin Generators" (where we try to hardcode an arbitrary, parametric value as a part of the mixin name) is considered to be a harmful anti-pattern (for more details see [#3550](https://github.com/less/less.js/issues/3050), [#2702](https://github.com/less/less.js/issues/2702#issuecomment-144727038) etc.).

So if you find yourself in need of something like above, it's most likely you're doing something wrong. For instance, don't miss that the goal of that "Never Do" example can be incredibly simply achieved with the clean and straight-forward "the only mixin" [code](https://gist.github.com/seven-phases-max/c0f37283f3bc9615bcb9232762967dab).

---------------------------------------------------------------
### Arin Scrivenor and the remanent magnetization

Seriously?
