import { entities } from "./entities.js";

interface UnescaperOptions {
    stream?: boolean;
}
export class Unescaper {
    unescape(input: string, options?: UnescaperOptions) {
        const stream = options?.stream ?? false;
        // console.log(input);
        for (const char of input) {
            if (char == "&") {
                this.entity = true;
            } else if (char == ";") {
                this.entity = false;
                const entity = this.entityBuffer.join("");
                this.entityBuffer.length = 0;
                this.buffer.push(this.toChar(entity));
            } else if (this.entity) {
                this.entityBuffer.push(char);
            } else {
                this.buffer.push(char);
            }
        }
        if (stream) {
            const str = this.buffer.join("");
            this.buffer.length = 0;
            return str;
        } else {
            if (this.entity) throw new Error();
            const str = this.buffer.join("");
            this.buffer.length = 0;
            return str;
        }
    }
    
    private toChar(entity: string){
        if (entity.startsWith("#")) {
            const codePoint = Number(`0${entity.substring(1)}`);
            if (!Number.isNaN(codePoint)) {
                return String.fromCodePoint(codePoint);
            } else throw new SyntaxError(`unexpected entity (${entity})`);
        } else {
            const char = entities.get(entity);
            if (char) {
                return char
            } else throw new SyntaxError(`unexpected entity (${entity})`);
        }
    }

    private buffer: string[] = [];
    private entity: boolean = false;
    private entityBuffer: string[] = [];
}