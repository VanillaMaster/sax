
import { Builder, Automata, DocumentParser } from "../dist/index.js";

/**
 * @param { Response } resp 
 * @returns 
 */
async function* read(resp) {
    const reader = resp.body.getReader();
    while(true) {
        const {done, value} = await reader.read();
        if (done) return;
        yield value;
    }
}

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

for await (const chunk of read(resp)) {
    automata.pushChunk(decoder.decode(chunk, { stream: true }));
}
automata.pushChunk(decoder.decode()).finalize();

// console.timeEnd("parse");