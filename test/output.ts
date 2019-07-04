// const x = 5;
// x = 'foo';

let z:number[] = [1, 2, 3];
let a:Array<string|number|any> = ['a', 0, true];

function c(x:number, y:number, z:number):number {
    return x + y + z;
}

c(2, 1, 0);

function b(x:number, y:number, z:number):number {
    return x;
}

b(0, 1, 2);

function y(a:number|string, b:string|number):number {
    return 0;
}

y(0, '');
y('', 0);

function d(a:string):string {
    return a + 1;
}

d('hello');

function e() {}

function f():string {
    return d();
}

function add(a:string|number, b:string|number):string|number {
    return a + b;
}

add('hello ', 'world');
add(1, 2);

const x:number = 1;
const arr:Array<number|string> = [1, 'one'];
const obj:any = { foo: 'bar' };

function getX():number {
    return x;
}

function xPlusOne():number {
    return getX() + 1;
}

function helloX():string {
    return 'hello: ' + x;
}