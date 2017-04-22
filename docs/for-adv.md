
## Advanced `.for`/`.for-each` Details and Usage

TOC

Syntax and name conflicts
Scope
Lazy-Evaluation
Guards

Defining mixins quirk
Using with Functions plugin

   Non-integer counters
   Counters with units
   
<!-- ...................................................... -->
### Lazy-Evaluation

All variables within the iteration statements follow standard Less [Lazy-Evaluation](http://lesscss.org/features/#variables-feature-lazy-loading) rules. It's important to keep in mind when crafting a code involving indirect variable values:
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

<!-- ...................................................... -->
### Guards

Both `.for` and `.for-each` statements may have [Guards](http://lesscss.org/features/#mixin-guards-feature), for example:
```less
@fruit: banana apple pear potato carrot peach;

.for-each(@value, @index in @fruit) 
    when (@index > 3) {
        not-always-fruit+: @value;
}
```
result:
```css
not-always-fruit: potato, carrot, peach;
```
Notice a false guard does not stop the loop but only makes the current iteration to be skipped.

Another example (filterig non-numeric list values):
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

<!-- ...................................................... -->
### Non-integer counters

`.For` statement counters do not have to be an integer values, i.e. both non-integer `start` and `end` are valid:
```less
.for(@i: pi()/-2, 2.5) {r+: @i}
```
result:
```css
r: -1.57079633, -0.57079633, 0.42920367, 1.42920367, 2.42920367;
```

<!-- ...................................................... -->
### Counters with units

A loop `start`/`end` values may also have a unit, in that case the `@index` value inherits the unit of the `start`. The `end` value unit is essentially ignored, i.e. the statement does not test if the `start` and `end` units are equal or compatible:
>>>>>>> dev
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