# priority-queue-ts

A binary min-heap priority queue with O(1) lookup of an entry's current index, so you can change an item's priority directly (decrease-key) without rebuilding the heap.

```js
import { PriorityQueue } from './src/index.js';

const pq = new PriorityQueue();
pq.push('task-a', 10);
pq.push('task-b', 5);
pq.push('task-c', 20);

// Promote task-c: direct decrease-key, no rebuild.
pq.setPriority('task-c', 1);

console.log(pq.peek()); // 'task-c'
console.log(pq.pop());  // 'task-c'
console.log(pq.pop());  // 'task-b'
console.log(pq.pop());  // 'task-a'
```

## Why this exists

A plain binary heap gives O(log n) push and pop, but updating an arbitrary element's priority normally requires a linear scan to find it. This library keeps a `Map` from value to heap index alongside the heap. That map costs O(n) extra space, but it turns decrease-key into an O(1) lookup plus an O(log n) sift. For algorithms like Dijkstra, where you repeatedly relax edges and update tentative distances, that difference matters.

The trade-off is that values must be unique and usable as `Map` keys. If you need duplicate values, wrap each in a distinct object.

## Awkward edge

Pushing a value that is already in the queue throws. There is no silent overwrite, because silently changing a priority could hide a bug in a graph algorithm. Use `setPriority` when you mean to update an existing entry.

## API

- `new PriorityQueue(entries?)` — optionally initialize from an iterable of `[value, priority]` pairs.
- `push(value, priority)` — insert a new value; throws if already present.
- `pop()` — remove and return the value with the smallest priority, or `undefined` if empty.
- `peek()` — return the value with the smallest priority without removing it, or `undefined` if empty.
- `getPriority(value)` — return the priority of a stored value, or `undefined` if absent.
- `setPriority(value, newPriority)` — change an existing value's priority; throws if absent.
- `has(value)` — whether the value is in the queue.
- `remove(value)` — remove a specific value; returns `true` if found and removed.
- `clear()` — remove all entries.
- `size` — number of entries.
- `isEmpty` — whether the queue is empty.
- `toArray()` — all values in heap order (not sorted; useful for debugging).

Lower numbers mean higher priority. When priorities are equal, the order is unspecified.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

