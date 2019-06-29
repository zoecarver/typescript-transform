# Typescript Transformer

This is a WIP tool for generating typescript from javascript. Contributions are welcome!

## Example:

**Input**

```javascript
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
```

**Output**

```typescript
function add(a: number, b: number): number {
    return a + b;
}

add('hello ', 'world');
add(1, 2);

const x: number = 1;
const arr: Array<number | string> = [1, 'one'];
const obj: any = { foo: 'bar' };

function getX(): number {
    return x;
}

function xPlusOne(): number {
    return getX() + 1;
}

function helloX(): string {
    return 'hello: ' + x;
}
```

## Getting Started

-   clone this repo
-   npm install
-   `$ node index.js test-file.js`

## Disclaimer

This tool is in very early stages.
