
## `.for-each`

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