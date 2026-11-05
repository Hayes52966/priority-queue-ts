import assert from 'node:assert';

/**
 * A binary min-heap priority queue with O(1) lookup of an entry's current index,
 * enabling direct decrease-key (or increase-key) without a full rebuild.
 *
 * The queue stores opaque values and associates each with a numeric priority.
 * Lower numbers mean higher priority. When priorities are equal, the order is
 * unspecified but stable in the sense that no entry is lost or duplicated.
 *
 * Why a separate index map? A binary heap alone gives O(log n) push/pop but
 * updating an arbitrary element's priority normally requires a linear scan to
 * find it. By keeping a Map from value to heap index, we can locate the element
 * in O(1) and then sift it up or down in O(log n). This is the classic
 * decrease-key operation needed by Dijkstra's algorithm.
 *
 * Trade-off: values must be unique and usable as Map keys. That is a real
 * restriction; if you need duplicate values, wrap them in an object.
 */
export class PriorityQueue {
  /**
   * @param {Iterable<[any, number]>} [entries] Optional iterable of [value, priority] pairs.
   */
  constructor(entries = []) {
    /** @type {Array<{value: any, priority: number}>} */
    this._heap = [];
    /** @type {Map<any, number>} */
    this._index = new Map();

    for (const [value, priority] of entries) {
      this.push(value, priority);
    }
  }

  /**
   * Number of entries in the queue.
   * @returns {number}
   */
  get size() {
    return this._heap.length;
  }

  /**
   * Whether the queue is empty.
   * @returns {boolean}
   */
  get isEmpty() {
    return this._heap.length === 0;
  }

  /**
   * Insert a new value with the given priority.
   * Throws if the value is already present, because we cannot track two indices
   * for the same Map key.
   * @param {any} value
   * @param {number} priority
   */
  push(value, priority) {
    if (this._index.has(value)) {
      throw new Error('PriorityQueue already contains this value');
    }
    const node = { value, priority };
    this._heap.push(node);
    const i = this._heap.length - 1;
    this._index.set(value, i);
    this._siftUp(i);
  }

  /**
   * Remove and return the value with the smallest priority.
   * @returns {any} The value, or undefined if the queue is empty.
   */
  pop() {
    if (this._heap.length === 0) {
      return undefined;
    }
    const top = this._heap[0];
    const last = this._heap.pop();
    this._index.delete(top.value);
    if (this._heap.length > 0) {
      this._heap[0] = last;
      this._index.set(last.value, 0);
      this._siftDown(0);
    }
    return top.value;
  }

  /**
   * Return the value with the smallest priority without removing it.
   * @returns {any} The value, or undefined if the queue is empty.
   */
  peek() {
    return this._heap.length > 0 ? this._heap[0].value : undefined;
  }

  /**
   * Get the priority of a stored value.
   * @param {any} value
   * @returns {number|undefined}
   */
  getPriority(value) {
    const i = this._index.get(value);
    return i === undefined ? undefined : this._heap[i].priority;
  }

  /**
   * Change the priority of an existing value.
   * This is the direct decrease-key (or increase-key) operation: it locates the
   * entry in O(1) and re-heapifies in O(log n), with no full rebuild.
   * @param {any} value
   * @param {number} newPriority
   */
  setPriority(value, newPriority) {
    const i = this._index.get(value);
    if (i === undefined) {
      throw new Error('PriorityQueue does not contain this value');
    }
    const oldPriority = this._heap[i].priority;
    this._heap[i].priority = newPriority;
    if (newPriority < oldPriority) {
      this._siftUp(i);
    } else if (newPriority > oldPriority) {
      this._siftDown(i);
    }
    // If equal, nothing to do.
  }

  /**
   * Check whether a value is currently in the queue.
   * @param {any} value
   * @returns {boolean}
   */
  has(value) {
    return this._index.has(value);
  }

  /**
   * Remove a specific value from the queue, regardless of its priority.
   * @param {any} value
   * @returns {boolean} True if the value was found and removed.
   */
  remove(value) {
    const i = this._index.get(value);
    if (i === undefined) {
      return false;
    }
    this._index.delete(value);
    const last = this._heap.pop();
    if (i < this._heap.length) {
      this._heap[i] = last;
      this._index.set(last.value, i);
      // The last element may need to move up or down.
      this._siftDown(i);
      this._siftUp(i);
    }
    return true;
  }

  /**
   * Remove all entries.
   */
  clear() {
    this._heap.length = 0;
    this._index.clear();
  }

  /**
   * Return an array of values in heap order (not sorted).
   * Useful for debugging; the order is implementation-defined.
   * @returns {Array<any>}
   */
  toArray() {
    return this._heap.map((node) => node.value);
  }

  // --- internal heap helpers ---

  _siftUp(i) {
    const node = this._heap[i];
    while (i > 0) {
      const parent = (i - 1) >> 1;
      const parentNode = this._heap[parent];
      if (node.priority >= parentNode.priority) {
        break;
      }
      this._heap[i] = parentNode;
      this._index.set(parentNode.value, i);
      i = parent;
    }
    this._heap[i] = node;
    this._index.set(node.value, i);
  }

  _siftDown(i) {
    const n = this._heap.length;
    const node = this._heap[i];
    while (true) {
      const left = 2 * i + 1;
      const right = left + 1;
      let smallest = i;
      let smallestNode = node;

      if (left < n) {
        const leftNode = this._heap[left];
        if (leftNode.priority < smallestNode.priority) {
          smallest = left;
          smallestNode = leftNode;
        }
      }
      if (right < n) {
        const rightNode = this._heap[right];
        if (rightNode.priority < smallestNode.priority) {
          smallest = right;
          smallestNode = rightNode;
        }
      }

      if (smallest === i) {
        break;
      }

      this._heap[i] = smallestNode;
      this._index.set(smallestNode.value, i);
      i = smallest;
    }
    this._heap[i] = node;
    this._index.set(node.value, i);
  }
}
