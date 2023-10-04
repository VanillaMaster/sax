## TODO
 - write tests
 - fix evrything
 - make repo public

## what it is
- sax-like html parser

## what it isn't
- any kind of dom builder (in theory it is posible to build dom using it)

## whats the point
make *fast* stream oriented html parser

## is it ready
 - not really, most likely there is alot of unhandled things 

## how it work
 - Automata (this one is deterministic finite) parse html to events (like attr_name, attr_value, node_start, etc);
 - Builder convert this events to html elements events;
 - DocumentParser keep path to curent element and dispatch event abount element occurrence.

evry part of this chain can be replaced with custom implementation

## contributing
i will be glad if anyone decides to help

### example

```js

import { Builder, Automata, DocumentParser, Unescaper } from "package";

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

```

```element.arena``` - event emitter associated with node, trigger only event for ```element```\`s subtree

package alos provide ```Unescaper``` wich capable of (kinda advanced) html unescape