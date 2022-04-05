const http = require("http");
const DAO = require("../DAO/DAO.js");
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET",
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
        res.writeHead(405, headers);
        res.end(`${req.method} is not a valid method.`);
        break;
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
    let db = new DAO();
    res.writeHead(200, headers);
    //should probably check for if id exists
    db.getVessels(
      receivedJSON["id"],
      receivedJSON["scale"],
      decodeURIComponent(receivedJSON["timestamp"])
    )
      .then((vessels) => {
        res.end(JSON.stringify(vessels));
      })
      .catch((rej) => {
        console.log(rej);
        res.end("Failed to retreive vessels");
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
