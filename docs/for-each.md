
## `.for-each` Statement

>Repeat a block of statements for each element in the list.

### Example
Less code:
```less
@fruit: banana, apple, pear, potato, carrot, peach;

#fruit {
    .for-each(@value in @fruit) {
        some: @value;
    }
}
```
CSS output:
```css
#fruit {
    some: banana;
    some: apple;
    some: pear;
    some: potato;
    some: carrot;
    some: peach;
}
```

## Syntax
```less
.for(@value, @index in @list: list-value) {}
```

**Parameters** <dl></dl>
`@value` <dl><dd>
    Required. A variable to represent the current element of the list.
    </dd></dl>
`@index` <dl><dd>
    Optional. A variable to represent the index of the current element of the list.
    </dd></dl>
`@list` <dl><dd>
    Required. A list to iterate through.
    If `list-value` is specified, the statement defines new `@list` variable with the `list-value`.
    If `list-value` is ommited, the statement uses `@list` variable defined elsewhere.
    </dd></dl>
`list-value` <dl><dd>
    Optional. A value to assign to the `@list` variable.
    </dd></dl>

## Examples
    
### Generate classes from color map
Less code:
```less
@badge-colors: 
    blue  #44BBFF,
    gray  #F0F1F5,
    green #66CC99,
    red   #FC575E;

.for-each(@pair in @badge-colors) {
    @key: at(@pair, 1);
    .badge-@{key} {
        color: at(@pair, 2);
    }
}
```
CSS output:
```css
.badge-blue {
    color: #44BBFF;
}
.badge-gray {
    color: #F0F1F5;
}
.badge-green {
    color: #66CC99;
}
.badge-red {
    color: #FC575E;
}
```

### Generate icon classes from filename list
Less code:
```less
.icon {
    .for-each(@name in @l: home cancel error book) {
        &-@{name} {background-image: url("../images/@{name}.svg")}
    }
}
```
CSS output:
```css
.icon-home {
    background-image: url("../images/home.svg");
}
.icon-cancel {
    background-image: url("../images/cancel.svg");
}
.icon-error {
    background-image: url("../images/error.svg");
}
.icon-book {
    background-image: url("../images/book.svg");
}
```
    
### Nested loops
Less code:
```less
// Split a complex list:
div {
    @list: a b c, d e f, g h i;

    .for-each(@x, @i in @list) {
        .for-each(@y in @x) {
            @{i}+: @y;
        }
    }
}
```
CSS output:
```css
div {
    1: a, b, c;
    2: d, e, f;
    3: g, h, i;
}
```

### More examples

See [included tests](../test/less/for-each.less).