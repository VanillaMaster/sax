import {
    CHAR_C_LOWER,
    CHAR_EQUAL,
    CHAR_EXCLAMATION_MARK,
    CHAR_E_LOWER,
    CHAR_GREATER,
    CHAR_I_LOWER,
    CHAR_LESS,
    CHAR_L_LOWER,
    CHAR_MINUS,
    CHAR_P_LOWER,
    CHAR_QUOTATION_DOUBLE,
    CHAR_QUOTATION_SINGLE,
    CHAR_R_LOWER,
    CHAR_SLASH,
    CHAR_S_LOWER,
    CHAR_T_LOWER,
    CHAR_Y_LOWER
} from "./char.js";

import {
    isValidAttrNameSymbol,
    isLetter,
    isSpace,
    isValidTagNameSymbol
} from "./guard.js";

import { STATE } from "./state.js"

type attrEntry = [attr: string, value?: string];

interface BASE_NODE {
    type: string;
    attributes: attrEntry[];
}
interface OPENING_NODE extends BASE_NODE {
    type: "OPENING_NODE";
    name: string;
}
interface CLOSING_NODE extends BASE_NODE {
    type: "CLOSING_NODE";
    name: string;
}
interface SELF_CLOSING_NODE extends BASE_NODE {
    type: "SELF_CLOSING_NODE";
    name: string;
}
interface META_NODE extends BASE_NODE {
    type: "META_NODE";
    name: string;
}
interface SCRIPT_NODE extends BASE_NODE {
    type: "SCRIPT_NODE";
    body: string;
}
interface STYLE_NODE extends BASE_NODE {
    type: "STYLE_NODE";
    body: string;
}
interface COMMENT_NODE extends BASE_NODE {
    type: "COMMENT_NODE";
    body: string;
}
interface TEXT_NODE extends BASE_NODE {
    type: "TEXT_NODE"
    body: string;
}

type node = OPENING_NODE | CLOSING_NODE | META_NODE | SCRIPT_NODE | STYLE_NODE | COMMENT_NODE | TEXT_NODE | SELF_CLOSING_NODE;
type nodeType = node["type"];

export class Automata {
    constructor() { }

    private state: STATE = STATE.NONE;

    private buffer: number[] = [];

    private node?: node;

    setType(type: nodeType) {
        // console.log(type);
        if (this.node) {
            console.log(JSON.stringify(this.node));
        }
        this.node = {
            type,
        } as any;
    }

    setName(name: string) {
        // console.log(name);
        //@ts-ignore
        this.node.name = name;
    }

    setBody(body: string) {
        // console.log(body);
        //@ts-ignore
        this.node.body = body;
    }

    setAttrName(name: string) {
        // console.log(name);
        //@ts-ignore
        (this.node.attributes ?? (this.node.attributes = [])).push([name]);
    }

    setAttrValue(value: string) {
        // console.log(value);
        //@ts-ignore
        this.node.attributes[this.node.attributes.length - 1][1] = value;
    }

