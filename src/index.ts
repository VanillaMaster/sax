import sample from "./sample.js";

/**
 * ```>```
 */
const CHAR_GREATER = ">".charCodeAt(0);
/**
 * ```<```
 */
const CHAR_LESS = "<".charCodeAt(0);
/**
 * ```=```
 */
const CHAR_EQUAL = "=".charCodeAt(0);
/**
 * ```!```
 */
const CHAR_EXCLAMATION_MARK = "!".charCodeAt(0);
/**
 * ```"```
 */
const CHAR_QUOTATION_DOUBLE = '"'.charCodeAt(0);
/**
 * ```/```
 */
const CHAR_SLASH = "/".charCodeAt(0);
/**
 * ```-```
 */
const CHAR_MINUS = "-".charCodeAt(0);



const CHAR_A_UPPER = "A".charCodeAt(0);
const CHAR_Z_UPPER = "Z".charCodeAt(0);
const CHAR_A_LOWER = "a".charCodeAt(0);
const CHAR_Z_LOWER = "z".charCodeAt(0);

function isLetter(char: number) {
    return (CHAR_A_UPPER <= char && char <= CHAR_Z_UPPER) || (CHAR_A_LOWER <= char && char <= CHAR_Z_LOWER);
}

const CHAR_0 = "0".charCodeAt(0);
const CHAR_9 = "9".charCodeAt(0);

function isDigit(char: number) {
    return CHAR_0 <= char && char <= CHAR_9;
}

function isAlphanumeric(char: number) {
    return isLetter(char) || isDigit(char) || char == CHAR_MINUS;
}

const CHAR_SPACE = " ".charCodeAt(0);
const CHAR_NEW_LINE = "\n".charCodeAt(0);

function isSpace(char: number) {
    return char == CHAR_SPACE || char == CHAR_NEW_LINE;
}

enum STATE {
    NONE = "NONE",

    TEXT_NODE = "TEXT_NODE",

    NODE_START = "NODE_START",

    CLOSING_NODE = "CLOSING_NODE",
    META_NODE = "META_NODE",
    COMMENT_NODE = "COMMENT_NODE",
    COMMENT_NODE_BODY = "COMMENT_NODE_BODY",
    COMMENT_NODE_END_1 = "COMMENT_NODE_END_1",
    COMMENT_NODE_END_2 = "COMMENT_NODE_END_2",
    // COMMENT_NODE_2 = "COMMENT_NODE_2",

    NODE_NAME = "NODE_NAME",
    NODE_BODY = "NODE_BODY",

    NODE_ATTR_NAME = "NODE_ATTR_NAME",

    NODE_ATTR_VALUE_START = "NODE_ATTR_VALUE_START",
    NODE_ATTR_VALUE_BODY = "NODE_ATTR_VALUE_BODY"
}

class Automata {
    constructor() { }

    state: STATE = STATE.NONE;

    private buffer: number[] = [];
    
    private static stateBinding: Record<STATE, ((this: Automata, symbol: number) => void)> = {
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
            } else if (isLetter(symbol)) {
                this.state = STATE.NODE_NAME;

                this.buffer.push(symbol);
            } else throw new Error(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```<!```
         */
        [STATE.META_NODE](symbol: number){
            if (symbol == CHAR_MINUS) {
                this.state = STATE.COMMENT_NODE;
            } else if (isLetter(symbol)) {
                this.state = STATE.NODE_NAME;

                this.buffer.push(symbol);
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```</```
         */
        [STATE.CLOSING_NODE](symbol: number) {
            if (isLetter(symbol)) {
                this.state = STATE.NODE_NAME;
                this.buffer.push(symbol);
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```<!-```
         */
        [STATE.COMMENT_NODE](symbol: number) {
            if (symbol == CHAR_MINUS) {
                this.state = STATE.COMMENT_NODE_BODY;
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
                console.log("COMMENT_NODE:", String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
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
            if (isAlphanumeric(symbol)) {
                //ok
                this.buffer.push(symbol);
            } else if (isSpace(symbol)) {
                this.state = STATE.NODE_BODY;

                console.log("NODE_NAME:", String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else if (symbol == CHAR_GREATER) {
                this.state = STATE.NONE;

                console.log("NODE_NAME:", String.fromCharCode(...this.buffer));
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
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```<name a```
         * ```<!meta a```
         * ```</name a``` - invalid
         */
        [STATE.NODE_ATTR_NAME](symbol: number) {
            if (isAlphanumeric(symbol)) {
                //ok
                this.buffer.push(symbol);
            } else if (symbol == CHAR_EQUAL) {
                this.state = STATE.NODE_ATTR_VALUE_START;

                console.log("NODE_ATTR_NAME:", String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else if (isSpace(symbol)) {
                this.state = STATE.NODE_BODY;

                console.log("NODE_ATTR_NAME:", String.fromCharCode(...this.buffer));
                this.buffer.length = 0;
            } else if (symbol == CHAR_GREATER) {
                this.state = STATE.NONE;

                console.log("NODE_ATTR_NAME:", String.fromCharCode(...this.buffer));
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
                this.state = STATE.NODE_ATTR_VALUE_BODY;
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```<name a="```
         * ```<!meta a="```
         * ```</name a="```
         */
        [STATE.NODE_ATTR_VALUE_BODY](symbol: number) {
            if (symbol == CHAR_QUOTATION_DOUBLE) {
                this.state = STATE.NODE_BODY;

                console.log("NODE_ATTR_VALUE:", String.fromCharCode(...this.buffer));
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

                console.log("TEXT_NODE:", String.fromCharCode(...this.buffer));
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

const a = new Automata();
a.pushChunk(sample);

