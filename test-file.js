const x = 5;
x = 'foo';

let z = [1, 2, 3];
let a = ['a', 0, true];

function c(x, y, z) {
    return x + y + z;
}

c(2, 1, 0);

function b(x, y, z) {
    return x;
}

b(0, 1, 2);

function y(a, b) {
    return 0;
}

y(0, '');
y('', 0);

function d(a) {
    return a + 1;
}

d('hello');

function e() {}

function f() {
    return d();
}
