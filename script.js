let tileDiv = document.querySelector("#tileDisplay");
let lastClickedTile;
let containedTiles = [];
let currentTileJSON;
let tileJSON;
let displayableVessels = [];
let speed = 3;

setInterval(() => {
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/vessel",
    success: function (vessels) {
      let vesselJSON = JSON.parse(vessels);
      displayableVessels = vesselJSON;
      undrawVessels();
      for (let vessel of vesselJSON) {
        drawVessel(vessel);
      }
    },
    fail: function (err) {
      console.log(err);
    },
  });
}, speed * 1000);

$(document).ready(() => {
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

  tileDiv.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
});

function undrawVessels() {
  let vessels = document.querySelectorAll(".boat");
  vessels.forEach((vessel) => {
    vessel.remove();
  });
}

function updateDisplayableVessels(vessels) {
  for (let vessel of vessels) {
    if (vessel[4]) {
      displayableVessels[vessel[4]] = vessel;
    }
  }
}

function getTime() {
  let queryDate = new Date(basedate.getTime() + timeOffset * 1000);
  timeOffset += speed;
  return queryDate.toString().match(/\d\d:\d\d:\d\d/g)[0];
}

function displayDefault() {
  currentTileJSON = getTileFromTileId("1");
  updateDisplay(currentTileJSON);
}

function drawVessel(vessel) {
  console.log(vessel.long)
  if (
    !(
      vessel.long > currentTileJSON.image_west &&
      vessel.long < currentTileJSON.image_east &&
      vessel.lat > currentTileJSON.image_south &&
      vessel.lat < currentTileJSON.image_north
    )
  ) {
    return;
  }

  let boat = document.createElement("img");
  boat.setAttribute("src", "./boat.png");
  let x = vessel.long;
  let y = vessel.lat;
  let minLat = currentTileJSON.image_north;
  let maxLat = currentTileJSON.image_south;
  let maxLon = currentTileJSON.image_east;
  let minLon = currentTileJSON.image_west;
  let boatLat = convertVal(
    maxLat,
    minLat,
    tileDiv.getBoundingClientRect().height,
    0,
    y
  );

  let boatLon = convertVal(
    maxLon,
    minLon,
    tileDiv.getBoundingClientRect().width,
    0,
    x
  );
  let boatWidth = 20;
  let boatHeight = 20;
  boat.style.setProperty("position", "absolute");
  boat.style.setProperty("left", boatLon + "px");
  boat.style.setProperty("top", boatLat + "px");
  boat.style.setProperty("width", boatWidth + "px");
  boat.style.setProperty("height", boatHeight + "px");
  boat.style.setProperty("pointer-events", "none");
  boat.style.setProperty(
    "transform",
    `translate(-${boatWidth / 2}px,-${boatHeight / 2}px)
    rotate(${vessel.CoG}deg)`
  );
  boat.setAttribute("data-imo", vessel[4]);

  boat.classList.add("boat");
  tileDiv.appendChild(boat);
}

function handleClick(event) {
  if (event.button == 0) {
    leftclick(event);
  } else if (event.button == 2) {
    // right click
    if (currentTileJSON && currentTileJSON.scale == 1) return;
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
  if (currentTileJSON && currentTileJSON.scale == 2) {
    lastClickedTile = currentTileJSON;
  }
  currentTileJSON = getTileFromTileId(tileDiv.getAttribute("data-tileid"));
  updateContainedTiles(currentTileJSON.id);
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

  for (let vessel of Object.keys(displayableVessels)) {
    drawVessel(displayableVessels[vessel]);
  }
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