    private static readonly stateBinding: Record<STATE, ((this: Automata, symbol: number) => void)> = {
        /**
         * ``` ```
         */
        [STATE.NONE](symbol: number) {
            if (symbol == CHAR_LESS) {
                this.state = STATE.NODE_START;
                // this.buffer.length = 0;
            } else if (isSpace(symbol)) {
                //ok
                // this.buffer.push(symbol)
            } else {
                this.state = STATE.TEXT_NODE;

                this.buffer.push(symbol)
            }
        },

        /**
         * ```<```
         */
        [STATE.NODE_START](symbol: number) {
            if (symbol == CHAR_SLASH) {
                this.state = STATE.CLOSING_NODE
            } else if (symbol == CHAR_EXCLAMATION_MARK) {
                this.state = STATE.META_NODE;
            } else if (symbol == CHAR_S_LOWER) {
                this.state = STATE.NODE_START_SCRIPT_OR_STYLE_1;

                this.buffer.push(symbol);
                // console.log("OPENING_NODE");
                this.setType("OPENING_NODE");
            } else if (isLetter(symbol)) {
                this.state = STATE.NODE_NAME;

                this.buffer.push(symbol);
                // console.log("OPENING_NODE");
                this.setType("OPENING_NODE");
            } else throw new Error(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```<s```
         */
        [STATE.NODE_START_SCRIPT_OR_STYLE_1](symbol: number) {
            if (symbol == CHAR_C_LOWER) {
                this.state = STATE.NODE_START_SCRIPT_2;

                this.buffer.push(symbol);
            } else if (symbol == CHAR_T_LOWER) {
                this.state = STATE.NODE_START_STYLE_2;

                this.buffer.push(symbol);
            } else Automata.stateBinding[STATE.NODE_NAME].call(this, symbol);
        },

        /**
         * ```<sc```
         */
        [STATE.NODE_START_SCRIPT_2](symbol: number) {
            if (symbol == CHAR_R_LOWER) {
                this.state = STATE.NODE_START_SCRIPT_3;

                this.buffer.push(symbol);
            } else Automata.stateBinding[STATE.NODE_NAME].call(this, symbol);
        },

        /**
         * ```<scr```
         */
        [STATE.NODE_START_SCRIPT_3](symbol: number) {
            if (symbol == CHAR_I_LOWER) {
                this.state = STATE.NODE_START_SCRIPT_4;

                this.buffer.push(symbol);
            } else Automata.stateBinding[STATE.NODE_NAME].call(this, symbol);
        },

        /**
         * ```<scri```
         */
        [STATE.NODE_START_SCRIPT_4](symbol: number) {
            if (symbol == CHAR_P_LOWER) {
                this.state = STATE.NODE_START_SCRIPT_5;

                this.buffer.push(symbol);
            } else Automata.stateBinding[STATE.NODE_NAME].call(this, symbol);
        },

        /**
         * ```<scrip```
         */
        [STATE.NODE_START_SCRIPT_5](symbol: number) {
            if (symbol == CHAR_T_LOWER) {
                this.state = STATE.NODE_START_SCRIPT_6;

                this.buffer.push(symbol);
            } else Automata.stateBinding[STATE.NODE_NAME].call(this, symbol);
        },

        /**
         * ```<script```
         */
        [STATE.NODE_START_SCRIPT_6](symbol: number) {
            if (isSpace(symbol)) {
                this.state = STATE.NODE_SCRIPT_BODY;

                // console.log("SCRIPT");
                this.setType("SCRIPT_NODE");
                this.buffer.length = 0;
            } else if (symbol == CHAR_GREATER) {
                this.state = STATE.SCRIPT_BODY;

                // console.log("SCRIPT");
                this.setType("SCRIPT_NODE");
                this.buffer.length = 0;
            } else Automata.stateBinding[STATE.NODE_NAME].call(this, symbol);
        },

        [STATE.NODE_SCRIPT_BODY](symbol: number) {
            if (symbol == CHAR_GREATER) {
                this.state = STATE.SCRIPT_BODY;
            } else if (isLetter(symbol)) {
                this.state = STATE.NODE_SCRIPT_ATTR_NAME;

                this.buffer.push(symbol);
            } else if (isSpace(symbol)) {
                //ok
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        [STATE.NODE_SCRIPT_ATTR_NAME](symbol: number) {
            if (isValidAttrNameSymbol(symbol)) {
                //ok
                this.buffer.push(symbol);
            } else if (symbol == CHAR_EQUAL) {
                this.state = STATE.NODE_SCRIPT_ATTR_VALUE_START;

                // console.log("NODE_ATTR_NAME:", String.fromCharCode(...this.buffer));
                this.setAttrName(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else if (isSpace(symbol)) {
                this.state = STATE.NODE_SCRIPT_BODY;

                // console.log("NODE_ATTR_NAME:", String.fromCharCode(...this.buffer));
                this.setAttrName(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else if (symbol == CHAR_GREATER) {
                this.state = STATE.SCRIPT_BODY;

                // console.log("NODE_ATTR_NAME:", String.fromCharCode(...this.buffer));
                this.setAttrName(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        [STATE.NODE_SCRIPT_ATTR_VALUE_START](symbol: number) {
            if (symbol == CHAR_QUOTATION_DOUBLE) {
                this.state = STATE.NODE_SCRIPT_ATTR_VALUE_BODY_DOUBLE_QUOTATION;
            } else if (symbol == CHAR_QUOTATION_SINGLE) {
                this.state = STATE.NODE_SCRIPT_ATTR_VALUE_BODY_SINGLE_QUOTATION;
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        [STATE.NODE_SCRIPT_ATTR_VALUE_BODY_DOUBLE_QUOTATION](symbol: number) {
            if (symbol == CHAR_QUOTATION_DOUBLE) {
                this.state = STATE.NODE_SCRIPT_BODY;

                // console.log("NODE_ATTR_VALUE:", String.fromCharCode(...this.buffer));
                this.setAttrValue(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else {
                this.buffer.push(symbol);
            }
        },
        [STATE.NODE_SCRIPT_ATTR_VALUE_BODY_SINGLE_QUOTATION](symbol: number) {
            if (symbol == CHAR_QUOTATION_SINGLE) {
                this.state = STATE.NODE_SCRIPT_BODY;

                // console.log("NODE_ATTR_VALUE:", String.fromCharCode(...this.buffer));
                this.setAttrValue(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else {
                this.buffer.push(symbol);
            }
        },

        [STATE.SCRIPT_BODY](symbol: number) {
            if (symbol == CHAR_LESS) {
                this.state = STATE.NODE_END_SCRIPT_1;

                this.buffer.push(symbol);
            } else {
                //ok
                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_SCRIPT_1](symbol: number) {
            if (symbol == CHAR_SLASH) {
                this.state = STATE.NODE_END_SCRIPT_2;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.SCRIPT_BODY;

                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_SCRIPT_2](symbol: number) {
            if (symbol == CHAR_S_LOWER) {
                this.state = STATE.NODE_END_SCRIPT_3;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.SCRIPT_BODY;

                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_SCRIPT_3](symbol: number) {
            if (symbol == CHAR_C_LOWER) {
                this.state = STATE.NODE_END_SCRIPT_4;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.SCRIPT_BODY;

                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_SCRIPT_4](symbol: number) {
            if (symbol == CHAR_R_LOWER) {
                this.state = STATE.NODE_END_SCRIPT_5;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.SCRIPT_BODY;

                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_SCRIPT_5](symbol: number) {
            if (symbol == CHAR_I_LOWER) {
                this.state = STATE.NODE_END_SCRIPT_6;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.SCRIPT_BODY;

                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_SCRIPT_6](symbol: number) {
            if (symbol == CHAR_P_LOWER) {
                this.state = STATE.NODE_END_SCRIPT_7;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.SCRIPT_BODY;

                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_SCRIPT_7](symbol: number) {
            if (symbol == CHAR_T_LOWER) {
                this.state = STATE.NODE_END_SCRIPT_8;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.SCRIPT_BODY;

                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_SCRIPT_8](symbol: number) {
            if (symbol == CHAR_GREATER) {
                this.state = STATE.NONE;

                this.buffer.length -= 8;
                // console.log("SCRIPT:", String.fromCharCode(...this.buffer));
                this.setBody(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else {
                this.state = STATE.SCRIPT_BODY;

                this.buffer.push(symbol);
            }
        },

        /**
         * ```<st```
         */
        [STATE.NODE_START_STYLE_2](symbol: number) {
            if (symbol == CHAR_Y_LOWER) {
                this.state = STATE.NODE_START_STYLE_3;

                this.buffer.push(symbol);
            } else Automata.stateBinding[STATE.NODE_NAME].call(this, symbol);
        },

        /**
         * ```<sty```
         */
        [STATE.NODE_START_STYLE_3](symbol: number) {
            if (symbol == CHAR_L_LOWER) {
                this.state = STATE.NODE_START_STYLE_4;

                this.buffer.push(symbol);
            } else Automata.stateBinding[STATE.NODE_NAME].call(this, symbol);
        },

        /**
         * ```<styl```
         */
        [STATE.NODE_START_STYLE_4](symbol: number) {
            if (symbol == CHAR_E_LOWER) {
                this.state = STATE.NODE_START_STYLE_5;

                this.buffer.push(symbol);
            } else Automata.stateBinding[STATE.NODE_NAME].call(this, symbol);
        },

        /**
         * ```<style```
         */
        [STATE.NODE_START_STYLE_5](symbol: number) {
            if (isSpace(symbol)) {
                this.state = STATE.NODE_STYLE_BODY;

                // console.log("STYLE");
                this.setType("STYLE_NODE");
                this.buffer.length = 0;
            } else if (symbol == CHAR_GREATER) {
                this.state = STATE.STYLE_BODY;

                // console.log("STYLE");
                this.setType("STYLE_NODE");
                this.buffer.length = 0;
            } else Automata.stateBinding[STATE.NODE_NAME].call(this, symbol);
        },

        [STATE.NODE_STYLE_BODY](symbol: number) {
            if (symbol == CHAR_GREATER) {
                this.state = STATE.STYLE_BODY;
            } else if (isLetter(symbol)) {
                this.state = STATE.NODE_STYLE_ATTR_NAME;

                this.buffer.push(symbol);
            } else if (isSpace(symbol)) {
                //ok
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        [STATE.NODE_STYLE_ATTR_NAME](symbol: number) {
            if (isValidAttrNameSymbol(symbol)) {
                //ok
                this.buffer.push(symbol);
            } else if (symbol == CHAR_EQUAL) {
                this.state = STATE.NODE_STYLE_ATTR_VALUE_START;

                // console.log("NODE_ATTR_NAME:", String.fromCharCode(...this.buffer));
                this.setAttrName(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else if (isSpace(symbol)) {
                this.state = STATE.NODE_STYLE_BODY;

                // console.log("NODE_ATTR_NAME:", String.fromCharCode(...this.buffer));
                this.setAttrName(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else if (symbol == CHAR_GREATER) {
                this.state = STATE.STYLE_BODY;

                // console.log("NODE_ATTR_NAME:", String.fromCharCode(...this.buffer));
                this.setAttrName(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        [STATE.NODE_STYLE_ATTR_VALUE_START](symbol: number) {
            if (symbol == CHAR_QUOTATION_DOUBLE) {
                this.state = STATE.NODE_STYLE_ATTR_VALUE_BODY_DOUBLE_QUOTATION;
            } else if (symbol == CHAR_QUOTATION_SINGLE) {
                this.state = STATE.NODE_STYLE_ATTR_VALUE_BODY_SINGLE_QUOTATION;
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        [STATE.NODE_STYLE_ATTR_VALUE_BODY_DOUBLE_QUOTATION](symbol: number) {
            if (symbol == CHAR_QUOTATION_DOUBLE) {
                this.state = STATE.NODE_STYLE_BODY;

                // console.log("NODE_ATTR_VALUE:", String.fromCharCode(...this.buffer));
                this.setAttrValue(String.fromCharCode(...this.buffer))
                this.buffer.length = 0;
            } else {
                this.buffer.push(symbol);
            }
        },
        [STATE.NODE_STYLE_ATTR_VALUE_BODY_SINGLE_QUOTATION](symbol: number) {
            if (symbol == CHAR_QUOTATION_SINGLE) {
                this.state = STATE.NODE_STYLE_BODY;

                // console.log("NODE_ATTR_VALUE:", String.fromCharCode(...this.buffer));
                this.setAttrValue(String.fromCharCode(...this.buffer))
                this.buffer.length = 0;
            } else {
                this.buffer.push(symbol);
            }
        },

        [STATE.STYLE_BODY](symbol: number) {
            if (symbol == CHAR_LESS) {
                this.state = STATE.NODE_END_STYLE_1;

                this.buffer.push(symbol);
            } else {
                //ok
                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_STYLE_1](symbol: number) {
            if (symbol == CHAR_SLASH) {
                this.state = STATE.NODE_END_STYLE_2;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.STYLE_BODY;

                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_STYLE_2](symbol: number) {
            if (symbol == CHAR_S_LOWER) {
                this.state = STATE.NODE_END_STYLE_3;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.STYLE_BODY;

                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_STYLE_3](symbol: number) {
            if (symbol == CHAR_T_LOWER) {
                this.state = STATE.NODE_END_STYLE_4;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.STYLE_BODY;

                this.buffer.push(symbol);
            }
        },


        [STATE.NODE_END_STYLE_4](symbol: number) {
            if (symbol == CHAR_Y_LOWER) {
                this.state = STATE.NODE_END_STYLE_5;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.STYLE_BODY;

                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_STYLE_5](symbol: number) {
            if (symbol == CHAR_L_LOWER) {
                this.state = STATE.NODE_END_STYLE_6;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.STYLE_BODY;

                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_STYLE_6](symbol: number) {
            if (symbol == CHAR_E_LOWER) {
                this.state = STATE.NODE_END_STYLE_7;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.STYLE_BODY;

                this.buffer.push(symbol);
            }
        },

        [STATE.NODE_END_STYLE_7](symbol: number) {
            if (symbol == CHAR_GREATER) {
                this.state = STATE.NONE;

                this.buffer.length -= 7;
                // console.log("STYLE:", String.fromCharCode(...this.buffer));
                this.setBody(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else {
                this.state = STATE.STYLE_BODY;

                this.buffer.push(symbol);
            }
        },

        /**
         * ```<!```
         */
        [STATE.META_NODE](symbol: number) {
            if (symbol == CHAR_MINUS) {
                this.state = STATE.COMMENT_NODE;
            } else if (isLetter(symbol)) {
                this.state = STATE.NODE_NAME;

                // console.log("META_NODE");
                this.setType("META_NODE");
                this.buffer.push(symbol);
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```</```
         */
        [STATE.CLOSING_NODE](symbol: number) {
            if (isLetter(symbol)) {
                this.state = STATE.NODE_NAME;

                // console.log("CLOSING_NODE");
                this.setType("CLOSING_NODE");
                this.buffer.push(symbol);
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```<!-```
         */
        [STATE.COMMENT_NODE](symbol: number) {
            if (symbol == CHAR_MINUS) {
                this.state = STATE.COMMENT_NODE_BODY;

                // console.log("COMMENT_START");
                this.setType("COMMENT_NODE");
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```<!--```
         */
        [STATE.COMMENT_NODE_BODY](symbol: number) {
            if (symbol == CHAR_MINUS) {
                this.state = STATE.COMMENT_NODE_END_1;

                this.buffer.push(symbol);
            } else {
                //ok
                this.buffer.push(symbol);
            }
        },

        /**
         * ```<!--[any]-```
         */
        [STATE.COMMENT_NODE_END_1](symbol: number) {
            if (symbol == CHAR_MINUS) {
                this.state = STATE.COMMENT_NODE_END_2;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.COMMENT_NODE_BODY;

                this.buffer.push(symbol);
            }
        },

        /**
         * ```<!--[any]--```
         */
        [STATE.COMMENT_NODE_END_2](symbol: number) {
            if (symbol == CHAR_GREATER) {
                this.state = STATE.NONE;

                this.buffer.length -= 2;
                // console.log("COMMENT_NODE:", String.fromCharCode(...this.buffer));
                this.setBody(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
                // console.log("COMMENT_END");
            } else if (symbol = CHAR_MINUS) {
                this.state = STATE.COMMENT_NODE_END_2;

                this.buffer.push(symbol);
            } else {
                this.state = STATE.COMMENT_NODE_BODY;

                this.buffer.push(symbol);
            }
        },

        /**
         * ```<```
         * ```</```
         * ```<!```
         */
        [STATE.NODE_NAME](symbol: number) {
            if (isValidTagNameSymbol(symbol)) {
                //ok
                this.buffer.push(symbol);
            } else if (isSpace(symbol)) {
                this.state = STATE.NODE_BODY;

                // console.log("NODE_NAME:", String.fromCharCode(...this.buffer));
                this.setName(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else if (symbol == CHAR_GREATER) {
                this.state = STATE.NONE;

                // console.log("NODE_NAME:", String.fromCharCode(...this.buffer));
                this.setName(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```<name ```
         * ```<!meta ```
         * ```</name ```
         */
        [STATE.NODE_BODY](symbol: number) {
            if (symbol == CHAR_GREATER) {
                this.state = STATE.NONE;
            } else if (isLetter(symbol)) {
                this.state = STATE.NODE_ATTR_NAME;

                this.buffer.push(symbol);
            } else if (isSpace(symbol)) {
                //ok
            } else if (symbol == CHAR_SLASH) {
                this.state = STATE.NODE_BODY_SELF_CLOSING;

            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        [STATE.NODE_BODY_SELF_CLOSING](symbol: number) {
            if (symbol == CHAR_GREATER) {
                this.state = STATE.NONE;

                // console.log("NODE_SELF_CLOSING");
                this.setType("SELF_CLOSING_NODE");
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```<name a```
         * ```<!meta a```
         * ```</name a``` - invalid
         */
        [STATE.NODE_ATTR_NAME](symbol: number) {
            if (isValidAttrNameSymbol(symbol)) {
                //ok
                this.buffer.push(symbol);
            } else if (symbol == CHAR_EQUAL) {
                this.state = STATE.NODE_ATTR_VALUE_START;

                // console.log("NODE_ATTR_NAME:", String.fromCharCode(...this.buffer));
                this.setAttrName(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else if (isSpace(symbol)) {
                this.state = STATE.NODE_BODY;

                // console.log("NODE_ATTR_NAME:", String.fromCharCode(...this.buffer));
                this.setAttrName(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else if (symbol == CHAR_GREATER) {
                this.state = STATE.NONE;

                // console.log("NODE_ATTR_NAME:", String.fromCharCode(...this.buffer));
                this.setAttrName(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```<name a=```
         * ```<!meta a=```
         * ```</name a=```
         */
        [STATE.NODE_ATTR_VALUE_START](symbol: number) {
            if (symbol == CHAR_QUOTATION_DOUBLE) {
                this.state = STATE.NODE_ATTR_VALUE_BODY_DOUBLE_QUOTATION;
            } else if (symbol == CHAR_QUOTATION_SINGLE) {
                this.state = STATE.NODE_ATTR_VALUE_BODY_SINGLE_QUOTATION;
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```<name a="```
         * ```<!meta a="```
         * ```</name a="```
         */
        [STATE.NODE_ATTR_VALUE_BODY_DOUBLE_QUOTATION](symbol: number) {
            if (symbol == CHAR_QUOTATION_DOUBLE) {
                this.state = STATE.NODE_BODY;

                // console.log("NODE_ATTR_VALUE:", String.fromCharCode(...this.buffer));
                this.setAttrValue(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else {
                this.buffer.push(symbol);
            }
        },

        /**
         * ```<name a='```
         * ```<!meta a='```
         * ```</name a='```
         */
        [STATE.NODE_ATTR_VALUE_BODY_SINGLE_QUOTATION](symbol: number) {
            if (symbol == CHAR_QUOTATION_SINGLE) {
                this.state = STATE.NODE_BODY;

                // console.log("NODE_ATTR_VALUE:", String.fromCharCode(...this.buffer));
                this.setAttrValue(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else {
                this.buffer.push(symbol);
            }
        },

        /**
         * ```[any - text]```
         */
        [STATE.TEXT_NODE](symbol: number) {
            if (symbol == CHAR_LESS) {
                this.state = STATE.NODE_START;

                // console.log("TEXT_NODE:", String.fromCharCode(...this.buffer));
                this.setBody(String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else {
                //ok
                this.buffer.push(symbol);
            }
        }
    }

    push(symbol: number) {
        Automata.stateBinding[this.state].call(this, symbol);
    }

    pushChunk(chunk: string) {
        for (let i = 0; i < chunk.length; i++) {
            this.push(chunk.charCodeAt(i));
        }
    }
}
