
// token types
const NUMBER = "number";
const VAR = "var";
const OPERATOR = "operator";
const EXPRESSION = "expression";
const ASSIGN = "assign";


// key-value collection for storing variables
const variables = {};


// main, entry-point function
// handles assign statements (e.g. "X = 400 + 2"), and expressions (e.g. "X + 500")
function evaluate(expr) {
    let tokens = tokenize(expr);

    if (isAssignment(tokens)) {
        let name = tokens[0].value,
            value = evalTokens(tokens.splice(2));

        variables[name] = value;
        return value;
    }

    return evalTokens(tokens);
}


function evalTokens(tokens) {
    // some tokens may be variable names, or string expressions -- so they need further evaluation
    tokens.forEach(token => evalToken(token));

    // check for expressions such as "-100 * y", or "x * (-40.5)"
    checkUnaryMinus(tokens);


    // at this point, all tokens should be either numbers, or operators
    // all variable names, or sub-expressions -- should be evaluated and replaced with their numeric values


    // highest precedence, right associative
    evalExponentiation(tokens);

    // next highest precedence
    evalMultiplication(tokens);
    evalDivision(tokens);

    // lowest precedence
    evalAddition(tokens);
    evalSubtraction(tokens);


    // at this point, there should be only one token left (a number with final value)
    if (tokens.length != 1 || tokens[0].type != NUMBER) {
        throw new Error("Wrong expression, cannot evaluate");
    }


    return tokens[0].value;
}


// resolves tokens which are variable names, or other expressions
function evalToken(token) {
    let { type, value } = token;

    if (type == EXPRESSION) {
        token.value = _eval(value);
        token.type = NUMBER;

        return;
    }

    if (type == VAR) {
        token.value = variables[value];
        token.type = NUMBER;

        if (token.value == undefined) {
            throw new Error(`Unknown variable: ${value}`);
        }
    }
}

// a unary minus has highest precedence, and can happen on first postion, or immediately after "("
// for example "-100 * y", or "x * (-40.5)"
function checkUnaryMinus(tokens) {
    if (tokens.length < 2) {
        return;
    }

    let first = tokens[0],
        second = tokens[1];

    if (first.type != OPERATOR) {
        return;
    }

    if (first.value != "-") {
        return;
    }

    if (second.type != NUMBER) {
        throw new Error("Only a number can follow the unary " - " operator")
    }

    second.value = -second.value;

    // get rid of first element
    tokens.shift();
}


// handles only expressions, e.g. "300 + 2 * 9"
function _eval(expr) {
    let tokens = tokenize(expr);
    return evalTokens(tokens);
}


function evalExponentiation(tokens) {
    evalRightToLeft(tokens, "^", (left, right) => Math.pow(left, right));
}


function evalMultiplication(tokens) {
    evalLeftToRight(tokens, "*", (left, right) => left * right);
}

function evalDivision(tokens) {
    evalLeftToRight(tokens, "/", (left, right) => left / right);
}


function evalAddition(tokens) {
    evalLeftToRight(tokens, "+", (left, right) => left + right);
}

function evalSubtraction(tokens) {
    evalLeftToRight(tokens, "-", (left, right) => left - right);
}


function evalRightToLeft(tokens, operator, callback) {
    // helper stack, to keep operands and lower precedence operators
    let stack = [];

    while (tokens.length > 0) {
        let token = tokens.pop(),
            { type, value } = token;

        if (type != OPERATOR || value != operator) {
            // it's a number, or a different operator... save for later
            stack.push(token);
            continue;
        }

        let left = tokens.pop(),    // left operand
            right = stack.pop();    // right operand

        if (left == null || right == null || left.type != NUMBER || right.type != NUMBER) {
            throw new Error(`Wrong expression, cannot apply ${operator} operator`);
        }

        // apply operand to calculate new value, and save for later
        stack.push({
            type: NUMBER,
            value: callback(left.value, right.value)
        });
    }

    // put the tokens back into original stack, to preserve original left-to-right order
    revertStack(stack, tokens);
}


