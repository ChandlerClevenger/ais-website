let tileDiv = document.querySelector("#tileDisplay");
let lastClickedTile;
let containedTiles = [];
let currentTileJSON;
let tileJSON;
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

function displayDefault() {
  currentTileJSON = getTileFromTileId("1");
  updateDisplay(currentTileJSON);
}

function drawVessel(vessel) {
  let boat = document.createElement("img");
  boat.setAttribute("src", "./boat.png");
  let x = vessel[7];
  let y = vessel[8];
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

  boat.style.setProperty("position", "absolute");
  boat.style.setProperty("left", boatLon + "px");
  boat.style.setProperty("top", boatLat + "px");
  boat.style.setProperty("width", 20 + "px");
  boat.style.setProperty("height", 20 + "px");
  boat.style.setProperty("pointer-events", "none");
  boat.style.setProperty("data-id", "");

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
  let count = 0;
  for (let vessel of vessels) {
    if (
      vessel[7] > currentTileJSON.image_west &&
      vessel[7] < currentTileJSON.image_east &&
      vessel[8] > currentTileJSON.image_south &&
      vessel[8] < currentTileJSON.image_north
    ) {
      drawVessel(vessel);

      count++;
    }
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

let vessels =
  JSON.parse(`[[128,"2020-11-18T00:00:01.000Z",219000183,"Class A",null,128,"Under way using engine",11.886927,54.996857,0,0,187.1,300,null,1,5428,54282],[129,"2020-11-18T00:00:01.000Z",992111840,"AtoN",null,129,"Unknown value",12.62997,54.612913,null,null,null,null,5,1,5526,55264],[131,"2020-11-18T00:00:01.000Z",235102628,"Class A",null,131,"Under way using engine",11.35085,54.65645,null,0.1,81,null,null,1,5428,54283],[132,"2020-11-18T00:00:01.000Z",636091859,"Class A",9534250,132,"Under way using engine",11.88638,54.443975,0,8.1,273.2,271,null,1,null,null],[133,"2020-11-18T00:00:01.000Z",211190000,"Class A",9151539,133,"Under way using engine",11.330283,54.63955,11.4,11.8,24.6,23,null,1,5428,54283],[134,"2020-11-18T00:00:01.000Z",219009229,"Class A",null,134,"Under way using engine",12.374358,55.253255,0,0,29.2,29,null,1,5527,55271],[135,"2020-11-18T00:00:01.000Z",376083000,"Class A",9240732,135,"Under way using engine",12.010343,54.214262,null,0.8,37.9,280,null,1,null,null],[136,"2020-11-18T00:00:01.000Z",235006758,"Class A",7719882,136,"Under way using engine",9.95381,57.591635,0,0,302.3,137,null,1,null,null],[137,"2020-11-18T00:00:01.000Z",2655185,"Base Station",null,137,"Unknown value",14.775362,56.226938,null,null,null,null,null,1,null,null],[138,"2020-11-18T00:00:01.000Z",220024000,"Class A",null,138,"Engaged in fishing",10.712848,56.53373,0,0,273.7,182,null,1,5334,53344],[139,"2020-11-18T00:00:01.000Z",636019497,"Class A",null,139,"Under way using engine",11.225117,58.080398,0.2,5.9,154.3,162,null,1,null,null],[140,"2020-11-18T00:00:01.000Z",219006835,"Class A",null,140,"Engaged in fishing",11.126337,57.320783,0,0,252,74,null,1,5433,54331],[141,"2020-11-18T00:00:01.000Z",244780000,"Class A",9467196,141,"Under way using engine",12.397002,56.29581,0,12,341.5,345,null,1,5529,55291],[142,"2020-11-18T00:00:01.000Z",219012639,"Class A",null,142,"Under way using engine",10.921902,56.409012,null,0,156.2,null,null,1,5333,53332],[143,"2020-11-18T00:00:01.000Z",218176000,"Class A",8905115,143,"Under way using engine",8.177562,56.704625,0,4.6,231.6,238,null,1,5138,51383],[144,"2020-11-18T00:00:01.000Z",219000852,"Class A",7726782,144,"Under way using engine",14.587163,55.012403,null,2,25.3,28,null,1,null,null],[145,"2020-11-18T00:00:01.000Z",219001695,"Class A",null,145,"Engaged in fishing",8.42579,55.473452,0,0,0,241,null,1,5135,51351],[146,"2020-11-18T00:00:01.000Z",244850855,"Class A",9321108,146,"Under way using engine",12.320868,56.428852,0,12.2,345.4,344,null,1,5529,55291],[147,"2020-11-18T00:00:01.000Z",2573125,"Base Station",null,147,"Unknown value",8.766667,58.433333,null,null,null,null,null,1,null,null],[148,"2020-11-18T00:00:01.000Z",219026443,"Class A",null,148,"Under way using engine",14.83922,55.279032,null,14.9,92.1,96,null,1,null,null],[149,"2020-11-18T00:00:01.000Z",265540720,"Class A",null,149,"Unknown value",11.879603,57.818043,null,0,null,null,null,1,null,null],[150,"2020-11-18T00:00:01.000Z",219025535,"Class A",null,150,"Engaged in fishing",8.219762,56.693075,null,0,null,null,null,1,5138,51383],[151,"2020-11-18T00:00:01.000Z",219063000,"Class A",9545156,151,"Engaged in fishing",8.130628,56.00112,0,0,299.2,310,null,1,5137,51373],[153,"2020-11-18T00:00:01.000Z",538007975,"Class A",9474280,153,"Under way using engine",10.260775,57.766832,-0.4,9.6,266.8,266,null,1,null,null],[154,"2020-11-18T00:00:01.000Z",219997000,"Class A",9250969,154,"Restricted maneuverability",10.817943,56.073422,null,7.6,97.7,98,null,1,5333,53334],[155,"2020-11-18T00:00:01.000Z",265527920,"Class A",null,155,"Unknown value",11.642003,57.744483,0,0,145.8,164,null,1,null,null],[156,"2020-11-18T00:00:01.000Z",219622000,"Class A",9150030,156,"Under way using engine",12.617203,56.033122,0,0,256,258,null,1,5529,55294],[157,"2020-11-18T00:00:01.000Z",2190047,"Base Station",null,157,"Unknown value",12.613717,55.69725,null,null,null,null,null,1,5528,55284],[158,"2020-11-18T00:00:01.000Z",244110544,"Class A",9037173,158,"Under way using engine",12.170667,56.679333,0,11.3,162,166,null,1,5530,55303],[159,"2020-11-18T00:00:01.000Z",219358000,"Class A",null,159,"Under way using engine",9.849727,57.703048,0,15.6,238.6,238,null,1,null,null],[160,"2020-11-18T00:00:01.000Z",2655125,"Base Station",null,160,"Unknown value",15.601643,56.174227,null,null,null,null,null,1,null,null],[161,"2020-11-18T00:00:01.000Z",265570730,"Class A",null,161,"Unknown value",12.242875,57.108703,0,0,78.3,139,null,1,5531,55313],[162,"2020-11-18T00:00:01.000Z",219001182,"Class A",null,162,"Under way using engine",10.063905,55.822582,0,0,93,93,null,1,5332,53321],[163,"2020-11-18T00:00:01.000Z",265663280,"Class A",null,163,"Under way using engine",11.870367,57.681952,null,0,78.4,253,null,1,null,null],[164,"2020-11-18T00:00:01.000Z",220046000,"Class A",null,164,"Engaged in fishing",11.127652,57.321627,0,0,108.8,326,null,1,5433,54331],[165,"2020-11-18T00:00:01.000Z",219001149,"Class A",null,165,"Engaged in fishing",11.12459,57.320323,null,0,315,null,null,1,5433,54331],[166,"2020-11-18T00:00:01.000Z",220368000,"Class A",null,166,"Under way using engine",10.501927,57.494173,0,0,253.9,164,null,1,5335,53352],[167,"2020-11-18T00:00:01.000Z",219007606,"Class A",null,167,"Under way using engine",9.961082,57.593325,null,0.1,307.3,null,null,1,null,null],[169,"2020-11-18T00:00:01.000Z",219003879,"Class A",null,169,"Unknown value",10.214303,56.154405,null,0,280.5,null,null,1,5333,53333],[170,"2020-11-18T00:00:01.000Z",256600000,"Class A",9358890,170,"Under way using engine",12.685022,56.01634,32.5,8.1,260.6,288,null,1,5529,55294],[172,"2020-11-18T00:00:01.000Z",219014012,"Class A",9566148,172,"Under way using engine",8.424293,55.475305,0,0,61.5,65,null,1,5135,51351],[173,"2020-11-18T00:00:01.000Z",2655130,"Base Station",null,173,"Unknown value",14.158132,55.668072,null,null,null,null,null,1,null,null],[174,"2020-11-18T00:00:01.000Z",246476000,"Class A",9226164,174,"Under way using engine",5.348287,55.430573,null,7.9,181.9,193,null,1,null,null],[175,"2020-11-18T00:00:01.000Z",219005921,"Class A",null,175,"Unknown value",12.309128,56.127617,0,0,123.4,103,null,1,5529,55293],[176,"2020-11-18T00:00:01.000Z",331569000,"Class A",null,176,"Under way using engine",10.62133,55.05924,0,0,0,126,null,1,5331,53314],[177,"2020-11-18T00:00:01.000Z",259488000,"Class A",9165487,177,"Under way using engine",9.988803,55.096065,0,10.8,126.4,128,null,1,5233,52334],[178,"2020-11-18T00:00:01.000Z",209210000,"Class A",9174086,178,"Under way using engine",14.521073,55.405683,0,10.2,217,220,null,1,null,null],[179,"2020-11-18T00:00:01.000Z",231112000,"Class A",8414116,179,"Under way using engine",8.415955,55.476953,0,null,null,336,null,1,5135,51351],[180,"2020-11-18T00:00:01.000Z",209114000,"Class A",9173185,180,"Under way using engine",9.729725,54.331537,0,8.1,229.9,228,null,1,null,null],[181,"2020-11-18T00:00:01.000Z",236597000,"Class A",9060778,181,"Under way using engine",10.730292,57.503783,0,11.6,34.7,36,null,1,null,null],[182,"2020-11-18T00:00:01.000Z",219168000,"Class A",8516225,182,"Engaged in fishing",8.219043,56.695783,0,0,197.8,165,null,1,5138,51383],[183,"2020-11-18T00:00:01.000Z",265750000,"Class A",6709971,183,"Engaged in fishing",14.357867,55.557392,0,0,33,107,null,1,null,null],[184,"2020-11-18T00:00:01.000Z",219027804,"Class A",null,184,"Under way using engine",11.866298,55.94246,null,0,null,null,null,1,5430,54302],[185,"2020-11-18T00:00:01.000Z",219000674,"Class A",9199074,185,"Under way using engine",10.412888,54.89157,0,0,185,244,null,1,5330,53301],[186,"2020-11-18T00:00:01.000Z",219011857,"Class A",null,186,"Under way using engine",11.13654,55.88055,null,0,null,null,null,1,5430,54301],[187,"2020-11-18T00:00:01.000Z",219018494,"Class A",null,187,"Under way using engine",8.366383,56.958633,null,0,334,null,null,1,5138,51381],[188,"2020-11-18T00:00:01.000Z",209864000,"Class A",null,188,"Under way using engine",13.932805,54.955677,0,12.2,170.1,175,null,1,null,null],[189,"2020-11-18T00:00:01.000Z",636017523,"Class A",9426049,189,"Under way using engine",9.107167,57.4255,-2.9,14.8,54,53,null,1,5237,52371],[190,"2020-11-18T00:00:01.000Z",265797590,"Class A",null,190,"Under way using engine",12.823597,55.867897,null,0,null,null,null,1,5528,55282],[191,"2020-11-18T00:00:01.000Z",2190076,"Base Station",null,191,"Unknown value",9.50201,55.674637,null,null,null,null,null,1,5234,52344],[192,"2020-11-18T00:00:01.000Z",266454000,"Class A",9442914,192,"Under way using engine",12.710327,55.493712,0,11.6,11,12,null,1,5527,55272],[193,"2020-11-18T00:00:01.000Z",211718360,"Class A",9142497,193,"Under way using engine",9.895192,55.050345,0,8.6,316.4,314,null,1,5233,52334],[194,"2020-11-18T00:00:01.000Z",311648000,"Class A",9281009,194,"Under way using engine",14.594665,55.353857,0,8.6,38,34,null,1,null,null],[195,"2020-11-18T00:00:01.000Z",219023834,"Class A",null,195,"Under way using engine",10.833697,54.933897,0,0,335.8,297,null,1,5330,53302],[196,"2020-11-18T00:00:01.000Z",265759020,"Class A",null,196,"Unknown value",13.058597,55.675662,null,0,305.9,null,null,1,null,null],[197,"2020-11-18T00:00:01.000Z",992191518,"AtoN",null,197,"Unknown value",4.648298,55.767517,null,null,null,null,null,1,null,null],[198,"2020-11-18T00:00:01.000Z",257555000,"Class A",9356622,198,"Under way using engine",7.355113,57.02847,0,10.5,213.2,218,null,1,5041,50413],[199,"2020-11-18T00:00:01.000Z",219023833,"Class A",null,199,"Under way using engine",11.082668,55.677392,0,0,98,93,null,1,5430,54303],[200,"2020-11-18T00:00:01.000Z",219005787,"Class A",null,200,"Under way using engine",10.549683,57.439205,null,0.1,null,null,null,1,5335,53352],[201,"2020-11-18T00:00:01.000Z",219005583,"Class A",null,201,"Engaged in fishing",10.584823,57.715512,0,0,119,52,null,1,null,null],[202,"2020-11-18T00:00:01.000Z",219002783,"Class A",null,202,"Moored",8.120032,56.371518,0,0,256.1,254,null,1,5137,51371],[204,"2020-11-18T00:00:01.000Z",219005866,"Class A",null,204,"Unknown value",11.123572,57.320527,0,0,137.4,61,null,1,5433,54331],
[206,"2020-11-18T00:00:01.000Z",220338000,"Class A",null,206,"Engaged in fishing",12.309343,56.12817,0,0,301.2,293,null,1,5529,55293],[207,"2020-11-18T00:00:01.000Z",219013885,"Class A",null,207,"Engaged in fishing",10.585258,57.715715,0,0,238.5,48,null,1,null,null],[208,"2020-11-18T00:00:01.000Z",273390790,"Class A",9143611,208,"Under way using engine",13.504545,55.200847,null,7.9,100.5,103,null,1,null,null],[209,"2020-11-18T00:00:01.000Z",220012000,"Class A",null,209,"Unknown value",10.924392,56.409622,0,0,322.2,263,null,1,5333,53332],[210,"2020-11-18T00:00:01.000Z",220333000,"Class A",null,210,"Unknown value",10.587007,57.71763,0,0,339.4,133,null,1,null,null],[211,"2020-11-18T00:00:01.000Z",636018753,"Class A",9411989,211,"Under way using engine",6.9316,56.186038,0,13.7,37.7,34,null,1,null,null],[212,"2020-11-18T00:00:01.000Z",219003119,"Class A",null,212,"Engaged in fishing",9.126967,57.1399,null,0,null,null,null,1,5237,52373],[213,"2020-11-18T00:00:01.000Z",538003432,"Class A",9288916,213,"Under way using engine",11.103033,56.25435,0,12.8,0,0,null,1,5431,54311],[214,"2020-11-18T00:00:01.000Z",219025741,"Class B",null,214,"Unknown value",12.574093,55.849863,null,0.1,null,null,null,1,5528,55282],[215,"2020-11-18T00:00:01.000Z",2190069,"Base Station",null,215,"Unknown value",9.82415,57.003785,null,null,null,null,null,1,5237,52374],[216,"2020-11-18T00:00:01.000Z",219872000,"Class A",9240988,216,"Engaged in fishing",8.218058,56.697715,0,0,249.7,337,null,1,5138,51383],[217,"2020-11-18T00:00:01.000Z",305541000,"Class A",9534274,217,"Under way using engine",11.57654,54.499252,0,10.2,292.6,294,null,1,null,null],[218,"2020-11-18T00:00:01.000Z",220251000,"Class A",7829235,218,"Restricted maneuverability",10.522655,54.854167,0,0,18,164,null,1,5330,53302],[219,"2020-11-18T00:00:01.000Z",219006092,"Class A",null,219,"Under way using engine",8.59941,57.122842,0,0,0,327,null,1,5139,51394],[220,"2020-11-18T00:00:01.000Z",265177000,"Class A",7907245,220,"Under way using engine",11.65464,57.605328,0,15.8,57,58,null,1,null,null],[221,"2020-11-18T00:00:01.000Z",244521000,"Class A",9160449,221,"Under way using engine",9.352687,53.828677,null,16.1,142.9,144,null,1,null,null],[222,"2020-11-18T00:00:01.000Z",219005477,"Class A",null,222,"Reserved for future use [11]",10.21625,56.152867,null,0.1,211.3,null,null,1,5333,53333],[223,"2020-11-18T00:00:01.000Z",219005671,"Class A",null,223,"Engaged in fishing",8.600233,57.120687,0,0,null,149,null,1,5139,51394],[224,"2020-11-18T00:00:01.000Z",219002801,"Class A",null,224,"Unknown value",10.603313,57.720655,null,0,62.9,null,null,1,null,null],[225,"2020-11-18T00:00:01.000Z",373465000,"Class A",9539444,225,"Under way using engine",11.914742,54.430988,0,10.7,265.1,265,null,1,null,null],[226,"2020-11-18T00:00:01.000Z",2655135,"Base Station",null,226,"Unknown value",13.270352,55.478315,null,null,null,null,null,1,null,null],[227,"2020-11-18T00:00:01.000Z",2614700,"Base Station",null,227,"Unknown value",15.063923,54.094723,null,null,null,null,null,1,null,null],[228,"2020-11-18T00:00:01.000Z",244224000,"Class A",9505546,228,"Under way using engine",11.704497,56.535932,0,10.8,33.7,32,null,1,5432,54324],[229,"2020-11-18T00:00:01.000Z",219922000,"Class A",9239068,229,"Engaged in fishing",8.123532,56.003977,0,0,273.5,241,null,1,5137,51373],[230,"2020-11-18T00:00:01.000Z",219000000,"Class A",null,230,"Under way using engine",10.59021,57.717625,0,0,0,232,null,1,null,null]]`);
