const http = require("http");
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
  let data;
  console.log("req post", req.method);
  req.on("data", (data) => {
    data = JSON.parse(data.toString());
    console.log("data", data);
  });
  req.on("end", () => {
    res.end(JSON.stringify(data));
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
    //should probably check for if id exists
    db.getVessels(receivedJSON["id"]).then((vessels) => {
      console.log("Size:", vessels.length);
      res.end(JSON.stringify(vessels));
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
