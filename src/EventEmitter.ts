export class EventEmitter<T extends any[] = any[]> {
    static readonly events = {
        any: Symbol("any")
    };

    #listeners = new Map<PropertyKey, Array<(...args: T) => void>>();

    on(event: PropertyKey, listener: (...args: T) => void) {
        let container;
        (container = this.#listeners.get(event)) ?? this.#listeners.set(event, (container = []));
        container.push(listener);
    }
    off(event: PropertyKey, listener: (...args: T) => void) {
        const container = this.#listeners.get(event);
        if (container == undefined) return;
        const index = container.indexOf(listener);
        if (index < 0) return;

        if (container.length - index > 1) {
            container[index] = container.pop()!;
        } else {
            container.pop();
        }

        if (container.length == 0) {
            this.#listeners.delete(event);
        }
    }

    onAny(listener: (...args: T) => void) {
        this.on(EventEmitter.events.any, listener);
    }
    offAny(listener: (...args: T) => void) {
        this.off(EventEmitter.events.any, listener);
    }

    emit(event: PropertyKey, ...args: T) {
        const container = this.#listeners.get(event);
        if (container == undefined) return;
        for (const listener of container) {
            listener(...args);
        }
    }
}
