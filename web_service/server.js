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
    switch (req.method) {
      case "POST":
        handlePOST(req, res);
        break;
      case "GET":
        handleGET(req, res);
        break;
      default:
        res.end("ONLY ACCEPTS GET AND POST");
    }
  })
  .listen(8080, "localhost");
console.log("Server running");

function handlePOST(req, res) {
  console.log("req post", req.method);
  req.on("data", (data) => {
    console.log("data", JSON.parse(data.toString()));
  });
  req.on("end", () => {
    res.end("received");
  });
}

function handleGET(req, res) {
  let receivedJSON = parseUrl(req.url);
  console.log("REGEIVED GET");
  // no clue why you must read this data, but just gotta
  req.on("data", (data) => {});

  req.on("end", () => {
    let db = new DOA();
    res.writeHead(200, "OK", headers);
    db.getVessels(1).then((results) => {
      res.end(results);
    });
  });
}

function parseUrl(url) {
  url = url.replace(/^\/\?/, "");
  let split = url.split("&");
  let requestJSON = {};
  for (let pair of split) {
    let [key, val] = pair.split("=");
    requestJSON[key] = val;
  }
  return requestJSON;
}
