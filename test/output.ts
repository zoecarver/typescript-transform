function add(a: string | number, b: string | number): string | number {
  return a + b;
}

add('hello ', 'world');
add(1, 2);
const x: number = 1;
const arr: [number, string] = [1, 'one'];
const obj = {
  foo: 'bar'
};

function getX(): number {
  return x;
}

function xPlusOne(): number {
  return getX() + 1;
}

function helloX(): string {
  return 'hello: ' + x;
}