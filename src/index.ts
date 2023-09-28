import sample from "./sample.js";

/** ```>``` */
const CHAR_GREATER = 62;//">".charCodeAt(0);
/** ```<``` */
const CHAR_LESS = 60;//"<".charCodeAt(0);
/** ```=``` */
const CHAR_EQUAL = 61;//"=".charCodeAt(0);
/** ```!``` */
const CHAR_EXCLAMATION_MARK = 33;//"!".charCodeAt(0);
/** ```"``` */
const CHAR_QUOTATION_DOUBLE = 34;//'"'.charCodeAt(0);
/** ```/``` */
const CHAR_SLASH = 47;//"/".charCodeAt(0);
/** ```-``` */
const CHAR_MINUS = 45;//"-".charCodeAt(0);
/** ```A``` */
const CHAR_A_UPPER = 65;//"A".charCodeAt(0);
/** ```Z``` */
const CHAR_Z_UPPER = 90;//"Z".charCodeAt(0);
/** ```a``` */
const CHAR_A_LOWER = 97;//"a".charCodeAt(0);
/** ```z``` */
const CHAR_Z_LOWER = 122;//"z".charCodeAt(0);
/** ```0``` */
const CHAR_0 = 48;//"0".charCodeAt(0);
/** ```9``` */
const CHAR_9 = 57;//"9".charCodeAt(0);
/** ``` ``` */
const CHAR_SPACE = 32;//" ".charCodeAt(0);
/** ```\n``` */
const CHAR_NEW_LINE = 10;//"\n".charCodeAt(0);

function isLetter(char: number) {
    return (CHAR_A_UPPER <= char && char <= CHAR_Z_UPPER) || (CHAR_A_LOWER <= char && char <= CHAR_Z_LOWER);
}

function isDigit(char: number) {
    return CHAR_0 <= char && char <= CHAR_9;
}

function isAlphanumeric(char: number) {
    return isLetter(char) || isDigit(char) || char == CHAR_MINUS;
}

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

    NODE_NAME = "NODE_NAME",
    NODE_BODY = "NODE_BODY",

    NODE_ATTR_NAME = "NODE_ATTR_NAME",

    NODE_ATTR_VALUE_START = "NODE_ATTR_VALUE_START",
    NODE_ATTR_VALUE_BODY = "NODE_ATTR_VALUE_BODY"
}

class Automata {
    constructor() { }

    private state: STATE = STATE.NONE;

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
                console.log("OPENING_NODE");
            } else throw new Error(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```<!```
         */
        [STATE.META_NODE](symbol: number) {
            if (symbol == CHAR_MINUS) {
                this.state = STATE.COMMENT_NODE;
            } else if (isLetter(symbol)) {
                this.state = STATE.NODE_NAME;

                console.log("META_NODE");
                this.buffer.push(symbol);
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```</```
         */
        [STATE.CLOSING_NODE](symbol: number) {
            if (isLetter(symbol)) {
                this.state = STATE.NODE_NAME;

                console.log("CLOSING_NODE");
                this.buffer.push(symbol);
            } else throw new SyntaxError(`unexpected symbol (${String.fromCharCode(symbol)})`);
        },

        /**
         * ```<!-```
         */
        [STATE.COMMENT_NODE](symbol: number) {
            if (symbol == CHAR_MINUS) {
                this.state = STATE.COMMENT_NODE_BODY;

                console.log("COMMENT_START");
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
                console.log("COMMENT_END");
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

