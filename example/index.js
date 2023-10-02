
import { Builder, Automata, DocumentParser } from "../dist/index.js";

// console.time("parse");
const parser = new DocumentParser();
const automata = new Automata(new Builder(parser));

parser.on("div", (elem) => {
    if (elem.attributes.class == "shortstoryContent") {
        elem.arena.on("p", (elem) => {
            elem.arena.on("#text", (elem) => {
                console.log(elem.nodeValue);
            })
        })
    }
    // console.log(elem.nodeValue);
});

const decoder = new TextDecoder("utf8")
const resp = await fetch("https://v2.vost.pw/");
const iter = {
    reader: resp.body.getReader(),
    next(){
        return this.reader.read()
    },
    [Symbol.asyncIterator]() {
        return this
    }
}

for await (const chunk of iter) {
    automata.pushChunk(decoder.decode(chunk, { stream: true }));
}
automata.pushChunk(decoder.decode()).finalize();

// console.timeEnd("parse");