type Callback<T> = (value: T) => void;

let batchDepth = 0;
const pending = new Set<Signal<any>>();

export function batch(fn: () => void): void {
    batchDepth++;
    try {
        fn();
    } finally {
        if (--batchDepth === 0) {
            for (const s of pending) s._notify();
            pending.clear();
        }
    }
}

export class Signal<T> {
    private _value: T;
    private _subs = new Set<Callback<T>>();

    constructor(value: T) {
        this._value = value;
    }

    get(): T {
        return this._value;
    }

    set(value: T): void {
        if (value === this._value) return;
        this._value = value;
        if (batchDepth > 0) {
            pending.add(this);
        } else {
            this._notify();
        }
    }

    subscribe(cb: Callback<T>): () => void {
        this._subs.add(cb);
        return () => { this._subs.delete(cb); };
    }

    /** @internal Called by batch() to flush pending notifications. */
    _notify(): void {
        const v = this._value;
        for (const cb of this._subs) cb(v);
    }
}

/** Bridge a Signal one-way into a FlexUI WritableStore. Syncs initial value. */
export function bridge<T>(
    signal: Signal<T>,
    target: { set(value: T): void }
): () => void {
    target.set(signal.get());
    return signal.subscribe(v => target.set(v));
}
