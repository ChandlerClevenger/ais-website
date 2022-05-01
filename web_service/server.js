const http = require("http");
const fs = require('fs');
const DAO = require("../DAO/DAO.js");
const db = new DAO();
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET"
};

// clean up then set 5 min cleanup
// timestamp is updated by feeder
let timestamp = "2020-11-18T00:00:00.000Z";
const deleteMessegesEvery = 1; // minute(s)
cleanupTables();
setInterval(()=> {
  cleanupTables();
}, deleteMessegesEvery * 60000);

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
  .listen(3000, "localhost");
console.log("Server running");

function handleGET(req, res) {
  let [pathParts, receivedJSON] = parseGetUrl(req.url);
  switch (pathParts.shift()) {
    case "vessel":
      // prevents access from invalid paths
      if (pathParts.length == 0) {
        handleGetVessel(req, res, receivedJSON);

      } else if (pathParts.shift() == "data") {
        if (pathParts.length != 0) return sendInvalidEndpoint(req, res);
        handleGetVesselData(req, res, receivedJSON);

      } else {
        sendInvalidEndpoint(req, res);
      }
      break;

    case "port":
      // prevents access from invalid paths
      if (pathParts.length) {
        sendInvalidEndpoint(req, res);
        break;
      }
      if (receivedJSON && receivedJSON.hasOwnProperty("tileId")) {
        handleGetPortByName(req, res, receivedJSON);
      }

      if (!receivedJSON) {
        handleGetAllPorts(req, res);
      }
      break;

    case "map":
      if (pathParts.length) {
        sendInvalidEndpoint(req, res);
        break;
      }
      handleGetMap(req, res);
      break;

    default:
      sendInvalidEndpoint(req, res);
      break;
  }
}

function handleGetMap(req, res) {
  fs.readFile('MAP_VIEW.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.writeHead(400, "Content-Type: text/plain");
      res.end("Massive server failure to get map view json.");
      return;
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}

function handlePOST(req, res) {
  let pathParts = parsePostUrl(req.url);

  switch (pathParts.shift()) {
    case "AISFeed":
      handlePostAISFeed(req, res, pathParts);
      break;

    default:
      sendInvalidEndpoint(req, res);
      break;
  }
}

function handlePostAISFeed(req, res, pathParts) {
  let vessels;
  timestamp = pathParts.shift();
  if (
    timestamp.match(
      /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z$)/
    ) &&
    !pathParts.length
  ) {
    req.on("data", (data) => {
      vessels = JSON.parse(data.toString());
    });
    req.on("end", () => {
      db.insertAISMessageBatch(vessels)
      .then((result) => {
        console.log("Inserted", result, "AIS Messages")
        res.writeHead(200, { "Content-Type":"text/plain", ...headers})
        res.end("POST inserted")
      })
      .catch((rej) => {
        console.log(rej);
        res.end("Failed to post vessels");
      });
    });
  } else {
    // Failure to format to AISFeed requirements
    res.writeHead(400, { "Content-Type": "text/plain", ...headers });
    res.end(`${req.url} is an Invalid Endpoint!`);
  }
}

function handleGetVessel(req, res, receivedJSON) {
  res.writeHead(200, headers);
  //should probably check for if id exists
  if (receivedJSON == null) {
    db.readMostRecentPositionAllShips()
    .then((vessels) => {
      console.log(`Serving ${vessels.length} Vessels`);
      res.end(JSON.stringify(vessels));
    })
    .catch((rej) => {
      console.log(rej);
      res.end("Failed to retreive vessels");
    });
    return;
  } else if (receivedJSON.hasOwnProperty('tileId')) {
    // If get with tileId
    let tileId = new Number(receivedJSON.tileId);
    if (tileId) {
      db.readRecentPositionsInTile(tileId)
      .then(vessels => {
        console.log(`Serving ${vessels.length} Vessels in tile ${tileId}`);
        res.end(JSON.stringify(vessels));
      });
    } else {
      sendFailure(res, "Param is not an integer!");
    }
    
  } else {
    sendFailure(res, "Check parameters!");
  }
}

function handleGetVesselData(req, res, receivedJSON) {
  if (!receivedJSON) {
    sendInvalidParameters(res);
    return;
  }
  let MMSI = receivedJSON.hasOwnProperty("MMSI") ? receivedJSON.MMSI : null;
  if (MMSI) {
    let IMO = receivedJSON.hasOwnProperty("IMO") ? receivedJSON.IMO : null;
    let name = receivedJSON.hasOwnProperty("name") ? receivedJSON.name : null;
    let callsign = receivedJSON.hasOwnProperty("callsign") ? receivedJSON.callsign : null;
    db.readPermanentVesselData(MMSI, IMO, name, callsign)
    .then(vesselData => {
      res.writeHead(200, headers)
      res.end(JSON.stringify(vesselData));
      console.log(`Serving vessel static data for vessel MMSI: ${MMSI}`);
    })
  } else {
    sendInvalidParameters(res, "Must include an MMSI!");
  }
}

function handleGetAllPorts(req, res) {
  res.writeHead(200, headers);
  db.readAllPorts().then(ports => {
    res.end(JSON.stringify(ports));
  })
}

function handleGetPortByName(req, res, receivedJSON) {
  let name = receivedJSON.hasOwnProperty("name") ? receivedJSON.name : null;
  let country = receivedJSON.hasOwnProperty("country") ? receivedJSON.country : null;
  if (!name) {
    sendInvalidParameters(res);
    return;
  }
  db.readAllPortsMatchingName(name, country)
  .then((ports) => {
    res.end(JSON.stringify(ports));
  })
  .catch((error) => {
    console.log("ERROR GETTING PORT.", error);
    sendFailure("ERROR GETTING PORT.");
  });
}

function parseGetUrl(url) {
  if (url.search(/\?/) != -1){
    return parseGetWithParams(url);
  } else {
    return parseGetWithNoParams(url);
  }
}

function parseGetWithParams(url) {
  [_, path, params] = url.match(/((?<=\/)\S*(?=\?))\?(\S*)/);
  let split = params.split("&");
  let requestJSON = {};
  for (let pair of split) {
    let [key, val] = pair.split("=");
    requestJSON[key] = val;
  }
  return [path.split("/"), requestJSON];
}

function parseGetWithNoParams(url) {
  [path] = url.match(/((?<=\/)\S*)/);
  return [path.split("/"), null];
}

function sendInvalidEndpoint(req, res) {
  // Failure to match any endpoint
  res.writeHead(400, { "Content-Type": "text/plain", ...headers });
  res.end(`${req.url} is an Invalid Endpoint!`);
}

function sendInvalidParameters(res) {
  // Failure to match any endpoint
  res.writeHead(400, { "Content-Type": "text/plain", ...headers });
  res.end(`Please check your parameters!`);
}

function sendFailure(res, msg) {
  // Failure to match any endpoint
  res.writeHead(400, { "Content-Type": "text/plain", ...headers });
  res.end(msg);
}

function parsePostUrl(url) {
  return url.split("/").slice(1);
}

function cleanupTables() {
  if (timestamp.match(
    /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z$)/
  )) {
    let db = new DAO();
    db.cleanupMessages(timestamp)
    .then(res => {
      console.log("SUCCESS IN CLEANING MESSAGES!", `Deleted ${res} messages.`);
    })
    .catch(rej => {
      console.log("FAILURE TO CLEAN MESSAGES!", rej);
    });
    
  } else {
    console.error("TIMESTAMP IS INVALID!", timestamp);
  }
}