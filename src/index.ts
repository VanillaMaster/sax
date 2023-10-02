import { Builder } from "./Builder.js";
import { Automata } from "./Automata.js";
import { DocumentParser } from "./DocumentParser.js";

async function* read(resp: Response) {
    const reader = resp.body!.getReader();
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
const resp = await fetch("https://example.com");

for await (const chunk of read(resp)) {
    automata.pushChunk(decoder.decode(chunk, { stream: true }));
}
automata.pushChunk(decoder.decode()).finalize();

// console.timeEnd("parse");