
## `.for` Statement

>Repeat a block of statements for a specified number of times.


Usage:
```less
.for(@i, 4) {
    .column-@{i} {
        width: @i * 100% / 4;
    }
}
```
CSS result:
```css
.column-1 {
    width: 25%;
}
.column-2 {
    width: 50%;
}
.column-3 {
    width: 75%;
}
.column-4 {
    width: 100%;
}
```


## Syntax
```less
.for(@index: start, @end: end) {}
```

**Parameters** <dl></dl>
`@index` <dl><dd>
    Required. A variable to represent the value of the current iteration index.
    </dd></dl>
`start` <dl><dd>
    Optional. A value to start loop at.
    If omitted, the loop starts at 1.
    </dd></dl>
`@end` <dl><dd>
    Optional. A variable to represent the index value the loop stops after.
    </dd></dl>
`end` <dl><dd>
    Required. A value to stop loop after.
    If `end` value is a complex expression or a variable (defined elsewhere), `@end` variable name is also required.
    </dd></dl>


## Examples

### Typical syntax snippets
```less
.for(@i, 4)          {} // loop from 1 to 4
.for(@i: 2, 5)       {} // loop from 2 to 5
.for(@i: 3, @n: 6)   {} // loop from 3 to 6
.for(@i: @x, 4)      {} // loop from @x (defined elsewhere) to 4
.for(@i: @x, @n: @y) {} // loop from @x (defined elsewhere) to @y (defined elsewhere)
.for(@i, @n: 7)      {} // loop from 1 to 7
.for(@i, @n: @y)     {} // loop from 1 to @y (defined elsewhere)
.for(@i: -2, -5)     {} // loop from -2 to -5
```

### Generate a rainbow gradient
Less code:
```less
div {
    background+:  ~'linear-gradient(';
    background+_: to right;
    .for(@i: 0, @n: 6) {
        background+: spin(#e63, @i * 360 / (@n + 1));
    }
    background+_: ~')';
}
```
CSS output:
```css
div {
    background: linear-gradient( to right, #ee6633, #d6ee33, #35ee33, #33eed1, #336bee, #9b33ee, #ee33a0 );
}
```


## Advanced details and more examples
See [Advanced Details and Usage](for-adv.md)

## Yet more examples
See [included tests](../test/less/for.less)