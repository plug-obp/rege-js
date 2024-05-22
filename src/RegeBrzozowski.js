/*
This class implements a regular expression semantics based on Brzozowski's derivatives.
The semantics is heterogeneous, the token are expressions that evaluate to a boolean value.
The token evaluation is delegated to an external evaluator, which is passed as a parameter to the constructor.
*/

import { Visitor, Empty, Epsilon, Token, Concatenation, Union, KleeneStar } from "./RegeSyntaxModel.js";

export class Nullability extends Visitor {
    visitEmpty(expression, input) {
        return false;
    }

    visitEpsilon(expression, input) {
        return true;
    }

    visitToken(expression, input) {
        return false;
    }

    visitConcatenation(expression, input) {
        return expression.lhs.accept(this, input) && expression.rhs.accept(this, input);
    }

    visitUnion(expression, input) {
        return expression.lhs.accept(this, input) || expression.rhs.accept(this, input);
    }

    visitKleeneStar(expression, input) {
        return true;
    }
}

export class Brzozowski extends Visitor {
    constructor(evaluator) {
        super();
        this.evaluator = evaluator;
    }

    derivative(expression, input) {
        return expression.accept(this, input);
    }

    isNullable(expression) {
        const nullability = new Nullability();
        return expression.accept(nullability, null);
    }

    //D ∅         t ≜ ∅
    visitEmpty(expression, input) {
        return new Empty();
    }

    //D ϵ         t ≜ ∅
    visitEpsilon(expression, input) {
        return new Empty();
    }

    //D (τ expression)     input ≜ ϵ, if evaluator(expression, input) = true
    //D (τ expression)     input ≜ ∅, if evaluator(expression, input) = false
    visitToken(expression, input) {
        return this.evaluator(expression.value, input) ? new Epsilon() : new Empty();
    }

    //D (L₁ ∘ L₂) t ≜ (D L₁ t) ∘ L₂ | (Δ L₁) ∘ (D L₂ t)
    visitConcatenation(expression, input) {
        if (this.isNullable(expression.lhs)) {
            return this.derivative(expression.lhs, input).concat(expression.rhs)
                .union(this.derivative(expression.rhs, input));
        } else {
            return this.derivative(expression.lhs, input).concat(expression.rhs);
        }
    }

    //D (L₁ | L₂) t ≜ (D L₁ t) | (D L₂ t)
    visitUnion(expression, input) {
        return this.derivative(expression.lhs, input).union(this.derivative(expression.rhs, input));
    }

    //D (L₁*) t ≜ (D L₁) ∘ (L₁*)
    visitKleeneStar(expression, input) {
        return this.derivative(expression.expression, input).concat(expression);
    }
}