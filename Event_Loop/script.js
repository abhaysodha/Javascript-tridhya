console.log('start');

setTimeout(() => console.log('timeout'), 0);

async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

async1();

new Promise((resolve) => {
  console.log('promise executor');
  resolve();
}).then(() => console.log('promise then'));

console.log('end');

const fs = require('fs');

console.log('start');

setTimeout(() => console.log('timeout 1'), 0);

setImmediate(() => console.log('immediate 1'));

fs.readFile(__filename, () => {
  console.log('readFile');
  setTimeout(() => console.log('timeout inside readFile'), 0);
  setImmediate(() => console.log('immediate inside readFile'));
  process.nextTick(() => console.log('nextTick inside readFile'));
});

process.nextTick(() => console.log('nextTick 1'));

Promise.resolve().then(() => console.log('promise 1'));

console.log('end');

console.log('start');

Promise.resolve()
  .then(() => console.log('1'))
  .then(() => console.log('2'))
  .then(() => console.log('3'));

Promise.resolve()
  .then(() => console.log('4'))
  .then(() => {
    console.log('5');
    Promise.resolve().then(() => console.log('6'));
  })
  .then(() => console.log('7'));

Promise.resolve().then(() => console.log('8'));

console.log('end');

async function delay(ms, val) {
  return new Promise((res) => setTimeout(() => res(val), ms));
}

async function main() {
  console.log('main start');

  const arr = [1, 2, 3];

  arr.forEach(async (item) => {
    const val = await delay(10, item);
    console.log('forEach:', val);
  });

  for (const item of arr) {
    const val = await delay(10, item);
    console.log('for-of:', val);
  }

  console.log('main end');
}

main();
console.log('outside main');

console.log('start');

function recursiveMicrotask(i) {
  if (i > 3) return;
  Promise.resolve().then(() => {
    console.log('microtask', i);
    recursiveMicrotask(i + 1);
  });
}

recursiveMicrotask(0);

setTimeout(() => {
  console.log('timeout — will this ever run?');
}, 0);

console.log('end');