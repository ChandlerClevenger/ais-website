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
        // Failure to use correct method
        res.writeHead(405, headers);
        res.end(`${req.method} is not a valid method.`);
        break;
    }
  })
  .listen(8080, "localhost");
console.log("Server running");

function handleGET(req, res) {
  let [pathParts, receivedJSON] = parseGetUrl(req.url);
  switch (pathParts.shift()) {
    case "vessel":
      // prevents access from invalid paths
      if (pathParts.length) {
        sendInvalidEndpoint(req, res);
        break;
      }
      handleGetVessel(req, res, receivedJSON);
      break;

    default:
      sendInvalidEndpoint(req, res);
      break;
  }
}

function handlePOST(req, res) {
  let pathParts = parsePostUrl(req.url);

  switch (pathParts.shift()) {
    case "AISFeed":
      handlePostAISFeed(req, res, pathParts);
      break;

    default:
      sendInvalidEndpoint(req, res);
  }
}

function handlePostAISFeed(req, res, pathParts) {
  let data;
  let timestamp = pathParts.shift();
  if (
    timestamp.match(
      /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z$)/
    ) &&
    !pathParts.length
  ) {
    req.on("data", (data) => {
      data = JSON.parse(data.toString());
      console.log(data);
    });
    req.on("end", () => {
      res.end(JSON.stringify(data));
    });
  } else {
    // Failure to format to AISFeed requirements
    res.writeHead(400, { "Content-Type": "text/plain", ...headers });
    res.end(`${req.url} is an Invalid Endpoint!`);
  }
}

function handleGetVessel(req, res, receivedJSON) {
  req.on("data", (data) => {}); // no clue why you must read this data, but just gotta

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

function parseGetUrl(url) {
  let [_, path, params] = url.match(/((?<=\/)\S*(?=\?))\?(\S*)/);
  let split = params.split("&");
  let requestJSON = {};
  for (let pair of split) {
    let [key, val] = pair.split("=");
    requestJSON[key] = val;
  }
  return [path.split("/"), requestJSON];
}

function sendInvalidEndpoint(req, res) {
  // Failure to match any endpoint
  res.writeHead(400, { "Content-Type": "text/plain", ...headers });
  res.end(`${req.url} is an Invalid Endpoint!`);
}

function parsePostUrl(url) {
  return url.split("/").slice(1);
}
