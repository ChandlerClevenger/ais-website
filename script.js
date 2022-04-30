let tileDiv = document.querySelector("#tileDisplay");
let scale = document.querySelector("#slider");
let ports = [];
let lastClickedTile;
let containedTiles = [];
let currentTileJSON;
let tileJSON;
let secondsPerRequest = 5;

setInterval(() => {
  updateVessels();
}, secondsPerRequest * 1000);

$(document).ready(() => {
  $.ajax({
    type: "GET",
    url: "./denmark_tiles/MAP_VIEW.json",
    success: function (data) {
      tileJSON = data;
      displayDefault();
      setUpPorts();
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

function getTime() {
  let queryDate = new Date(basedate.getTime() + timeOffset * 1000);
  timeOffset += secondsPerRequest;
  return queryDate.toString().match(/\d\d:\d\d:\d\d/g)[0];
}

function displayDefault() {
  currentTileJSON = getTileFromTileId("1");
  updateDisplay(currentTileJSON);
}

function drawVessel(vessel) {
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
  let boatWidth = 20 * currentTileJSON.scale * scale.value;
  let boatHeight = 20 * currentTileJSON.scale * scale.value;
  boat.style.setProperty("z-index", 1000);
  boat.style.setProperty("position", "absolute");
  boat.style.setProperty("left", boatLon + "px");
  boat.style.setProperty("top", boatLat + "px");
  boat.style.setProperty("width", boatWidth + "px");
  boat.style.setProperty("height", boatHeight + "px");
  boat.style.setProperty(
    "transform",
    `translate(-${boatWidth / 2}px,-${boatHeight / 2}px)
    rotate(${vessel.CoG}deg)`
  );
  boat.setAttribute("data-MMSI", vessel.MMSI);
  boat.addEventListener("click", (event) => {
    displayVesselData(vessel.MMSI);
  })
  boat.classList.add("boat");
  tileDiv.prepend(boat);
}

function displayVesselData(MMSI) {
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/vessel/data",
    data: {
      MMSI: MMSI
    },
    success: function (vesselData) {
      let vesselJSON = JSON.parse(vesselData);
      showVesselData(vesselJSON[0]);
    },
    fail: function (err) {
      console.log(err);
    },
  });
}

function showVesselData(vesselJSON) {
  let vesselDataDiv = document.getElementById("vesselData");
  vesselDataDiv.innerHTML = ""
  for (let property of Object.keys(vesselJSON)) {
    vesselDataDiv.innerHTML += property + " |     " + vesselJSON[property] + "<br>";
  }
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

  updateVessels();
  drawPorts();
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

function getStaticData(MMSI) {
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/vessel/data",
    data: {
      MMSI: MMSI,
    },
    success: function (vesselData) {},
    fail: function (err) {
      console.log(err);
    },
  });
}

function updateVessels() {
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/vessel",
    data: {
      tileId: currentTileJSON.id,
    },
    success: function (vessels) {
      let vesselJSON = JSON.parse(vessels);
      undrawVessels();
      for (let vessel of vesselJSON) {
        drawVessel(vessel);
      }
    },
    fail: function (err) {
      console.log(err);
    },
  });
}

function drawPorts() {
  for (let port of ports) {
    if (
      !(
        port.Longitude > currentTileJSON.image_west &&
        port.Longitude < currentTileJSON.image_east &&
        port.Latitude > currentTileJSON.image_south &&
        port.Latitude < currentTileJSON.image_north
      )
    ) {
      continue;
    }
    
  // get coords
  let portImg = document.createElement("img");
  portImg.setAttribute("src", "./port.png");

  let x = port.Longitude;
  let y = port.Latitude;
  let minLat = currentTileJSON.image_north;
  let maxLat = currentTileJSON.image_south;
  let maxLon = currentTileJSON.image_east;
  let minLon = currentTileJSON.image_west;
  let portLat = convertVal(
    maxLat,
    minLat,
    tileDiv.getBoundingClientRect().height,
    0,
    y
  );

  let portLon = convertVal(
    maxLon,
    minLon,
    tileDiv.getBoundingClientRect().width,
    0,
    x
  );

  // make and display port 
  let portWidth = 15 * currentTileJSON.scale * scale.value;
  let portHeight = 15 * currentTileJSON.scale * scale.value;
  portImg.style.setProperty("position", "absolute");
  portImg.style.setProperty("left", portLon + "px");
  portImg.style.setProperty("top", portLat + "px");
  portImg.style.setProperty("width", portWidth + "px");
  portImg.style.setProperty("height", portHeight + "px");
  portImg.style.setProperty(
    "transform",
    `translate(-${portWidth / 2}px,-${portHeight / 2}px)`
  );
  portImg.setAttribute("data-name", port.Name);
  portImg.addEventListener("click", (event) => {
    // add port click
  })
  portImg.classList.add("port");
  tileDiv.prepend(portImg);
  }
}

function setUpPorts() {
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/port",
    success: function (allPorts) {
      ports = JSON.parse(allPorts);
      drawPorts();
    },
    fail: function (err) {
      console.log(err);
    },
  });
}