const fs = require("fs");
const path = require("path");

function readFile(filename) {

  console.log(path.join(__dirname, "fixtures", filename));
  return fs.readFileSync(path.join(__dirname, "fixtures", filename));
}

module.exports = readFile;