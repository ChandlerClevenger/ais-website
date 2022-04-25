const DAO = require("./DAO/DAO.js");
var assert = require('assert');

//example insertion objects:
let object1 = '{"Timestamp":"2020-11-18T00:00:04.000Z","Class":"Class A","MMSI":219018009,"MsgType":"static_data","IMO":9681302,"CallSign":"OWJT2","Name":"WORLD MISTRAL","VesselType":"HSC","Length":25,"Breadth":10,"Draught":2.4,"Destination":"ESBJERG","ETA":"2020-11-14T17:15:00.000Z","A":17,"B":8,"C":8,"D":2}'
let object2 = '{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":219005465,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.572602,11.929218]},"Status":"Under way using engine","RoT":0,"SoG":0,"CoG":298.7,"Heading":203}'
let batch1 = [{"Timestamp":"2020-11-18T00:00:04.000Z","Class":"Class A","MMSI":219018009,"MsgType":"static_data","IMO":9681302,"CallSign":"OWJT2","Name":"WORLD MISTRAL","VesselType":"HSC","Length":25,"Breadth":10,"Draught":2.4,"Destination":"ESBJERG","ETA":"2020-11-14T17:15:00.000Z","A":17,"B":8,"C":8,"D":2}, {"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":219005465,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.572602,11.929218]},"Status":"Under way using engine","RoT":0,"SoG":0,"CoG":298.7,"Heading":203}]
let batch2 = [{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":218768000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.8001,10.146383]},"Status":"Under way sailing","RoT":0,"SoG":2.8,"CoG":151.6,"Heading":169},{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":265011000,"MsgType":"static_data","IMO":8616087,"CallSign":"SBEN","Name":"SOFIA","VesselType":"Cargo","Length":72,"Breadth":11,"Draught":3.7,"Destination":"DK VEJ","ETA":"2020-11-18T10:00:00.000Z","A":59,"B":13,"C":6,"D":5},{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":219012302,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.127,12.309167]},"Status":"Under way using engine","RoT":0,"SoG":0,"CoG":157,"Heading":193},{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":2190045,"MsgType":"position_report","Position":{"type":"Point","coordinates":[55.471767,8.423305]},"Status":"Unknown value","SoG":0,"CoG":321.4},{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":273418960,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.638938,11.375737]},"Status":"Under way sailing","RoT":0,"SoG":0,"CoG":180.7,"Heading":22}];
let batch3 = [{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":230006000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[55.394333,12.6615]},"Status":"Under way using engine","RoT":0,"SoG":18.4,"CoG":189.9,"Heading":191},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":244234000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.175183,12.458667]},"Status":"Under way using engine","RoT":0,"SoG":11.8,"CoG":316.8,"Heading":313},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":538008427,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.125627,12.496787]},"Status":"Under way using engine","RoT":0,"SoG":11.1,"CoG":130.9,"Heading":130},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":304944000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.208523,9.573637]},"Status":"Under way using engine","RoT":-0.4,"SoG":8.8,"CoG":50,"Heading":50},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":220359000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[57.49587,10.501518]},"Status":"Engaged in fishing","RoT":0,"SoG":0,"CoG":292,"Heading":137},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":266319000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[57.058867,12.273817]},"Status":"Under way using engine","RoT":0,"SoG":0,"CoG":219.9,"Heading":91},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":219837000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[57.122752,8.598]},"Status":"Engaged in fishing","RoT":0,"SoG":0,"CoG":309.9,"Heading":153},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":211329270,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.20705,12.1615]},"Status":"Restricted maneuverability","RoT":0,"SoG":7.5,"CoG":283.4,"Heading":282},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":245391000,"MsgType":"static_data","IMO":9467184,"CallSign":"PBRE","Name":"LAMMY","VesselType":"Cargo","Length":95,"Breadth":14,"Draught":5.1,"Destination":"AMSTERDAM","ETA":"2020-11-20T09:00:00.000Z","A":81,"B":14,"C":4,"D":10},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":219005867,"MsgType":"position_report","Position":{"type":"Point","coordinates":[57.717335,10.586895]},"Status":"Engaged in fishing","RoT":0,"SoG":0,"CoG":268.9,"Heading":311},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":636092297,"MsgType":"position_report","Position":{"type":"Point","coordinates":[55.244508,12.967945]},"Status":"Under way using engine","RoT":0,"SoG":11.8,"CoG":97.4,"Heading":97},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":248372000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.874693,11.830645]},"Status":"Constrained by her draught","RoT":-1.1,"SoG":11.2,"CoG":342,"Heading":338},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":375052000,"MsgType":"static_data","IMO":8865614,"CallSign":"J8HP2","Name":"HONTE","VesselType":"Reserved","Length":26,"Breadth":6,"Draught":2,"Destination":"WORK SITE","ETA":"2020-11-12T06:00:00.000Z","A":18,"B":8,"C":3,"D":3},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":265828500,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.1993,12.546188]},"Status":"Unknown value","SoG":0},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":219000183,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.996857,11.886927]},"Status":"Under way using engine","RoT":0,"SoG":0,"CoG":187.1,"Heading":300},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"AtoN","MMSI":992111840,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.612913,12.62997]},"Status":"Unknown value"},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"AtoN","MMSI":992111841,"MsgType":"static_data","IMO":"Unknown","Name":"WIND FARM BALTIC1SW","VesselType":"Undefined","Length":6,"Breadth":6,"A":3,"B":3,"C":3,"D":3},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":636092156,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.431572,12.139258]},"Status":"Under way using engine","RoT":0,"SoG":9.2,"CoG":268.4,"Heading":268},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":235102628,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.65645,11.35085]},"Status":"Under way using engine","SoG":0.1,"CoG":81},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":636091859,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.443975,11.88638]},"Status":"Under way using engine","RoT":0,"SoG":8.1,"CoG":273.2,"Heading":271},
{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":211190000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[57.863108,10.638098]},"Status":"Engaged in fishing","SoG":6.9,"CoG":157.3,"Heading":167},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":211190000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.63955,11.330283]},"Status":"Under way using engine","RoT":11.4,"SoG":11.8,"CoG":24.6,"Heading":23},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":235006758,"MsgType":"position_report","Position":{"type":"Point","coordinates":[57.591635,9.95381]},"Status":"Under way using engine","RoT":0,"SoG":0,"CoG":302.3,"Heading":137},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":219009229,"MsgType":"position_report","Position":{"type":"Point","coordinates":[55.253255,12.374358]},"Status":"Under way using engine","RoT":0,"SoG":0,"CoG":29.2,"Heading":29},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Base Station","MMSI":2655185,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.226938,14.775362]},"Status":"Unknown value"},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":636019497,"MsgType":"position_report","Position":{"type":"Point","coordinates":[58.080398,11.225117]},"Status":"Under way using engine","RoT":0.2,"SoG":5.9,"CoG":154.3,"Heading":162},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":220024000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.53373,10.712848]},"Status":"Engaged in fishing","RoT":0,"SoG":0,"CoG":273.7,"Heading":182},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":219006835,"MsgType":"position_report","Position":{"type":"Point","coordinates":[57.320783,11.126337]},"Status":"Engaged in fishing","RoT":0,"SoG":0,"CoG":252,"Heading":74},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":244780000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.29581,12.397002]},"Status":"Under way using engine","RoT":0,"SoG":12,"CoG":341.5,"Heading":345},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":376083000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.214262,12.010343]},"Status":"Under way using engine","SoG":0.8,"CoG":37.9,"Heading":280},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":219012639,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.409012,10.921902]},"Status":"Under way using engine","SoG":0,"CoG":156.2},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":219001695,"MsgType":"position_report","Position":{"type":"Point","coordinates":[55.473452,8.42579]},"Status":"Engaged in fishing","RoT":0,"SoG":0,"CoG":0,"Heading":241},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":244850855,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.428852,12.320868]},"Status":"Under way using engine","RoT":0,"SoG":12.2,"CoG":345.4,"Heading":344},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Base Station","MMSI":2573125,"MsgType":"position_report","Position":{"type":"Point","coordinates":[58.433333,8.766667]},"Status":"Unknown value"},
{"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":218176000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.704625,8.177562]},"Status":"Under way using engine","RoT":0,"SoG":4.6,"CoG":231.6,"Heading":238}];

