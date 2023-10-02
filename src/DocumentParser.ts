import type { NODE_INFO, DocumentHandler } from "./Builder.js";
import { NODE_TYPE } from "./node.js";
import { EventEmitter } from "./EventEmitter.js";
import { Element, ARENA } from "./Element.js";

const optional_names = [
    "html",
    "head",
    "body",
    "p",
    "dt",
    "dd",
    "li",
    "ption",
    "thead",
    "th",
    "tbody",
    "tr",
    "td",
    "tfoot",
    "colgroup"
];
const void_names = [
    "area",
    "base",
    "br",
    "col",
    "doctype",
    "embed",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
];

export class DocumentParser extends EventEmitter<[Element, Element[]]> implements DocumentHandler {
    path: Element[] = [];
    push(node: NODE_INFO) {
        if (node.type == NODE_TYPE.CLOSING) {
            while (this.path.length > 0 && void_names.includes(this.path[this.path.length - 1].nodeName)) {
                this.path.pop();
            }
            const elem = this.path.pop()!; 
            if (elem.nodeName != node.name) throw new Error("invalid document structure");
            // elem[ARENA]?.emit(Element.ArenaEvents.disconnect)
            return;
        }

        let element;
        switch (node.type) {
            case NODE_TYPE.OPENING:
                if (node.attributes)
                    element = new Element(node.name, null, Object.fromEntries(node.attributes));

                else
                    element = new Element(node.name);
                break;
            case NODE_TYPE.SELF_CLOSING:
                if (node.attributes)
                    element = new Element(node.name, null, Object.fromEntries(node.attributes));

                else
                    element = new Element(node.name);
                break;
            case NODE_TYPE.META:
                if (node.attributes)
                    element = new Element(node.name, null, Object.fromEntries(node.attributes));

                else
                    element = new Element(node.name);
                break;
            case NODE_TYPE.SCRIPT:
                if (node.attributes)
                    element = new Element("script", node.body, Object.fromEntries(node.attributes));

                else
                    element = new Element("script", node.body);
                break;
            case NODE_TYPE.STYLE:
                if (node.attributes)
                    element = new Element("style", node.body, Object.fromEntries(node.attributes));

                else
                    element = new Element("style", node.body);
                break;
            case NODE_TYPE.COMMENT:
                element = new Element("#comment", node.body);
                break;
            case NODE_TYPE.TEXT:
                element = new Element("#text", node.body);
                break;
            default: throw new Error("unreachable");
        }

        this.emit(element.nodeName, element, this.path);
        for (const item of this.path) {
            if (item[ARENA]) {
                item[ARENA].emit(element.nodeName, element, this.path);
            }
        }

        if (node.type == NODE_TYPE.OPENING) {
            while (this.path.length > 0 && void_names.includes(this.path[this.path.length - 1].nodeName)) {
                this.path.pop();
            }

            this.path.push(element);
        }
    }
}
