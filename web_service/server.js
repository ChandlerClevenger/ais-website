const http = require("http");
const { StringDecoder } = require("string_decoder");
const DOA = require("../DOA/DOA.js");
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*",
  Allow: "POST, GET",
  "Content-Type": "application/json",
};

http
  .createServer((req, res) => {
    let builder = new StringDecoder("utf-8");
    let buffer = "";
    if (req.method == "GET") {
      console.log("req get", req.method);
      req.on("data", (data) => {
        buffer += builder.write(data);
      });

      req.on("end", () => {
        let db = new DOA();
        buffer += builder.end();
        res.writeHead(200, "OK", headers);
        console.log("buffer", buffer);
        db.getVessels(buffer).then((queryData) => {
          res.end(queryData);
          console.log("queryData:", queryData);
        });
      });
    }

    if (req.method == "POST") {
      console.log("req post", req.method);
      console.log("req protocol", req.protocol);
    }
    //console.log("req", req);
    console.log("url", req.url);
  })
  .listen(8080, "localhost");
console.log("Server running");
