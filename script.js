let tileDiv = document.querySelector("#tileDisplay");
let clickedTiles = [];
let containedTiles = [];
let currentTileICESName = "-1";
let currentTileJSON;
let tileJSON;

$.ajax({
  type: "GET",
  url: "./denmark_tiles/MAP_VIEW.json",
  dataType: "json",
  success: function (data) {
    tileJSON = data;
    updateContainedTiles(currentTileICESName);
  },
  fail: function (err) {
    console.log(err);
  },
});

document.addEventListener("DOMContentLoaded", () => {
  let rootImg = document.createElement("img");
  rootImg.setAttribute("src", "./denmark_tiles/ROOT.png");
  rootImg.addEventListener("click", (event) => {
    let x = event.clientX - tileDiv.getBoundingClientRect().x;
    let y = event.clientY - tileDiv.getBoundingClientRect().y;
    currentTileJSON = getTileFromJSON(currentTileICESName);
    let minLat = currentTileJSON.image_north;
    let maxLat = currentTileJSON.image_south;
    let maxLon = currentTileJSON.image_east;
    let minLon = currentTileJSON.image_west;
    console.log(
      "minLat: ",
      minLat,
      "minLon:",
      minLon,
      "maxLat:",
      maxLat,
      "maxLon:",
      maxLon
    );
    let clickedLat = convertVal(
      tileDiv.getBoundingClientRect().height,
      0,
      maxLat,
      minLat,
      y
    );

    let clickedLon = convertVal(
      tileDiv.getBoundingClientRect().width,
      0,
      maxLon,
      minLon,
      x
    );

    console.log("ClickedLon:", clickedLon);
    console.log("ClickedLat:", clickedLat);
    console.log("x:", x, "y:", y);
    currentTileJSON = findClickedTile(clickedLon, clickedLat);
    console.log(currentTileJSON);
    updateDisplay(currentTileJSON);
  });
  tileDiv.appendChild(rootImg);
});

function updateDisplay(currentTileJSON) {
  let img = document.createElement("img");
  img.setAttribute("src", "./denmark_tiles/" + currentTileJSON.filename);
  img.addEventListener("click", (event) => {
    let x = event.clientX - tileDiv.getBoundingClientRect().x;
    let y = event.clientY - tileDiv.getBoundingClientRect().y;
    currentTileJSON = getTileFromJSON(currentTileICESName);
    let maxLat = currentTileJSON.image_north;
    let maxLon = currentTileJSON.image_west;
    let minLat = currentTileJSON.image_south;
    let minLon = currentTileJSON.image_east;

    let clickedLat = convertVal(
      tileDiv.getBoundingClientRect().height,
      0,
      maxLat,
      minLat,
      y
    );

    let clickedLon = convertVal(
      tileDiv.getBoundingClientRect().width,
      0,
      maxLon,
      minLon,
      x
    );

    console.log("ClickedLon:", clickedLon);
    console.log("ClickedLat:", clickedLat);
    console.log("x:", x, "y:", y);
    currentTileJSON = findClickedTile(clickedLon, clickedLat);
    updateDisplay(currentTileJSON);
  });
  tileDiv.innerHTML = "";
  tileDiv.appendChild(img);
}

function findClickedTile(clickedLon, clickedLat) {
  for (let tile of containedTiles) {
    console.log(tile.filename);
    console.log(
      "south:",
      tile.south,
      "east:",
      tile.east,
      "west:",
      tile.west,
      "north:",
      tile.north
    );
    if (
      tile.south <= clickedLat &&
      tile.north >= clickedLat &&
      tile.east >= clickedLon &&
      tile.west <= clickedLon
    ) {
      return tile;
    }
  }
  return 0;
}

function convertVal(oldMax, oldMin, newMax, newMin, oldValue) {
  return ((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
}

function getTileFromJSON(ICESName) {
  for (let obj of Object.keys(tileJSON)) {
    if (tileJSON[obj].ICESName == ICESName) {
      return tileJSON[obj];
    }
  }
  return 0;
}

function updateContainedTiles(containedByICESName) {
  containedTiles = [];
  for (let obj of Object.keys(tileJSON)) {
    if (tileJSON[obj].contained_by == containedByICESName) {
      containedTiles.push(tileJSON[obj]);
    }
  }
  logContainedTiles();
}

function logContainedTiles() {
  console.log("Sizing", containedTiles[0].scale);
  console.log("# contained", containedTiles.length, containedTiles);
}

function printMins() {
  let minLat = tileJSON[0].east;
  let maxLat = tileJSON[0].west;
  let minLon = tileJSON[0].north;
  let maxLon = tileJSON[0].south;
  for (let tile of Object.keys(tileJSON)) {
    if (minLat > tileJSON[tile].east) {
      minLat = tileJSON[tile].east;
    }
    if (maxLat < tileJSON[tile].west) {
      maxLat = tileJSON[tile].west;
    }
    if (maxLon < tileJSON[tile].south) {
      maxLon = tileJSON[tile].south;
    }
    if (minLon > tileJSON[tile].north) {
      minLon = tileJSON[tile].north;
    }
  }
  console.log("MinLat: ", minLat, "\n");
  console.log("MinLon: ", minLon, "\n");
  console.log("MaxLat: ", maxLat, "\n");
  console.log("MaxLon: ", maxLon, "\n");
}
