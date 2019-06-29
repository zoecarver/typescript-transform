const x = 5;
x = 'foo';

function y(a, b) {
    return 0;
}

y(0, '');
y('', 0);

let z = [1, 2, 3];
let a = ['a', 0, true];

function b(x, y, z) {
    return x + y + z;
}

b(0, 1, 2);
