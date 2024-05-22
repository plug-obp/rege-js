import { Empty, Epsilon, Token, Concatenation, Union, KleeneStar } from "./RegeSyntaxModel.js";

export function readExpression(input, isSmart = true) {
    return new RegeReader(isSmart).readExpression(new Peekable(input[Symbol.iterator]()));
}
/*
*
    E -> ∅              //empty
    | ϵ                 //epsilon
    | τ[<any-string>]   //token
    | E | E             //union
    | E . E             //concatenation
    | E *               //kleene star
    | (E)
---

    E -> ∅ E'
    | ϵ E'
    | τ[<any-string>] E'
    | (E) E'
    E' -> | E E'
    | . E E'
    | * E'
    | ϵ

* */

export class RegeReader {
    context;
    isSmart;
    constructor(isSmart) {
        this.isSmart = isSmart;
    }
    readExpression(input) {
        this.eatSpace(input);
        var expr = this.readEmpty(input);
        if (expr != null) {
            return this.getRemaining(input, expr);
        }
        expr = this.readEpsilon(input);
        if (expr != null) {
            return this.getRemaining(input, expr);
        }
        expr = this.readToken(input);
        if (expr != null) {
            return this.getRemaining(input, expr);
        }
        expr = this.readParens(input);
        if (expr != null) {
            return this.getRemaining(input, expr)
        }
        return null;
    }

    getRemaining(input, expr) {
        this.context = expr;
        expr = this.readExpressionPrim(input);
        if (expr == null) {
            expr = this.context;
        }
        this.context = null;
        return expr;
    }

    readExpressionPrim(input) {
        this.eatSpace(input);
        var expr = this.readConcatenation(input);
        if (expr != null) {
            return this.getRemaining(input, expr);
        }
        expr = this.readUnion(input);
        if (expr != null) {
            return this.getRemaining(input, expr);
        }
        expr = this.readKleeneStar(input);
        if (expr != null) {
            return this.getRemaining(input, expr);
        }
        if (input.hasNext()) return null;
        return this.context;
    }

    readEmpty(input) {
        if (!input.hasNext() || input.peek() != '∅') return null;
        input.next();
        return new Empty();
    }

    readEpsilon(input) {
        if (!input.hasNext() || input.peek() != 'ϵ') return null;
        input.next();
        return new Epsilon();
    }

    readToken(input) {
        if (!input.hasNext() || input.peek() != 'τ') return null;
        input.next();
        this.eatSpace(input);
        if (input.peek() != '[') return null;
        input.next();
        const value = this.readTokenValue(input);
        if (input.peek() != ']') return null;
        input.next();
        return new Token(value);
    }

    readConcatenation(input) {
        const lhs = this.context;
        if (!input.hasNext()) return null;
        // '.' and '⋅' are the concatenation operators
        if (input.peek() === '.' || input.peek() === '⋅') {
            input.next();
        }
        const rhs = this.readExpression(input);
        if (rhs == null) return null;
        if (this.isSmart) return lhs.concat(rhs);
        return new Concatenation(lhs, rhs);
    }
    readUnion(input) {
        const lhs = this.context;
        if (!input.hasNext() || !(input.peek() === '|' || input.peek() === '∪')) return null;
        input.next();
        const rhs = this.readExpression(input);
        if (rhs == null) return null;
        if (this.isSmart) return lhs.union(rhs);
        return new Union(lhs, rhs);
    }

    readKleeneStar(input) {
        if (!input.hasNext() || input.peek() != '*') return null;
        input.next();
        if (this.isSmart) return this.context.star();
        return new KleeneStar(this.context);
    }

    readParens(input) {
        if (!input.hasNext() || input.peek() != '(') return null;
        input.next();
        const expr = this.readExpression(input);
        if (!input.hasNext() || input.peek() != ')') return null;
        input.next();
        return expr;
    }

    eatSpace(input) {
        while (input.hasNext() && (input.peek() === ' ' || input.peek() === '\t')) {
            input.next();
        }
    }

    readTokenValue(input) {
        var token = '';
        var precedent = '';
        var current = input.peek();
        while (input.hasNext && (current !== ']' || (precedent === '\\'))) {
            precedent = current;
            token += precedent;
            input.next();
            current = input.peek();
        }
        return token;
    }

    isSpecial(char) {
        return char === '∅'
            || char === 'ϵ'
            || char === 'τ'
            || char === '['
            || char === ']'
            || char === '|'
            || char === '∪'
            || char === '*'
            || char === '.'
            || char === '⋅'
            || char === '('
            || char === ')';
    }
}

class Peekable {
    mIterator;
    mPeek;
    constructor(iterator) {
        this.mIterator = iterator;
        this.mPeek = iterator.next();
    }
    next() {
        const curr = this.mPeek;
        this.mPeek = this.mIterator.next();
        return curr.value;
    }
    peek() {
        return this.mPeek.value;
    }
    hasNext() {
        return !this.mPeek.done;
    }
    [Symbol.iterator]() {
      return this;
    }
  }