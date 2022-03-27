let tileDiv = document.querySelector("#tileDisplay");
let lastClickedTile;
let containedTiles = [];
let currentTileJSON;
let tileJSON;

$.ajax({
  type: "GET",
  url: "./denmark_tiles/MAP_VIEW.json",
  success: function (data) {
    tileJSON = data;
    displayDefault();
  },
  fail: function (err) {
    console.log(err);
  },
});

$("#tileDisplay").on("DOMSubtreeModified", () => {
  if (currentTileJSON && currentTileJSON.scale == 2) {
    lastClickedTile = currentTileJSON;
  }
  currentTileJSON = getTileFromTileId(tileDiv.getAttribute("data-tileid"));
  updateContainedTiles(currentTileJSON.id);

  // get vessels
  $.ajax({
    method: "POST",
    url: "localhost:8080",
    dataType: "application/json",
    crossDomain: true,
    data: { tile: currentTileJSON.id },
    success: function (data) {
      console.log("Data from server", data);
    },
    fail: function (err) {
      console.log(err);
    },
  });
});

tileDiv.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

function displayDefault() {
  currentTileJSON = getTileFromTileId("1");
  updateDisplay(currentTileJSON);
}

function handleClick(event) {
  if (event.button == 0) {
    leftclick(event);
  } else if (event.button == 2) {
    // right click
    switch (currentTileJSON.scale) {
      case 1:
        break;
      case 3:
        updateDisplay(lastClickedTile);
        break;
      default:
        displayDefault();
        break;
    }
  }
  updateDisplay(currentTileJSON);
}

function leftclick(event) {
  if (currentTileJSON && currentTileJSON.scale == 3) return;
  let x = event.clientX - tileDiv.getBoundingClientRect().x;
  let y = event.clientY - tileDiv.getBoundingClientRect().y;
  let minLat = currentTileJSON.image_north;
  let maxLat = currentTileJSON.image_south;
  let maxLon = currentTileJSON.image_east;
  let minLon = currentTileJSON.image_west;
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

  let clickedTileJSON = findClickedTile(clickedLon, clickedLat);
  if (clickedTileJSON == 0) {
    displayDefault();
    return;
  }
  updateDisplay(clickedTileJSON);
}

function updateDisplay(tileJSON) {
  tileDiv.setAttribute("data-tileId", tileJSON.id);
  tileDiv.innerHTML = "";
  let img = document.createElement("img");
  img.setAttribute("src", "./denmark_tiles/" + tileJSON.filename);
  img.addEventListener("mouseup", (event) => handleClick(event));
  tileDiv.appendChild(img);
}

function findClickedTile(clickedLon, clickedLat) {
  for (let tile of containedTiles) {
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

function getTileFromTileId(tileId) {
  for (let obj of Object.keys(tileJSON)) {
    if (tileJSON[obj].id == tileId) {
      return tileJSON[obj];
    }
  }
  return 0;
}

function updateContainedTiles(containerId) {
  containedTiles = [];
  if (containerId == 1) {
    containerId = -1;
  }
  for (let obj of Object.keys(tileJSON)) {
    if (tileJSON[obj].contained_by == containerId) {
      containedTiles.push(tileJSON[obj]);
    }
  }
}
