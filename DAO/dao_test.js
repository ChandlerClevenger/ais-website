/**
 * @file Test file for the unit and integration tests of the DAO. 
 * By calling the main test function, this file automatically deletes all dynamic data from the tables so that we can properly test the functions.
 * Unit tests: These tests implement the stub mode. Which when true, these tests don't actually implement the full functions. They don't connect to the database.
 * These unit tests test two things: if they catch false input and if they can be called without connecting to the mysql database.
 * Integration tests: These tests implement the full function (connection to the database and everything). These test whether the connection passes and if the return value is correct.
 */


 const DAO = require("./DAO.js");
 var assert = require('assert');
 var db = new DAO();
 
 //example insertion objects:
 let object1 = '{"Timestamp":"2020-11-18T00:00:04.000Z","Class":"Class A","MMSI":219018009,"MsgType":"static_data","IMO":9681302,"CallSign":"OWJT2","Name":"WORLD MISTRAL","VesselType":"HSC","Length":25,"Breadth":10,"Draught":2.4,"Destination":"ESBJERG","ETA":"2020-11-14T17:15:00.000Z","A":17,"B":8,"C":8,"D":2}'
 let object2 = '{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":219005465,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.572602,11.929218]},"Status":"Under way using engine","RoT":0,"SoG":0,"CoG":298.7,"Heading":203}'
 let batch1 = '[{"Timestamp":"2020-11-18T00:00:04.000Z","Class":"Class A","MMSI":219018009,"MsgType":"static_data","IMO":9681302,"CallSign":"OWJT2","Name":"WORLD MISTRAL","VesselType":"HSC","Length":25,"Breadth":10,"Draught":2.4,"Destination":"ESBJERG","ETA":"2020-11-14T17:15:00.000Z","A":17,"B":8,"C":8,"D":2}, {"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":219005465,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.572602,11.929218]},"Status":"Under way using engine","RoT":0,"SoG":0,"CoG":298.7,"Heading":203}]'
 let batch2 = [{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":218768000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.8001,10.146383]},"Status":"Under way sailing","RoT":0,"SoG":2.8,"CoG":151.6,"Heading":169},{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":265011000,"MsgType":"static_data","IMO":8616087,"CallSign":"SBEN","Name":"SOFIA","VesselType":"Cargo","Length":72,"Breadth":11,"Draught":3.7,"Destination":"DK VEJ","ETA":"2020-11-18T10:00:00.000Z","A":59,"B":13,"C":6,"D":5},{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":219012302,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.127,12.309167]},"Status":"Under way using engine","RoT":0,"SoG":0,"CoG":157,"Heading":193},{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":2190045,"MsgType":"position_report","Position":{"type":"Point","coordinates":[55.471767,8.423305]},"Status":"Unknown value","SoG":0,"CoG":321.4},{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":273418960,"MsgType":"position_report","Position":{"type":"Point","coordinates":[54.638938,11.375737]},"Status":"Under way sailing","RoT":0,"SoG":0,"CoG":180.7,"Heading":22}];
 let batch3 = `[{"Timestamp":"2020-11-18T00:00:00.000Z","Class":"Class A","MMSI":230006000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[55.394333,12.6615]},"Status":"Under way using engine","RoT":0,"SoG":18.4,"CoG":189.9,"Heading":191},
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
 {"Timestamp":"2020-11-18T00:00:01.000Z","Class":"Class A","MMSI":218176000,"MsgType":"position_report","Position":{"type":"Point","coordinates":[56.704625,8.177562]},"Status":"Under way using engine","RoT":0,"SoG":4.6,"CoG":231.6,"Heading":238}]`
 

  // Unit Tests (stubs):
  // stubs don't implement the whole function (queries)

/**
 * Unit test that tests whether the insertAISMessageBatch function can be called on the interface with the correct parameters without a connection to the database.
 */
 async function batchInsertionUnitTest(){
	 let messageLength = await db.insertAISMessageBatch(batch1);
	 try{
		 assert.equal(messageLength, 2)
	 	console.log("1.	Pass")
	 } catch(e) {
		 console.log("1.	Fail\n")
		 console.log(e)
	 }
 }
 /**
 * Unit test that tests whether the insertAISMessageBatch function fails nicely with incorrect input.
 */
 async function batchInsertionIncorrectInputUnitTest(){
	 let messageLength = await db.insertAISMessageBatch("stringMessage")
	 try{
	 	assert.equal(messageLength, -1)
	 	console.log("2.	Pass")
	 }catch(e) {
		console.log("2.	Fail\n")
		console.log(e)
	 }
 }
 /**
 * Unit test that tests whether the cleanupMessages function can be called on the interface with the correct parameters without a connection to the database.
 */
 async function cleanupStringUnitTest(){
	 let messageLength = await db.cleanupMessages("2020-11-18T00:00:00.000Z")
	 try{
	 	assert.equal(messageLength, 1)
	 	console.log("3.	Pass")
	 }catch(e){
		console.log("3.	Fail\n")
		console.log(e)
	 }
 }
/**
 * Unit test that tests whether the cleanupMessages function fails nicely with incorrect input.
 */
 async function cleanupIncorrectInputUnitTest(){
	 let messageLength = await db.cleanupMessages([1602932938])
	 try {
	 	assert.equal(messageLength, -1)
		console.log("4.	Pass")
	 }catch(e){
		console.log("4.	Fail\n")
		console.log(e)
	 }
 }
 /**
 * Unit test that tests whether the insertAISMessage function can be called on the interface with the correct parameters without a connection to the database.
 */
 async function insertAISMessageUnitTest(){
	 let messageType = await db.insertAISMessage(object1)
	 try{
	 	assert.equal(messageType, 1)
	 	console.log("5.	Pass")
	 }catch(e){
		console.log("5.	Fail\n")
		console.log(e)
	 }
 }
 /**
 * Unit test that tests whether the insertAISMessage function fails nicely with incorrect input.
 */
 async function insertAISMessageIncorrectInputUnitTest(){
	 let messageType = await db.insertAISMessage("[{Timestamp: '2020-11-18T00:00:00.000Z'}, {Timestamp: '2020-11-18T00:00:00.000Z'}]")
	 try{
	 	assert.equal(messageType, -1)
	 	console.log("6.	Pass")
	 }catch(e){
		console.log("6.	Fail\n")
		console.log(e)
	 }
 }
 /**
 * Unit test that tests whether the readMostRecentPosition function can be called on the interface with the correct parameters without a connection to the database.
 */
 async function readMostRecentPositionUnitTest(){
	 let messageType = await db.readMostRecentPosition(2123812)
	 try{
	 	assert.equal(messageType, 1)
	 	console.log("7.	Pass")
	 }catch(e){
		console.log("7.	Fail\n")
		console.log(e)
	 }
 }
 /**
 * Unit test that tests whether the readMostRecentPosition function fails nicely with incorrect input.
 */
 async function readMostRecentPositionIncorrectInputUnitTest(){
	 let messageType = await db.readMostRecentPosition('212394')
	 try{
	 	assert.equal(messageType, -1)
	 	console.log("8.	Pass")
	 }catch(e){
		console.log("8.	Fail\n")
		console.log(e)
	 }

 }
 /**
 * Unit test that tests whether the readPermanentVesselData function can be called on the interface with the correct parameter (MMSI) without a connection to the database.
 */
 async function readPermanentVesselDataOneParamUnitTest(){
	 let messageLength = await db.readPermanentVesselData(319904000)
	 try{
	 	assert.equal(messageLength, 1)
	 	console.log("9.	Pass")
	 }catch(e){
		console.log("9.	Fail\n")
		console.log(e)
	 }
 }
 /**
 * Unit test that tests whether the readPermanentVesselData function can be called on the interface with the correct parameters (MMSI, IMO) without a connection to the database.
 */
 async function readPermanentVesselDataTwoParamsUnitTest(){
	 let messageLength = await db.readPermanentVesselData(319904000,1000021)
	 try{
	 	assert.equal(messageLength, 1)
	 	console.log("10.	Pass")
	 }catch(e){
		console.log("10.	Fail\n")
		console.log(e)
	 }
 }
 /**
 * Unit test that tests whether the readPermanentVesselData function can be called on the interface with the correct parameters (MMSI, IMO, Name) without a connection to the database.
 */
 async function readPermanentVesselDataThreeParamsUnitTest(){
	 let messageLength = await db.readPermanentVesselData(319904000,1000021,"Montkaj")
	 try{
	 	assert.equal(messageLength, 1)
	 	console.log("11.	Pass")
	 }catch(e){
		console.log("11.	Fail\n")
		console.log(e)
	 }
 }
 /**
 * Unit test that tests whether the readPermanentVesselData function can be called on the interface with the correct parameters (MMSI, IMO, Name, CallSign) without a connection to the database.
 */
 async function readPermanentVesselDataAllParamsUnitTest(){
	 let messageLength = await db.readPermanentVesselData(319904000,1000021,"Montkaj", "J21AS")
	 try{
	 	assert.equal(messageLength, 1)
	 	console.log("12.	Pass")
	 }catch(e){
		console.log("12.	Fail\n")
		console.log(e)
	 }
 }
 /**
 * Unit test that tests whether the readPermanentVesselData function fails nicely with incorrect input.
 */
 async function readPermanentVesselDataNoParamsUnitTest(){
	 let messageLength = await db.readPermanentVesselData()
	 try{
	 	assert.equal(messageLength, -1)
	 	console.log("13.	Pass")
	 }catch(e){
		console.log("13.	Fail\n")
		console.log(e)
	 }
 }

 async function readRecentPositionsInTileUnitTest(){
	let type = await db.readRecentPositionsInTile(1)
	try{
		assert.equal(type,	1)
		console.log("14.	Pass")
	}catch(e){
	   console.log("14.	Fail\n")
	   console.log(e)
	}
}
 /**
 * Unit test that tests whether the readAllPortsMatchingName function can be called on the interface with the correct parameter (Name) without a connection to the database.
 */
 async function readAllPortsMatchingNameOneParamUnitTest(){
	 let messageLength = await db.readAllPortsMatchingName("Montkaj")
	 try{
	 	assert.equal(messageLength, 1)
	 	console.log("14.	Pass")
	 }
	 catch(e){
		console.log("14.	Fail\n")
		console.log(e)
	 }
 }
 /**
 * Unit test that tests whether the readAllPortsMatchingName function can be called on the interface with the correct parameters (Name, Country) without a connection to the database.
 */
 async function readAllPortsMatchingNameBothParamsUnitTest(){
	 let messageLength = await db.readAllPortsMatchingName("Montkaj", "Peru")
	 try{
	 	assert.equal(messageLength, 1)
	 	console.log("15.	Pass")
	 }catch(e){
		console.log("15.	Fail\n")
		console.log(e)
	 }
 }
 /**
 * Unit test that tests whether the readAllPortsMatchingName function fails nicely with incorrect input.
 */
 async function readAllPortsMatchingNameWrongParamsUnitTest(){
	 let messageLength = await db.readAllPortsMatchingName(1020, "Peru")
	 try{
	 	assert.equal(messageLength, -1)
	 	console.log("16.	Pass")
	 }catch(e){
		console.log("16.	Fail\n")
		console.log(e)
	 }
 }

 async function readAllShipPositionsInScale3CorrectParametersUnitTest(){
	let readFromPortName = await db.readAllShipPositionsInScale3ContainingPort("Nyborg", "Denmark")
	try{
		assert.equal(readFromPortName, 1)
		console.log("17.	Pass")
	}catch(e){
		console.log("17.	Fail\n")
		console.log(e)
	}
 }

 async function readAllShipPositionsInScale3IncorrectCountryUnitTest(){
	let readFromPortName = await db.readAllShipPositionsInScale3ContainingPort(123, "Denmark")
	try{
		assert.equal(readFromPortName, -1)
		console.log("18.	Pass")
	}catch(e){
		console.log("18.	Fail\n")
		console.log(e)
	}
 }

 async function readAllShipPositionsInScale3IncorrectPortNameUnitTest(){
	let readFromPortName = await db.readAllShipPositionsInScale3ContainingPort("Nyborg", 123)
	try{
		assert.equal(readFromPortName, -1)
		console.log("19.	Pass")
	}catch(e){
		console.log("19.	Fail\n")
		console.log(e)
	}
 }

 
 /**
 * Function that contains and calls all of the unit tests.
 * @function unitTests
 */
 	async function unitTests(){
	 console.log("\nUNIT TESTS: \n")
	 db.stub = true;
	 batchInsertionUnitTest();
	 batchInsertionIncorrectInputUnitTest();
	 cleanupStringUnitTest();
	 cleanupIncorrectInputUnitTest();
	 insertAISMessageUnitTest();
	 insertAISMessageIncorrectInputUnitTest();
	 readMostRecentPositionUnitTest();
	 readMostRecentPositionIncorrectInputUnitTest();
	 readPermanentVesselDataOneParamUnitTest();
	 readPermanentVesselDataTwoParamsUnitTest();
	 readPermanentVesselDataThreeParamsUnitTest();
	 readPermanentVesselDataAllParamsUnitTest();
	 readPermanentVesselDataNoParamsUnitTest();
	 readRecentPositionsInTileUnitTest();
	 readAllPortsMatchingNameOneParamUnitTest();
	 readAllPortsMatchingNameBothParamsUnitTest();
	 readAllPortsMatchingNameWrongParamsUnitTest();
	 readAllShipPositionsInScale3CorrectParametersUnitTest();
	 readAllShipPositionsInScale3IncorrectCountryUnitTest();
	 readAllShipPositionsInScale3IncorrectPortNameUnitTest();
	
	 
 }


  // Integration Tests :
  // Tests that actually implement and run queries on the database through a connection.



  /**
 * Function that contains all of the integration tests.
 * @function integrationTests
 */
 async function integrationTests(){
	 console.log("\nINTEGRATION TESTS: \n")
	 parsedBatch3 = JSON.parse(batch3)
	 db.stub = false

	 const readMostRecentPositionEmpty =  await db.readMostRecentPosition(parsedBatch3[0].MMSI) 
	 try {
	 	assert.deepEqual(readMostRecentPositionEmpty, {})
	 	console.log("1.	Pass")
	 }catch(e){
		console.log("1.	Fail\n")
		console.log(e)
	 }

	

	 const insertion = await db.insertAISMessageBatch(batch3)
	 try{
	 	assert.equal(insertion, 35)
	 	console.log("2. 	Pass")
	 }catch(e){
		console.log("2. 	Fail\n")
		console.log(e)
	 }

	 //console.log(type.length)

	 const portRead1 = await db.readAllPortsMatchingName("Nyborg", "Denmark")
	 try{
		assert.equal(portRead1.length, 2)
		console.log("3. 	Pass")
	 }catch(e){
		console.log("3. 	Fail\n")
		console.log(e)
	 }
	 const portRead2 = await db.readAllPortsMatchingName("Helsingborg", "Sweden")
	 try{
		assert.equal(portRead2.length, 1)
		console.log("4. 	Pass")
	 }catch(e){
		console.log("4. 	Fail\n")
		console.log(e)
	 }

	 const readAllShips = await db.readMostRecentPositionAllShips()
	 try{
		assert.equal(readAllShips.length, 15)
		console.log("5. 	Pass")
	 }catch(e){
		console.log("5. 	Fail\n")
		console.log(e)
	 }
	 try {
		 assert.equal(readAllShips[1].MMSI, 248372000)
		 console.log("6. 	Pass")
	 }catch(e){
		console.log("6. 	Fail\n")
		console.log(e)
	 }

	 const readFromMMSI = await db.readMostRecentPosition(244234000) 
	 try{
		assert.equal(readFromMMSI.IMO, 9361354)
		console.log("7. 	Pass")
	 }catch(e){
		console.log("7. 	Fail\n")
		console.log(e)
	 }

	 const readVesselData = await db.readPermanentVesselData(parsedBatch3[0].MMSI, parsedBatch3[0].IMO, parsedBatch3[0].Name) 
	 const readMostRecentPosition =  await db.readMostRecentPosition(parsedBatch3[0].MMSI) 
	 try{
	 	assert.equal(readMostRecentPosition.IMO, readVesselData[0].IMO)
	 	console.log("8.	Pass")
	 }catch(e){
		 console.log("8.	Fail\n")
		 console.log(e)
	 }

	 const readTileScale1 = await db.readRecentPositionsInTile(1)
	 try {
		assert.equal(readTileScale1.length, 13)
		console.log("9. 	Pass")
	 }catch(e){
		console.log("9. 	Fail\n")
		console.log(e)
	 }
	 const readTileScale3 = await db.readRecentPositionsInTile(5529)
	 try {
		assert.equal(readTileScale3.length, 4)
		console.log("10. 	Pass")
	 }catch(e){
		console.log("10. 	Fail\n")
		console.log(e)
	 }

 }
 
/**
 * Function that is called to clear the dynamic database tables and calls the unit and integration testing functions.
 * @function mainTest
 */

 async function mainTest(){
	console.log("\nMilestone 4.\nOption C.\nDAO Testing File")
	console.log("-------------------------------------------------")
	console.log("\nClearing the Dynamic Position Report and Static Data Tables from the Database...")
	console.log("-------------------------------------------------")
	await db.deleteMessages()
	await unitTests();
	await integrationTests();
	db.killPool();
 }
 
 mainTest()
db.readRecentPositionsInTile(5529)

 //db.killPool();