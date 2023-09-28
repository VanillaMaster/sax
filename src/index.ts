import sample from "./sample.js";

function isLetter(char: string) {
    return ("A" <= char && char <= "Z") || ("a" <= char && char <= "z")
}
function isDigit(char: string) {
    return "0" <= char && char <= "9";
}
function isAlphanumeric(char: string) {
    return isLetter(char) || isDigit(char) || char == "-";
}

function isSpace(char: string) {
    return char == " " || char == "\n";
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

    private buffer: string[] = [];
    
    private static stateBinding: Record<STATE, ((this: Automata, symbol: string) => void)> = {
        /**
         * ``` ```
         */
        [STATE.NONE](symbol: string) {
            if (symbol == "<") {
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
        [STATE.NODE_START](symbol: string) {
            if (symbol == "/") {
                this.state = STATE.CLOSING_NODE
            } else if (symbol == "!") {
                this.state = STATE.META_NODE;                        
            } else if (isLetter(symbol)) {
                this.state = STATE.NODE_NAME;

                this.buffer.push(symbol);
            } else throw new Error(`unexpected symbol (${symbol})`);
        },

        /**
         * ```<!```
         */
        [STATE.META_NODE](symbol: string){
            if (symbol == "-") {
                this.state = STATE.COMMENT_NODE;
            } else if (isLetter(symbol)) {
                this.state = STATE.NODE_NAME;

                this.buffer.push(symbol);
            } else throw new SyntaxError(`unexpected symbol (${symbol})`);
        },

        /**
         * ```</```
         */
        [STATE.CLOSING_NODE](symbol: string) {
            if (isLetter(symbol)) {
                this.state = STATE.NODE_NAME;
                this.buffer.push(symbol);
            } else throw new SyntaxError(`unexpected symbol (${symbol})`);
        },

        /**
         * ```<!-```
         */
        [STATE.COMMENT_NODE](symbol: string) {
            if (symbol == "-") {
                this.state = STATE.COMMENT_NODE_BODY;
            } else throw new SyntaxError(`unexpected symbol (${symbol})`);
        },

        /**
         * ```<!--```
         */
        [STATE.COMMENT_NODE_BODY](symbol: string) {
            if (symbol == "-") {
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
        [STATE.COMMENT_NODE_END_1](symbol: string) {
            if (symbol == "-") {
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
        [STATE.COMMENT_NODE_END_2](symbol: string) {
            if (symbol == ">") {
                this.state = STATE.NONE;

                this.buffer.length -= 2;
                console.log("COMMENT_NODE:", this.buffer.join(""));
                this.buffer.length = 0;
            } else if (symbol = "-") {
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
        [STATE.NODE_NAME](symbol: string) {
            if (isAlphanumeric(symbol)) {
                //ok
                this.buffer.push(symbol);
            } else if (symbol == " ") {
                this.state = STATE.NODE_BODY;

                console.log("NODE_NAME:", this.buffer.join(""));
                this.buffer.length = 0;
            } else if (symbol == ">") {
                this.state = STATE.NONE;

                console.log("NODE_NAME:", this.buffer.join(""));
                this.buffer.length = 0;
            } else throw new SyntaxError(`unexpected symbol (${symbol})`);
        },

        /**
         * ```<name ```
         * ```<!meta ```
         * ```</name ```
         */
        [STATE.NODE_BODY](symbol: string) {
            if (symbol == ">") {
                this.state = STATE.NONE;
            } else if (isLetter(symbol)) {
                this.state = STATE.NODE_ATTR_NAME;
                
                this.buffer.push(symbol);
            } else if (isSpace(symbol)) {
                //ok
            } else throw new SyntaxError(`unexpected symbol (${symbol})`);
        },

        /**
         * ```<name a```
         * ```<!meta a```
         * ```</name a``` - invalid
         */
        [STATE.NODE_ATTR_NAME](symbol: string) {
            if (isAlphanumeric(symbol)) {
                //ok
                this.buffer.push(symbol);
            } else if (symbol == "=") {
                this.state = STATE.NODE_ATTR_VALUE_START;

                console.log("NODE_ATTR_NAME:", this.buffer.join(""));
                this.buffer.length = 0;
            } else if (isSpace(symbol)) {
                this.state = STATE.NODE_BODY;

                console.log("NODE_ATTR_NAME:", this.buffer.join(""));
                this.buffer.length = 0;
            } else if (symbol == ">") {
                this.state = STATE.NONE;

                console.log("NODE_ATTR_NAME:", this.buffer.join(""));
                this.buffer.length = 0;
            } else throw new SyntaxError(`unexpected symbol (${symbol})`);
        },
        
        /**
         * ```<name a=```
         * ```<!meta a=```
         * ```</name a=```
         */
        [STATE.NODE_ATTR_VALUE_START](symbol: string) {
            if (symbol == '"') {
                this.state = STATE.NODE_ATTR_VALUE_BODY;
            } else throw new SyntaxError(`unexpected symbol (${symbol})`);
        },

        /**
         * ```<name a="```
         * ```<!meta a="```
         * ```</name a="```
         */
        [STATE.NODE_ATTR_VALUE_BODY](symbol: string) {
            if (symbol == '"') {
                this.state = STATE.NODE_BODY;

                console.log("NODE_ATTR_VALUE:", this.buffer.join(""));
                this.buffer.length = 0;
            } else {
                this.buffer.push(symbol);
            }
        },

        /**
         * ```[any - text]```
         */
        [STATE.TEXT_NODE](symbol: string) {
            if (symbol == "<") {
                this.state = STATE.NODE_START;

                console.log("TEXT_NODE:", this.buffer.join(""));
                this.buffer.length = 0;
            } else {
                //ok
                this.buffer.push(symbol);
            }
        }
    }

    push(symbol: string) {

        // this.buffer.push(symbol);
        Automata.stateBinding[this.state].call(this, symbol);

    }
}

const a = new Automata();

for (const char of sample) {
    // console.log(char);
    a.push(char);
}

