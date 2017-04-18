
### Function Reference

- [`at       `](#at)        - returns the value at the specified position in a list.
- [`cat      `](#cat)       - concatenates two or more lists.
- [`flatten  `](#flatten)   - returns a one-dimensional list containing all elements of an input list.
- [`join     `](#join)      - joins all elements of a list into a string.
- [`l        `](#l)         - creates a comma-separated list.
- [`slice    `](#slice)     - returns selected portion of a list.
- [`splice   `](#splice)    - replaces or removes selected portion of a list.
- [`transpose`](#transpose) - transposes rows and columns of a list.
- [`_inspect `](#_inspect)  - return a string representation of a list with debug/log formatting.

---------------------------------------------------------------

### `at`

   Returns the value at the specified position in a list.

**Syntax**
```
at(list, index)
```

**Parameters** <dl></dl>
`list` <dl><dd>
    Required. The input list.
    </dd></dl>
`index` <dl><dd>
    Required. A one-base index of the element to return.
    If `index` is not a unitless numeric value it's considered to specify the key in a key-value list structure.
    </dd></dl>

**Returns**

   The value at the specified position in the list.

**Example**
```less
@list: apple, banana, cherry;

at(@list, 2);       // banana
at(foo bar baz, 3); // baz
at(alone, 1);       // alone

@key-value-list:
     Alice 10px,
     Bob   20px,
     Chuck 30px and his hat,
     Dave  40px;

at(@key-value-list, Bob);   // 20px
at(@key-value-list, Chuck); // 30px and his hat
```

---------------------------------------------------------------

### `cat`

   Concatenates two or more lists.

**Syntax**
```
cat(value1, value2, ... valueN)
```

**Parameters** <dl></dl>
`value1, ..., valueN` <dl><dd>
    Optional. The lists or single values to concatenate.
    If `value` argument is a list, its contents are appended to the resulting list.
    If the argument is anything other than a list, it is appended as a single element.
    </dd></dl>

**Returns**

   List.

**Remarks** <dl><dd>
    The type of the returning list (i.e. if it's comma or whitespace separated) is determined by the type of the first list among arguments. If no lists passed in, the result is comma delimited.
    </dd></dl>

**Example**
```less
@a: 1, 2;
@b: 3, 4;

cat(1, 2, 3); // 1, 2, 3
cat(1  2, 3); // 1 2 3
cat(@a, @b);  // 1, 2, 3, 4
cat(@a, 3 4); // 1, 2, 3, 4
cat(1 2, @b); // 1 2 3 4

@c: @a @b;
@d: cat(@a, @b);

length(@c); // 2
// but:
length(@d); // 4
```

---------------------------------------------------------------

### `flatten`

   Returns a one-dimensional list containing all elements of an input list.

**Syntax**
```
flatten(list, delimiter)
```

**Parameters** <dl></dl>
`list` <dl><dd>
    Required. The input list.
    </dd></dl>
`delimiter` <dl><dd>
    Optional. Specifies a delimiter to be used for the resulting list.<br>
    This parameter can be one of: `comma`, `space`, `","`, `" "`.
    If omitted, the resulting list is comma-delimited.
    </dd></dl>

**Returns**

   The flattened list.

**Example**
```less
@list: a b, c d;        // two-dimensional list

length(@list);          // 2
length(flatten(@list)); // 4
flatten(@list);         // a, b, c, d
flatten(@list, space);  // a b c d
```

---------------------------------------------------------------

### `join`

   Joins all elements of a list into a string.

**Syntax**
```
join(list, delimiter)
```

**Parameters** <dl></dl>
`list` <dl><dd>
    Required. The input list.
    </dd></dl>
`delimiter` <dl><dd>
    Optional. A string to be used to separate list items. If omitted, the elements are delimited with `, `.
    </dd></dl>

**Returns**

   String.

**Example**
```less
@list: 1, 2, 3, 4;

join(@list);           // 1, 2, 3, 4
join(@list, -);        // 1-2-3-4
join(foo bar baz);     // foo, bar, baz
join(foo bar baz, ""); // foobarbaz

join((3 * 11px) of rgb(255, 0, 0), ' '); // 33px of #ff0000
```

---------------------------------------------------------------

### `l`

   Creates a comma or space separated list.

**Syntax**
```
l(value1, value2, ... valueN)
```

**Parameters** <dl></dl>
`value1, ..., valueN` <dl><dd>
    Required. The list value(s).
    </dd></dl>

**Returns**

   List.

**Remarks**
- The purpose of this function is to construct a comma-separated list in place so that it can be passed as a single function or mixing argument
- As well as allowing both comma or space separated list "literals" to be used directly in [complex statements](va.md#list-literals).
- Function identifiers are not case-sensitive in Less, so `L` identifier is also valid to use.

**Example**
```less
at(a  b  c, 2);    // b
at(a, b, c, 2);    // at(a, b, c, 2)
at(l(a, b, c), 2); // b
```

---------------------------------------------------------------

### `slice`

   Returns selected portion of a list.

**Syntax**
```
slice(list, start, end)
```

**Parameters** <dl></dl>
`list` <dl><dd>
    Required. The input list.
    </dd></dl>
`start` <dl><dd>
    Optional. A one-base index to start slicing at.
    Negative or zero `start` specifies an offset from the end of the list (with `-1` pointing to the last element).
    If omitted, `slice` starts at the beginning of the list.
    </dd></dl>
`end` <dl><dd>
    Optional. A one-base index to stop slicing at (up to but not including `end`).
    Negative or zero `end` specifies an offset from the end of the list (with `-1` pointing to the last element).
    If omitted, `slice` continues to the end of the list.
    </dd></dl>

**Returns**

   The selected portion of a list.

**Example**
```less
@list: one, two, three, four;

slice(@list,  3);     // three, four
slice(@list,  2,  3); // two
slice(@list, -3);     // two, three, four
slice(@list,  3, -1); // three
slice(@list, -2,  0); // three, four
```

---------------------------------------------------------------

### `splice`

   Replaces or removes selected portion of a list.

**Syntax**
```
splice(list, start, end, value)
```

**Parameters** <dl></dl>
`list` <dl><dd>
    Required. The input list.
    </dd></dl>
`start` <dl><dd>
    Optional. A one-base index to start removing elements at.
    Negative or zero `start` specifies an offset from the end of the list (with `-1` pointing to the last element).
    </dd></dl>
`end` <dl><dd>
    Optional. A one-base index to stop removing elements at (up to but not including `end`).
    Negative or zero `end` specifies an offset from the end of the list (with `-1` pointing to the last element).
    If omitted, the `start + 1` index is used.
    </dd></dl>
`value` <dl><dd>
    Optional. A value to insert into the list in place of the removed elements.
    </dd></dl>

**Returns**

   Modified list.

**Example**
```less
@list: one, two, three, four;

splice(@list, 3);         // one, two, four
splice(@list, 2, 4);      // one, four
splice(@list, -3, -2);    // one, three, four
splice(@list, 3, 4, hat); // one, two, hat, four
```

---------------------------------------------------------------

### `transpose`

Transposes rows and columns of a list.

**Syntax**
```
transpose(list)
```

**Parameters** <dl></dl>
`list` <dl><dd>
    Required. The input list
    </dd></dl>

**Returns**

   Transposed list.

**Remarks**

   This function assumes only 2-dimensional input lists. Any sub-dimension values pass unchanged.

**Example**
```less
@list: Alice 1,
       Bob   2,
       Carol 3,
       Dave  4,
       Eve   5;

transpose(@list);        // Alice, Bob, Carol, Dave, Eve 1, 2, 3, 4, 5
at(transpose(@list), 1); // Alice, Bob, Carol, Dave, Eve
at(transpose(@list), 2); // 1, 2, 3, 4, 5

transpose(l(a, b, c) l(1, 2, 3)); // a 1, b 2, c 3
```

---------------------------------------------------------------

### `_inspect`

   Return a string representation of a list with debug/log formatting.

**Syntax**
```
_inspect(list, prefix, postfix)
```

**Parameters** <dl></dl>
`list` <dl><dd>
    Required. The input list.
    </dd></dl>
`prefix` <dl><dd>
    Optional. A string to put before the list and all of its nesting lists (if any). If no `prefix` specified, `[` is used.
    </dd></dl>
`postfix` <dl><dd>
    Optional. A string to put after the list and all of its nesting lists (if any). If no `postfix` specified, `]` is used.
    </dd></dl>

**Returns**

   String.

**Remarks**

   This function is used for the plugin self-tests.

**Example**
```less
@a: 1 2 3, 4 5 6;

_inspect(@a);            // [[1 2 3], [4 5 6]]
_inspect(transpose(@a)); // [[1, 4] [2, 5] [3, 6]]
_inspect(@a 7);          // [[[1 2 3], [4 5 6]] 7]
_inspect(cat(@a, 7));    // [[1 2 3], [4 5 6], 7]

@b1:     1;
@b2: @b1 2;
@b3: @b2 3;
@b:  @b3 4;

_inspect(@b);            // [[[1 2] 3] 4]
_inspect(flatten(@b));   // [1, 2, 3, 4]
```
