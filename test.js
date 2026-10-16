const { add } = require("./index");

const result = add(2, 3);

if (result !== 5) {
  throw new Error("Test failed");
}

console.log("All tests passed!");
