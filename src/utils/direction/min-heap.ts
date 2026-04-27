export class MinHeap<T> {
	private heap: T[];

	constructor(private comparator: (a: T, b: T) => number) {
		this.heap = new Array<T>();
	}

	get size(): number {
		return this.heap.length;
	}

	get isEmpty(): boolean {
		return this.heap.length === 0;
	}

	push(item: T) {
		this.heap.push(item);
		this.bubbleUp(this.heap.length - 1);
	}

	pop(): T | undefined {
		if (this.isEmpty) {
			return undefined;
		}

		const top = this.heap[0];
		const last = this.heap.pop()!;

		if (this.heap.length > 0) {
			this.heap[0] = last;
			this.sinkDown(0);
		}

		return top;
	}

	peek(): T | undefined {
		return this.heap[0];
	}

	private bubbleUp(index: number) {
		while (index > 0) {
			const parent = (index - 1) >> 1;
			if (this.comparator(this.heap[index], this.heap[parent]) < 0) {
				[this.heap[index], this.heap[parent]] = [
					this.heap[parent],
					this.heap[index],
				];
				index = parent;
			} else {
				break;
			}
		}
	}

	private sinkDown(index: number) {
		const length = this.heap.length;

		while (true) {
			const left = 2 * index + 1;
			const right = 2 * index + 2;
			let smallest = index;

			if (
				left < length &&
				this.comparator(this.heap[left], this.heap[smallest]) < 0
			) {
				smallest = left;
			}
			if (
				right < length &&
				this.comparator(this.heap[right], this.heap[smallest]) < 0
			) {
				smallest = right;
			}
			if (smallest === index) {
				break;
			}

			[this.heap[index], this.heap[smallest]] = [
				this.heap[smallest],
				this.heap[index],
			];
			index = smallest;
		}
	}
}
