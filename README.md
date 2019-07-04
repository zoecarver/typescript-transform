# Typescript Transformer

This is a WIP tool for generating typescript from javascript. Contributions are welcome!

## Usage:

```
Usage: index <file> [options]

Options:
  -V, --version          output the version number
  -i, --interactive      Ask about each type before adding it
  -a, --auto             Pick the types for me
  -o, --output [output]  Output file. Defaults to stdout
  -h, --help             output usage information
```

-   Run `node index.js input.js -o output.ts` to convert `input.js` to typescript and save it to `output.ts`.
-   You will be prompted for every variable, function, and argument. To pick the default hit enter. To auto pick the types, pass the `--auto` option.
-   To skip a type just enter `skip`.
-   To use generics in a function enter `template`. This will walk you through creating a template.

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
function add(a: string | number, b: string | number): string | number {
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