function evalLeftToRight(tokens, operator, callback) {
    // helper stack, to keep operands and lower precedence operators
    let stack = [];

    while (tokens.length > 0) {
        let token = tokens.shift(),
            { type, value } = token;

        if (type != OPERATOR || value != operator) {
            // it's a number, or different operator... save for later
            stack.push(token);
            continue;
        }

        let left = stack.pop(),    // left operand
            right = tokens.shift();    // right operand

        if (left == null || right == null || left.type != NUMBER || right.type != NUMBER) {
            throw new Error(`Wrong expression, cannot apply ${operator} operator`);
        }

        // apply operand to calculate new value, and save for later
        stack.push({
            type: NUMBER,
            value: callback(left.value, right.value)
        });
    }

    // put the tokens back into original stack, to preserve original left-to-right order
    copyStack(stack, tokens);
}


function revertStack(src, dest) {
    while (src.length > 0) {
        dest.push(src.pop());
    }
}

function copyStack(src, dest) {
    while (src.length > 0) {
        dest.push(src.shift());
    }
}


function tokenize(expr) {
    let tokens = [],

        inWord = false,
        word = "",

        numOpens = 0,   // number of open parethesis
        subExpr = "";

    for (let i = 0; i < expr.length; i++) {
        let ch = expr.charAt(i);

        if (numOpens > 0) {
            if (ch == ")") {
                numOpens--;

                if (numOpens == 0) {
                    tokens.push({
                        type: EXPRESSION,
                        value: subExpr
                    });

                    subExpr = "";
                    continue;
                }
            }

            if (ch == "(") {
                numOpens++;
            }

            subExpr += ch;
            continue;
        }

        if (ch == "(") {
            numOpens++;
            continue;
        }

        if (ch == ")") {
            throw new Error("')' was found without an opening '(");
        }

        if (isLetter(ch) || isDigit(ch)) {
            inWord = true;
            word += ch;

            continue;
        }

        if (inWord) {
            tokens.push(getToken(word));

            inWord = false;
            word = "";
        }

        if (isWhitespace(ch)) {
            continue;
        }

        if (isOperator(ch)) {
            tokens.push({
                type: OPERATOR,
                value: ch
            });

            continue;
        }


        if (ch == "=") {
            tokens.push({
                type: ASSIGN,
                value: ch
            });

            continue;
        }


        throw new Error(`Unknown character: ${ch}`);
    }

    if (numOpens !== 0) {
        throw new Error("Number of '(' doesn't match the number of ')'");
    }

    if (word) {
        tokens.push(getToken(word));
    }

    return tokens;
}


function getToken(word) {
    if (isLetter(word.charAt(0))) {
        return {
            type: VAR,
            value: word
        };
    }

    return {
        type: NUMBER,
        value: parseFloat(word)
    };
}

// a - z, A - Z, and underscore
function isLetter(ch) {
    if (between(ch, "a", "z")) {
        return true;
    }

    if (between(ch, "A", "Z")) {
        return true;
    }

    return ch === "_";
}

// 0 - 9 and dot
function isDigit(ch) {
    if (between(ch, "0", "9")) {
        return true;
    }

    return ch === ".";
}

function between(val, min, max) {
    return min <= val && val <= max;
}

function isWhitespace(ch) {
    return ch == " " || ch == "\t" || ch == "\r" || ch == "\n";
}

function isOperator(ch) {
    return ch == "+" || ch == "-" || ch == "*" || ch == "/" || ch == "^";
}

function isAssignment(tokens) {
    return tokens.length > 2 && tokens[0].type == VAR & tokens[1].value == "=";
}



window.onload = () => {
    let expr = document.getElementById("expr");

    expr.addEventListener("keypress", e => {
        if (e.key == "Enter") {
            doCalc();
        }
    });
}


function doCalc() {
    let expr = document.getElementById("expr"),
        result = document.getElementById("result");

    let calculatedValue,
        isErr = false;

    try {
        calculatedValue = evaluate(expr.value);
    } catch (err) {
        calculatedValue = err;
        isErr = true;
    }

    result.value += `> ${expr.value}\r\n${calculatedValue}\r\n\r\n`;
    result.scrollTop = result.scrollHeight;

    if (!isErr) {
        expr.value = "";
    }
}