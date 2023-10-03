import { Builder, Automata, DocumentParser, Unescaper } from "../dist/index.js";

// console.time("parse");
const parser = new DocumentParser();
const automata = new Automata(new Builder(parser));
const unescaper = new Unescaper();
parser.on("div", (elem) => {
    if (elem.attributes.class == "Gx5Zad fP1Qef xpd EtOod pkphOe") {
        elem.arena.on("div", (elem) => {
            if (elem.attributes.class == "kCrYT") {
                elem.arena.on("#text", (elem) => {
                    console.log(unescaper.unescape(elem.nodeValue));
                })
            }
            if (elem.attributes.class == "egMi0 kCrYT") {
                elem.arena.on("h3", (elem) => {
                    elem.arena.on("#text", (elem) => {
                        console.log("\ntitle:", unescaper.unescape(elem.nodeValue));
                    });
                });
            }
        });
    }

    // console.log(elem.nodeValue);

});

const decoder = new TextDecoder("utf8")
const resp = await fetch("https://www.google.com/search?q=sax+parser");
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