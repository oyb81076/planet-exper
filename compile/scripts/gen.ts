import { keygen } from "../src/utils";

Array(10).fill(0).map(keygen).forEach(x => console.log(x))
