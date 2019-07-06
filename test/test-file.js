function add(a, b) {
    return a + b;
}

add('hello ', 'world');
add(1, 2);

const x = 1;
const arr = [1, 'one'];
const obj = { foo: 'bar' };

function getX() {
    return x;
}

function xPlusOne() {
    return getX() + 1;
}

function helloX() {
    return 'hello: ' + x;
}