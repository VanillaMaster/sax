import { NodeBuilder } from "./Automata.js"
import { toValidTagName } from "./guard.js";
import { NODE_TYPE } from "./node.js";

type attrEntry = [attr: string, value?: string];

interface BASE_NODE {
    type: NODE_TYPE;
    attributes?: attrEntry[];
    name?: unknown;
    body?: unknown;
}
export interface OPENING_NODE extends BASE_NODE {
    type: NODE_TYPE.OPENING;
    name: string;
}
export interface CLOSING_NODE extends BASE_NODE {
    type: NODE_TYPE.CLOSING;
    name: string;
}
export interface SELF_CLOSING_NODE extends BASE_NODE {
    type: NODE_TYPE.SELF_CLOSING;
    name: string;
}
export interface META_NODE extends BASE_NODE {
    type: NODE_TYPE.META;
    name: string;
}
export interface SCRIPT_NODE extends BASE_NODE {
    type: NODE_TYPE.SCRIPT;
    body: string;
}
export interface STYLE_NODE extends BASE_NODE {
    type: NODE_TYPE.STYLE;
    body: string;
}
export interface COMMENT_NODE extends BASE_NODE {
    type: NODE_TYPE.COMMENT;
    body: string;
}
export interface TEXT_NODE extends BASE_NODE {
    type: NODE_TYPE.TEXT;
    body: string;
}

export type NODE_INFO = OPENING_NODE | CLOSING_NODE | META_NODE | SCRIPT_NODE | STYLE_NODE | COMMENT_NODE | TEXT_NODE | SELF_CLOSING_NODE;

function Exception(message?: string, options?: ErrorOptions): never {
    throw new Error(message, options);
}

export interface DocumentHandler {
    push(node: NODE_INFO): void;
}

export class Builder implements NodeBuilder {
    constructor(handler: DocumentHandler){
        this.handler = handler;
    }

    private node: NODE_INFO | null = null;
    private handler: DocumentHandler;

    updateType(type: NODE_TYPE) {
        (this.node ?? Exception()).type = type;
    }

    setType(type: NODE_TYPE) {
        // console.log(type);
        if (this.node) {
            this.handler.push(this.node ?? Exception());
        }
        this.node = {
            type,
        } as NODE_INFO;
    }

    setName(name: string) {
        // console.log(name);
        (this.node ?? Exception()).name = toValidTagName(name);
    }

    setBody(body: string) {
        // console.log(body);
        (this.node ?? Exception()).body = body;
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
        this.handler.push(this.node ?? Exception());
        this.node = null;
    }

}