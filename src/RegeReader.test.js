import { readExpression } from "./RegeReader.js";
import { Empty, Epsilon, Token, Union, Concatenation, KleeneStar } from "./RegeSyntaxModel.js";

test('read empty', () => {
    expect(readExpression('∅')).toStrictEqual(new Empty());
});

test('ignore spaces', () => {
    expect(readExpression(' ∅')).toStrictEqual(new Empty());
    expect(readExpression('∅ ')).toStrictEqual(new Empty());
    expect(readExpression('\t∅')).toStrictEqual(new Empty());
    expect(readExpression('∅\t')).toStrictEqual(new Empty());

    expect(readExpression('∅   ⋅τ[a]', false)).toStrictEqual(new Concatenation(new Empty(), new Token('a')));
    expect(readExpression('∅\t⋅τ[a]', false)).toStrictEqual(new Concatenation(new Empty(), new Token('a')));
    expect(readExpression('∅   ⋅τ[a]', false)).toStrictEqual(new Concatenation(new Empty(), new Token('a')));
    expect(readExpression('∅\t⋅    τ[a]', false)).toStrictEqual(new Concatenation(new Empty(), new Token('a')));

});

test('read epsilon', () => {
    expect(readExpression('ϵ')).toStrictEqual(new Epsilon());
});

test('read token τ', () => {
    expect(readExpression('τ[a]')).toStrictEqual(new Token('a'));
    expect(readExpression('τ[b]')).toStrictEqual(new Token('b'));
});

test('read token t', () => {
    expect(readExpression('t[a]')).toStrictEqual(new Token('a'));
    expect(readExpression('t[b]')).toStrictEqual(new Token('b'));
});

test('read token with space', () => {
    expect(readExpression('τ[a] | τ [b]')).toStrictEqual(new Union (new Token('a'), new Token('b')));
});

test('read token escape', () => {
    expect(readExpression('τ[abc\\]d]')).toStrictEqual(new Token('abc\\]d'));
});

test('read concatenation', () => {
    expect(readExpression('∅ϵ', false)).toStrictEqual(new Concatenation(new Empty(), new Epsilon()));
    expect(readExpression('∅.ϵ', false)).toStrictEqual(new Concatenation(new Empty(), new Epsilon()));
    expect(readExpression('∅⋅ϵ', false)).toStrictEqual(new Concatenation(new Empty(), new Epsilon()));
})

test('read union', () => {
    expect(readExpression('∅|ϵ', false)).toStrictEqual(new Union(new Empty(), new Epsilon()));
    expect(readExpression('∅ ∪ ϵ', false)).toStrictEqual(new Union(new Empty(), new Epsilon()));
});

test('read kleene', () => {
    expect(readExpression('ϵ*')).toStrictEqual(new KleeneStar(new Epsilon()));
});

test ('read parens', () => {
    expect(readExpression('ϵ(ϵ|ϵ)', false)).toStrictEqual(new Concatenation(new Epsilon(), new Union(new Epsilon(), new Epsilon())));
    expect(readExpression('ϵϵ|ϵ', false)).toStrictEqual(new Concatenation(new Epsilon(), new Union(new Epsilon(), new Epsilon())));
    expect(readExpression('(ϵϵ)|ϵ', false)).toStrictEqual(new Union(new Concatenation(new Epsilon(), new Epsilon()), new Epsilon()));
})

test('read smart union', () => {
    expect(readExpression('ϵ|ϵ', true)).toStrictEqual(new Epsilon());
    expect(readExpression('ϵ|∅', true)).toStrictEqual(new Epsilon());
    expect(readExpression('∅|ϵ', true)).toStrictEqual(new Epsilon());
    expect(readExpression('τ[a]|τ[a]', true)).toStrictEqual(new Token('a'));
    expect(readExpression('τ[a]|τ[b]', true)).toStrictEqual(new Union(new Token('a'), new Token('b')));
})

test('read smart concatenation', () => {
    expect(readExpression('∅τ[a]', true)).toStrictEqual(new Empty());
    expect(readExpression('τ[a]∅', true)).toStrictEqual(new Empty());
    expect(readExpression('τ[a]ϵ', true)).toStrictEqual(new Token('a'));
    expect(readExpression('ϵτ[a]', true)).toStrictEqual(new Token('a'));
})

test('read star star', () => {
    expect(readExpression('τ[a]**', false)).toStrictEqual(new KleeneStar(new KleeneStar(new Token('a'))));
})

test('read smart star', () => {
    expect(readExpression('τ[a]**', true)).toStrictEqual(new KleeneStar(new Token('a')));
})
