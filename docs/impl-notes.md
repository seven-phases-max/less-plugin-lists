
---------------------------------------------------------------
### `at [1]`

Any one-dim list can be considered as a single item of 2-dim key-value list so that:<br>
`at(banana apple, banana);` -> `apple`

This leads to some ambiguity though, e.g.:<br>
`[banana, [peach, apple]]` - is banana here a key for `empty` value or for `[peach, apple]`?

The picked algo is:
>if the first list item is scalar AND the list is whitespace-separated, the list itself is considered to be a single key-value pair.

---------------------------------------------------------------
### `slice [1]`

Fortunately we don't need to collapse single value lists on `slice` return
>e.g. for things like `lighten(slice(@some-colors, 1, 2), 10%)` to work properly

since `Value/Expr.eval()` do this when necessarily on their own.

*However* this may be changed in future Less versions because of #1943.

---------------------------------------------------------------
### `join [1]`

This function is not quite friendly to quoted strings, e.g. currently it's:
`join("foo" "bar" "baz", "")` -> `"foo""bar""baz"`

Probably it could also collapse quotes of quoted values
and/or if the first element is quoted, return similiary quoted result.
>But never going too hard with this since it is **not** a **string** manipulation library.

And indeed, while<br>
`join("foo" "bar" "baz", "/")` returning `"foo/bar/baz"` makes some (url) sense <br>
`join("foo" "bar" "baz", ", ")` returning `"foo, bar, baz"` absolutely (CSS!) does not.