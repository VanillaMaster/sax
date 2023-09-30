import { NodeBuilder } from "./automata.js"
import { NODE } from "./node.js";

type attrEntry = [attr: string, value?: string];

interface BASE_NODE {
    type: NODE;
    attributes?: attrEntry[];
    name?: unknown;
    body?: unknown;
}
export interface OPENING_NODE extends BASE_NODE {
    type: NODE.OPENING;
    name: string;
}
export interface CLOSING_NODE extends BASE_NODE {
    type: NODE.CLOSING;
    name: string;
}
export interface SELF_CLOSING_NODE extends BASE_NODE {
    type: NODE.SELF_CLOSING;
    name: string;
}
export interface META_NODE extends BASE_NODE {
    type: NODE.META;
    name: string;
}
export interface SCRIPT_NODE extends BASE_NODE {
    type: NODE.SCRIPT;
    body: string;
}
export interface STYLE_NODE extends BASE_NODE {
    type: NODE.STYLE;
    body: string;
}
export interface COMMENT_NODE extends BASE_NODE {
    type: NODE.COMMENT;
    body: string;
}
export interface TEXT_NODE extends BASE_NODE {
    type: NODE.TEXT;
    body: string;
}

export type node = OPENING_NODE | CLOSING_NODE | META_NODE | SCRIPT_NODE | STYLE_NODE | COMMENT_NODE | TEXT_NODE | SELF_CLOSING_NODE;

function Exception(message?: string, options?: ErrorOptions): never {
    throw new Error(message, options);
}

export class Builder implements NodeBuilder {
    private node: node | null = null;

    updateType(type: NODE) {
        (this.node ?? Exception()).type = type;
    }

    setType(type: NODE) {
        // console.log(type);
        if (this.node) {
            console.log(this.node);
        }
        this.node = {
            type,
        } as node;
    }

    setName(name: string) {
        // console.log(name);
        (this.node ?? Exception()).name = name;
    }

    setBody(body: string) {
        // console.log(body);
        // this.node!.body = body;
        (this.node ?? Exception()).body = "...";
    }

    setAttrName(name: string) {
        // console.log(name);
        const node = this.node ?? Exception();
        (node.attributes ?? (node.attributes = [])).push([name]);
    }

    setAttrValue(value: string) {
        // console.log(value);
        const attributes = (this.node ?? Exception()).attributes ?? Exception();
        attributes[attributes.length - 1][1] = value;
    }

    finalize(){
        console.log(this.node);
        this.node = null;
    }
}