
export class Inhabitation extends Visitor {
    visitEmpty(expression, input) {
        return false;
    }

    visitEpsilon(expression, input) {
        return true;
    }

    visitToken(expression, input) {
        return true
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


export class RegeDependentSemantics {
    expression;
    evaluator;
    derivator;
    constructor(expression, derivatorBuilder, evaluator) {
        this.expression = expression;
        this.evaluator = evaluator;
        this.derivator = new derivatorBuilder(evaluator);
    }
    initial() {
        return [this.expression];
    }
    actions(input, configuration) {
        if (configuration.accept(new Inhabitation(), null)) {
            return this.derivator;
        }
        return [];
    }
    execute(action, input, configuration) {
        return [configuration.accept(action, input)];
    }
}