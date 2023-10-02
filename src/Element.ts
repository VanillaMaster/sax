import { EventEmitter } from "./EventEmitter.js";

export const ARENA = Symbol("element.arena");

export class Element {
    static readonly ArenaEvents = {
        disconnect: Symbol("element.atena.event.disconnect")
    };

    private static attributesEmptyDummy: Record<string, string> = {};
    constructor(name: string, value: string | null = null, attributes: Record<string, string> = Element.attributesEmptyDummy) {
        this.nodeName = name;
        this.nodeValue = value;
        this.attributes = attributes;
    }

    readonly nodeName: string;
    readonly nodeValue: string | null;
    readonly attributes: Record<string, string>;

    [ARENA]?: EventEmitter<[Element, Element[]]>;
    get arena() {
        return this[ARENA] ?? (this[ARENA] = new EventEmitter());
    }
    get [Symbol.toStringTag]() {
        return this.nodeName;
    }
}
