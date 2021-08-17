# Expression Evaluator

[Simple expression evaluator](https://claudiu-codreanu.github.io/expr-eval/solution.html).
<br>

Can handle `+`, `-`, `*`, `/`, and `^` for exponentiation.  
Also `(` and `)` can be used to group sub-expressions.
<br>

Exponentiation is evaluated right-to-left, everything else left-to-right, according to precedence.
<br>

Can handle variable declaration assignments such as `PI = 3.1415`, and expressions such as `PI * radius * radius`.

<br>

- Click [here](https://claudiu-codreanu.github.io/expr-eval/challenge.html) to see the original challenge and requirements
- Click [here](https://claudiu-codreanu.github.io/expr-eval/solution.html) to see my implementation
- Click [here](https://claudiu-codreanu.github.io/expr-eval/v2/solution2.html) to see **v2** of my implementation

<br>


This was intense! It’s the kind of simple-not-easy challenge, which forces you to dig deep… and rediscover classic, non-trivial programming techniques.

In any case, I loved it!

<br>

I read [Dave’s algorithm](https://www.cis.upenn.edu/~matuszek/cit594-2002/Assignments/5-expressions.html) **after** implementing my own solution.  
So my approach is less optimal, and less elegant… but it seems to work, nevertheless!

**Update**: I've also implemented Dave's algorithm in v2, see 3rd bullet above.  
The code is faster, smaller, and more ellegant.

<br>

These are the more notable features:

- It handles unary minus, if it’s either the first token in the expression, or immediately after an open parenthesis.
- It handles exponentiation right-to-left, e.g. `2 ^ 3 ^ 2` is considered `2 ^ (3 ^ 2)` and **not** `(2 ^ 3) ^ 2`
- It allows blanks in the expression
- It handles syntax errors
- It treats parenthesis during tokenization: everything between `(` and `)` is extracted as a sub-expression (string, not tokens)… and it’s evaluated recursively later on, during the eval phase.

<br>

[Click here](https://claudiu-codreanu.github.io/expr-eval/solution.html) to see my implementation, and to play with it.  
Feel free to throw any expression at it, and let me know if it misbehaves.

For example, the following expression produced the correct value (`85.63495631278313`):  
`(((( -1 )))) * 4 ^ 2 ^ 1 ^ 0   +   50 * 100 / (((50 + .77))) - (-3.1516)`

