export class Expression {
    accept(visitor, input) {
        return visitor.visitExpression(this, input);
    }
    equals(other) {
        return this === other;
    }
    union(exp) {
        if (this instanceof Empty) return exp;
        if (exp instanceof Empty) return this;
        if (this.equals(exp)) return this;
        return new Union(this, exp);
    }

    concat(exp) {
        if (this instanceof Empty || exp instanceof Empty) return new Empty();
        if (this instanceof Epsilon) return exp;
        if (exp instanceof Epsilon) return this;
        return new Concatenation(this, exp);
    }

    star() {
        if (this instanceof KleeneStar) return this;
        return new KleeneStar(this);
    }
}

export class Terminal extends Expression {
    accept(visitor, input) {
        return visitor.visitTerminal(this, input);
    }
}

export class Token extends Terminal {
    constructor(value) {
        super();
        this.value = value;
    }
    accept(visitor, input) {
        return visitor.visitToken(this, input);
    }
    equals(other) {
        return this === other 
        || (other instanceof Token 
            && this.value === other.value);
    }
}

export class Empty extends Terminal {
    constructor() {
        super();
    }
    accept(visitor, input) {
        return visitor.visitEmpty(this, input);
    }
    equals(other) {
        return this === other 
        || (other instanceof Empty);
    }
}

export class Epsilon extends Terminal {
    constructor() {
        super();
    }
    accept(visitor, input) {
        return visitor.visitEpsilon(this, input);
    }
    equals(other) {
        return this === other 
        || (other instanceof Epsilon);
    }
}

export class Composite extends Expression {
    accept(visitor, input) {
        return visitor.visitComposite(this, input);
    }
}

export class Concatenation extends Composite {
    constructor(lhs, rhs) {
        super();
        this.lhs = lhs;
        this.rhs = rhs;
    }
    accept(visitor, input) {
        return visitor.visitConcatenation(this, input);
    }
    equals(other) {
        return this === other 
        || (other instanceof Concatenation 
            && this.lhs.equals(other.lhs)
            && this.rhs.equals(other.rhs));
    }
}

export class Union extends Composite {
    constructor(lhs, rhs) {
        super();
        this.lhs = lhs;
        this.rhs = rhs;
    }
    accept(visitor, input) {
        return visitor.visitUnion(this, input);
    }
    equals(other) {
        return this === other 
        || (other instanceof Union 
            && this.lhs.equals(other.lhs)
            && this.rhs.equals(other.rhs));
    }
}

export class KleeneStar extends Composite {
    constructor(expression) {
        super();
        this.expression = expression;
    }
    accept(visitor, input) {
        return visitor.visitKleeneStar(this, input);
    }
    equals(other) {
        return this === other 
        || (other instanceof KleeneStar 
            && this.expression.equals(other.expression));
    }
}

export class Visitor {
    visitExpression(expression, input) {}
    visitTerminal(terminal, input) {
        this.visitExpression(terminal, input);
    }
    visitToken(token, input) {
        this.visitTerminal(token, input);
    }
    visitEmpty(empty, input) {
        this.visitTerminal(empty, input);
    }
    visitEpsilon(epsilon, input) {
        this.visitTerminal(epsilon, input);
    }
    visitComposite(composite, input) {
        this.visitExpression(composite, input);
    }
    visitConcatenation(concatenation, input) {
        this.visitComposite(concatenation, input);
    }
    visitUnion(union, input) {
        this.visitComposite(union, input);
    }
    visitKleeneStar(kleeneStar, input) {
        this.visitComposite(kleeneStar, input);
    }
}