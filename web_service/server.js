const http = require("http");
const { StringDecoder } = require("string_decoder");
const DOA = require("../DOA/DOA.js");
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*",
  Allow: "POST",
  "Content-Type": "application/json",
};

http
  .createServer((req, res) => {
    console.log(req.url);
    let builder = new StringDecoder("utf-8");
    let buffer = "";

    req.on("data", (data) => {
      buffer += builder.write(data);
    });

    req.on("end", () => {
      res.writeHead(200, "OK", headers);
      buffer += builder.end();
      let db = new DOA();
      res.end(db.getVessels(buffer));
    });
  })
  .listen(8080, "localhost");
console.log("Server running");
