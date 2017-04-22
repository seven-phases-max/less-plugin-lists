
## Vector Arithmetic

"Vector Arithmetic" enables support for performing element-wise [arithmetic operations](http://lesscss.org/features/#features-overview-feature-operations) on lists:
```less
@abstract-margin: 1 2 3 4;
margin: @abstract-margin * 2px; // 2px 4px 6px 8px
```

### Comma vs. Space
Both comma and space separated list are supported. When both list types are used in a single expression, its result inherits the delimiter of the leftmost list operand, e.g.:
```less
@a: 10 20;
@b:  1, 2;

ab:  @a + @b;     // 11 22
ba:  @b + @a;     // 11, 22
1ba: 1 + @b + @a; // 12, 23 
```

### List Literals
Note the Less parser does not directly support list values in statements beside just a simple variable assignment:
```less
@list: 1 2 3;

a: @list * 42;     // OK, but:
b: (1 2 3) * 42;   // error
c: (1, 2, 3) * 42; // error
```
Use [`l` function](ref.md#l) to create a list value from a list literal "inplace":
```less
d: l(1 2 3) * 42;   // OK
e: l(1, 2, 3) * 42; // OK
```

### Example: inverting color list values
Less code:
```less
div {
    @colors: blue, yellow, pink;
    color: @colors;
    background-color: white - @colors;
}
```
CSS output:
```css
div {
    color: blue, yellow, pink;
    background-color: #ffff00, #0000ff, #003f34;
}
```

---
For more examples see included [tests](../test/less/va.less).
