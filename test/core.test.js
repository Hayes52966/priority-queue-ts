import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PriorityQueue } from '../src/index.js';

test('push and pop maintain min-heap order', () => {
  const pq = new PriorityQueue();
  pq.push('b', 2);
  pq.push('a', 1);
  pq.push('c', 3);
  assert.equal(pq.size, 3);
  assert.equal(pq.pop(), 'a');
  assert.equal(pq.pop(), 'b');
  assert.equal(pq.pop(), 'c');
  assert.equal(pq.pop(), undefined);
  assert.equal(pq.size, 0);
});

test('peek returns highest priority without removing', () => {
  const pq = new PriorityQueue();
  assert.equal(pq.peek(), undefined);
  pq.push('x', 10);
  pq.push('y', 5);
  assert.equal(pq.peek(), 'y');
  assert.equal(pq.size, 2);
});

test('setPriority can decrease priority and moves item up', () => {
  const pq = new PriorityQueue();
  pq.push('a', 10);
  pq.push('b', 20);
  pq.push('c', 30);
  // Decrease 'c' from 30 to 1, it should become the top.
  pq.setPriority('c', 1);
  assert.equal(pq.peek(), 'c');
  assert.equal(pq.pop(), 'c');
  assert.equal(pq.pop(), 'a');
  assert.equal(pq.pop(), 'b');
});

test('setPriority can increase priority and moves item down', () => {
  const pq = new PriorityQueue();
  pq.push('a', 1);
  pq.push('b', 2);
  pq.push('c', 3);
  // Increase 'a' from 1 to 5, it should sink below b and c.
  pq.setPriority('a', 5);
  assert.equal(pq.pop(), 'b');
  assert.equal(pq.pop(), 'c');
  assert.equal(pq.pop(), 'a');
});

test('getPriority returns current priority or undefined', () => {
  const pq = new PriorityQueue();
  pq.push('a', 7);
  assert.equal(pq.getPriority('a'), 7);
  assert.equal(pq.getPriority('missing'), undefined);
  pq.setPriority('a', 3);
  assert.equal(pq.getPriority('a'), 3);
});

test('has and remove work for arbitrary values', () => {
  const pq = new PriorityQueue();
  pq.push('a', 1);
  pq.push('b', 2);
  assert.equal(pq.has('a'), true);
  assert.equal(pq.has('z'), false);
  assert.equal(pq.remove('a'), true);
  assert.equal(pq.has('a'), false);
  assert.equal(pq.remove('a'), false);
  assert.equal(pq.size, 1);
  assert.equal(pq.pop(), 'b');
});

test('remove the last remaining element works', () => {
  const pq = new PriorityQueue();
  pq.push('only', 42);
  assert.equal(pq.remove('only'), true);
  assert.equal(pq.size, 0);
  assert.equal(pq.pop(), undefined);
});

test('remove an element that is not the last adjusts heap correctly', () => {
  const pq = new PriorityQueue();
  pq.push('a', 1);
  pq.push('b', 2);
  pq.push('c', 3);
  pq.push('d', 4);
  // Remove 'b' (priority 2). The last element 'd' takes its place.
  assert.equal(pq.remove('b'), true);
  assert.equal(pq.size, 3);
  assert.equal(pq.pop(), 'a');
  assert.equal(pq.pop(), 'c');
  assert.equal(pq.pop(), 'd');
});

test('clear empties the queue', () => {
  const pq = new PriorityQueue();
  pq.push('a', 1);
  pq.push('b', 2);
  pq.clear();
  assert.equal(pq.size, 0);
  assert.equal(pq.isEmpty, true);
  assert.equal(pq.pop(), undefined);
});

test('constructor accepts initial entries', () => {
  const pq = new PriorityQueue([
    ['low', 100],
    ['high', 1],
    ['mid', 50],
  ]);
  assert.equal(pq.size, 3);
  assert.equal(pq.pop(), 'high');
  assert.equal(pq.pop(), 'mid');
  assert.equal(pq.pop(), 'low');
});

test('duplicate value push throws', () => {
  const pq = new PriorityQueue();
  pq.push('a', 1);
  assert.throws(() => pq.push('a', 2), /already contains/);
});

test('setPriority on missing value throws', () => {
  const pq = new PriorityQueue();
  assert.throws(() => pq.setPriority('nope', 1), /does not contain/);
});

test('toArray returns all values in heap order', () => {
  const pq = new PriorityQueue();
  pq.push('a', 3);
  pq.push('b', 1);
  pq.push('c', 2);
  const arr = pq.toArray();
  assert.equal(arr.length, 3);
  assert.deepEqual(new Set(arr), new Set(['a', 'b', 'c']));
});

test('setPriority with equal priority is a no-op', () => {
  const pq = new PriorityQueue();
  pq.push('a', 5);
  pq.push('b', 5);
  pq.setPriority('a', 5);
  assert.equal(pq.size, 2);
  // Order between equal priorities is unspecified, but both must be present.
  const first = pq.pop();
  const second = pq.pop();
  assert.deepEqual(new Set([first, second]), new Set(['a', 'b']));
});

test('mixed push and pop with interleaved setPriority', () => {
  const pq = new PriorityQueue();
  pq.push('a', 5);
  pq.push('b', 3);
  pq.push('c', 8);
  pq.setPriority('c', 1);
  assert.equal(pq.pop(), 'c');
  pq.push('d', 2);
  pq.setPriority('a', 0);
  assert.equal(pq.pop(), 'a');
  assert.equal(pq.pop(), 'd');
  assert.equal(pq.pop(), 'b');
  assert.equal(pq.isEmpty, true);
});
