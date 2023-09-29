// import { readFile } from "node:fs/promises";
// const sample = await readFile("C:/Downloads/1.html", "utf-8");
import { Automata } from "./automata.js";
import sample from "./sample.js";

// console.log(sample);

const a = new Automata();
a.pushChunk(sample);
