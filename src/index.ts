import sample from "./sample.js";

function isLatter(char: string) {
    return ("A" <= char && char <= "Z") || ("a" <= char && char <= "z")
}

enum STATE {
    NONE = "NONE",

    TEXT_NODE = "TEXT_NODE",

    NODE_START = "NODE_START",

    CLOSING_NODE = "CLOSING_NODE",
    META_NODE = "META_NODE",
    COMMENT_NODE = "COMMENT_NODE",

    NODE_NAME = "NODE_NAME",
    NODE_BODY = "NODE_BODY",

    NODE_ATTR_NAME = "NODE_ATTR_NAME",

    NODE_ATTR_VALUE_START = "NODE_ATTR_VALUE_START",
    NODE_ATTR_VALUE_BODY = "NODE_ATTR_VALUE_BODY"
}

class Automata {
    constructor() { }

    #state: STATE = STATE.NONE;
    get state() {
        return this.#state;
    }
    set state(value) {
        this.#state = value;
        if (value == STATE.NONE) {
            console.log("buff:", this.buffer.join(""), "\n");
            this.buffer.length = 0;
        }
    }

    private buffer: string[] = [];

    private static stateBinding: Record<STATE, ((this: Automata, symbol: string) => void)> = {
        [STATE.CLOSING_NODE](symbol: string) {
            this.state = STATE.NODE_NAME;
        },

        [STATE.NODE_ATTR_NAME](symbol: string) {
            if (symbol == "=") {
                this.state = STATE.NODE_ATTR_VALUE_START;
                return;
            }
            if (symbol == " ") {
                this.state = STATE.NODE_BODY;
                return;
            }
            if (symbol == ">") {
                this.state = STATE.NONE;
                return;
            }
        },

        [STATE.NODE_ATTR_VALUE_BODY](symbol: string) {
            if (symbol == '"') {
                this.state = STATE.NODE_BODY;
                return;
            }
        },

        [STATE.NODE_ATTR_VALUE_START](symbol: string) {
            if (symbol == '"') {
                this.state = STATE.NODE_ATTR_VALUE_BODY;
                return
            }
            throw new Error(`unexpected symbol (${symbol})`);
        },

        [STATE.NODE_BODY](symbol: string) {
            if (symbol == ">") {
                this.state = STATE.NONE;
                return
            }
            if (symbol != " ") {
                this.state = STATE.NODE_ATTR_NAME;
                return;
            }
        },
        
        [STATE.NODE_NAME](symbol: string) {
            if (symbol == " ") {
                this.state = STATE.NODE_BODY;
                return;
            }

            if (symbol == ">") {
                this.state = STATE.NONE;
                return;
            }
        },

        [STATE.NODE_START](symbol: string) {
            if (symbol == "/") {
                this.state = STATE.CLOSING_NODE
                return;
            }
            if (symbol !== " " && symbol !== "\n") {
                this.state = STATE.NODE_NAME
                return;
            }

            throw new Error(`unexpected symbol (${symbol})`);
        },

        [STATE.NONE](symbol: string) {
            if (symbol == " " || symbol == "\n") return;

            if (symbol == "<") {
                this.state = STATE.NODE_START;
                return
            }

            this.state = STATE.TEXT_NODE;
        },

        [STATE.TEXT_NODE](symbol: string) {
            if (symbol == "<") {
                this.state = STATE.NODE_START;
                return
            }
        }
    }

    push(symbol: string) {

        this.buffer.push(symbol);
        Automata.stateBinding[this.state].call(this, symbol);

    }
}

const a = new Automata();

for (const char of sample) {
    // console.log(char);
    a.push(char);
}

