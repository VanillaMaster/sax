sax-like

## example

```js

import { Builder, Automata, DocumentParser } from "package";

const parser = new DocumentParser();
const automata = new Automata(new Builder(parser));

parser.on("#div", (elem) => {
    /*...*/
});

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

const decoder = new TextDecoder("utf8");
for await (const chunk of iter) {
    automata.pushChunk(decoder.decode(chunk, { stream: true }));
}
automata.pushChunk(decoder.decode()).finalize();

```