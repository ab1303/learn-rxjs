// Setup Test
//alert("hello");

import "./.scss/main.scss";

// Example 2

import { Observable, Observer } from "rxjs";
import { map } from "rxjs/operators";
import { from } from "rxjs/observable/from";
import { fromEvent } from "rxjs/Observable/fromEvent";

let source = fromEvent(document, "mousemove").pipe(
  map((e: MouseEvent) => {
    return {
      x: e.clientX,
      y: e.clientY
    };
  })
);

console.log("just before subscribe");
source.subscribe({
  next: value => console.log(value),
  error: e => console.error(`error: ${e}`),
  complete: () => console.log("done")
});
console.log("just after subscribe");