/*describe('TMB_DAO',	function(){
	describe('insert_message_batch_interface( batch )', function() {
		it('is defined and accepts a JSON parsable string as an input', function() {

			let inserted_count =  dao.insertAISMessageBatch( array );
			assert.equal( inserted_count, 2)
		})
	})
});

*/
//Unit Tests (stubs):
//stubs don't implement the whole function (queries)

async function batchInsertionJSON(){
	var db = new DAO();
	let insertionCheck = await db.insertAISMessageBatch(batch1);
	assert.equal(insertionCheck,2)
}

async function batchInsertionIncorrectInput(){
	let insertionCheck = await db.insertAISMessageBatch("lol")
	assert.equal(insertionCheck, -1)
}

async function insertSmallAISBatch(batch) {
	let insertionAmount = await db.insertAISMessageBatch(batch);
	assert.equal(insertionAmount, 2)
}
async function insertMediumAISBatch(batch) {
	let insertionAmount = await db.insertAISMessageBatch(batch);
	assert.equal(insertionAmount, 5)
}
async function insertLargeAISBatch(batch){
	let insertionAmount = await db.insertAISMessageBatch(batch);
	assert.equal(insertionAmount, 35)
}
async function insertOneStaticData(message) {
	let successfulInsert = await db.insertAISMessage(message);
	assert.equal(successfulInsert, 1)
}
async function insertOnePositionReport(message){
	let successfulInsert = await db.insertAISMessage(message);
	assert.equal(successfulInsert, 1)
}
async function deleteOldMessages(){
	let successfulDeletetion = await db.deleteOldMessages(mmsi)
	assert.equal(successfulDeletetion,) //integer tbd)
}
async function readAllMostRecentPositions(){
	let successfulRead = await db.readMostRecentPositionAllShips()
	//console.log(successfulRead)
	//assert.deepEqual(,[])
}
async function readMostRecentPosition() {
	let successfulRead = await db.readMostRecentPosition(246430000);
	console.log(successfulRead)
	//assert.deepEqual(successfulRead, {"MMSI":246430000,"lat":57.147058,"long":8.319127,"IMO":9248564})
}
async function readPermanentInfoOneParameter(mmsi) {
	let successfulRead = await db.readPermanentVesselData(mmsi)
	console.log(successfulRead)
}
async function readPermanentInfoTwoParameters(mmsi, imo) {
	let successfulRead = await db.readPermanentVesselData(mmsi,imo)
	console.log(successfulRead)
}
async function readPermanentInfoThreeParameters(mmsi,imo,name) {
	let successfulRead = await db.readPermanentVesselData(mmsi, imo, name)
	console.log(successfulRead)
}
async function readPermanentInfoAllParameters(mmsi,imo,name,callsign) {
	let successfulRead = await db.readPermanentVesselData(mmsi, imo, name, callsign)
}
async function readMostRecentPosition(mmsi) {
	let successfulRead = await db.readMostRecentPosition(mmsi)
	console.log(successfulRead)
}
async function readPortsMatchingNameWithOnlyName() {
	let successfulRead = await db.readAllPortsMatchingName('Nyborg');
	assert.deepEqual(successfulRead, [{"Id":381, "Name":'Nyborg', "Country":'Denmark', "Latitude":55.298889, "Longitude":10.810833,"MapView1_Id":1,"MapView2_Id":5331,"MapView3_Id":53312},{"Id":4970, "Name":'Nyborg', "Country":'Denmark', "Latitude":55.306944, "Longitude":10.790833,"MapView1_Id":1,"MapView2_Id":5331,"MapView3_Id":53312}])
}
async function readPortsMatchingNameWithNameAndCountry() {
	let successfulRead = await db.readAllPortsMatchingName('Nyborg','Denmark');
	assert.deepEqual(successfulRead, [{"Id":381, "Name":'Nyborg', "Country":'Denmark', "Latitude":55.298889, "Longitude":10.810833,"MapView1_Id":1,"MapView2_Id":5331,"MapView3_Id":53312},{"Id":4970, "Name":'Nyborg', "Country":'Denmark', "Latitude":55.306944, "Longitude":10.790833,"MapView1_Id":1,"MapView2_Id":5331,"MapView3_Id":53312}])
}

function callStubTests(){
	db.stub = true;
	batchInsertionJSONParsableString();
}

function callUnitTests(){
	db.stub = false;
	batchInsertionIncorrectInput();
	// insertSmallAISBatch();
	// insertMediumAISBatch();
	// insertLargeAISBatch();
	// insertOneStaticData();
	// insertOnePositionReport();
}

//callUnitTests();

async function integrationTest(){
	const insertion = await db.insertAISMessageBatch(batch3)
	const read = await db.readPermanentVesselData(batch3[0]["MMSI"], batch3[0]["IMO"], batch3[0]["Name"])
	console.log(read)
}

integrationTest();

//readPermanentInfoTwoParameters()
//readAllMostRecentPositions()
//readPortsMatchingNameWithNameAndCountry()
//readMostRecentPosition()
//readPermanentInfoOneParameter()
//readLastFivePositions()
//insertSmallAISBatch(batch1).then(readPermanentInfoOneParameter(319904000))

// readPermanentInfoTwoParameters(319904000,1000021) 
// readPermanentInfoThreeParameters(319904000,1000021,"Montkaj") 
// readPermanentInfoAllParameters(319904000,1000021,"Montkaj", undefined) 
