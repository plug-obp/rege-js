import { Brzozowski } from "./RegeBrzozowski.js";
import { readExpression } from "./RegeReader.js";
import { Concatenation, Empty, Epsilon, Token } from "./RegeSyntaxModel.js";

const derivator = new Brzozowski((token, input) => token === input);

test('D(∅,c)', () => {
    const e = readExpression('∅');
    expect(e.accept(derivator, '')).toStrictEqual(new Empty());
});

test('D(ϵ,c)', () => {
    const e = readExpression('ϵ');
    expect(e.accept(derivator, '')).toStrictEqual(new Empty());
});

test('D(τ[c],c)', () => {
    const e = readExpression('τ[c]');
    expect(e.accept(derivator, 'c')).toStrictEqual(new Epsilon());
});

test('D(τ[c],d)', () => {
    const e = readExpression('τ[c]');
    expect(e.accept(derivator, 'd')).toStrictEqual(new Empty());
});

test('D(τ[a] | τ [b], b)', () => {
    const e = readExpression('τ[a] | τ [b]');
    expect(e.accept(derivator, 'b')).toStrictEqual(new Epsilon());
})

test('D(τ[b] | τ [a], b)', () => {
    const e = readExpression('τ[b] | τ [a]');
    expect(e.accept(derivator, 'b')).toStrictEqual(new Epsilon());
})

test('D(τ[a] | τ [a], a)', () => {
    const e = readExpression('τ[a] | τ [a]');
    expect(e.accept(derivator, 'a')).toStrictEqual(new Epsilon());
})

test('D(τ[b] | τ [b], a)', () => {
    const e = readExpression('τ[b] | τ [b]');
    expect(e.accept(derivator, 'a')).toStrictEqual(new Empty());
})

test('D(τ[a]*, a)', () => {
    const e = readExpression('τ[a]*');
    expect(e.accept(derivator, 'a')).toStrictEqual(e);
})

test('D(τ[a]*, b)', () => {
    const e = readExpression('τ[a]*');
    expect(e.accept(derivator, 'b')).toStrictEqual(new Empty());
})

test('D((τ[a]*)*, b)', () => {
    const e = readExpression('(τ[a]*)*', false);
    expect(e.accept(derivator, 'a')).toStrictEqual(new Concatenation(readExpression('τ[a]*'), e));
})

test('D(τ[a]τ[b], a)', () => {
    const e = readExpression('τ[a]τ[b]');
    expect(e.accept(derivator, 'a')).toStrictEqual(new Token('b'));
})