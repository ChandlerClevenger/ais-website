/**
 * @file Milestone 4 - Option C. 
 * This DAO manages AIS messages coming in and out of the mysql database, and also reads information about certain vessels. 
 * All functions of priority 1 and 2 are completed fully. 
 * This file uses functions through nodejs and connections to a mysql database. 
 */

let mysql = require("mysql");
const config = require("../config.js");
let dbconfigs = {
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.schema
};
module.exports = class DOA {
  getTest(echo) {
    return echo;
  }
  stub = false;

 /**
 * Inserts a batch of ais messages into the database (position reports and static data).
 * @function insertAISMessageBatch
 * @param {array} batch - Array of AIS messages to insert.
 * @returns {integer} insertionAmount - Number of inserted ais messages.
 */
  insertAISMessageBatch(batch) {
    try {
      if (this.stub) {
        return batch.length;
      }
      else{
        return new Promise((resolve, reject) => {
          let error;
          for(let message of batch) {
            this.insertAISMessage(message).catch(err => {error = err});
          }
          if (error) reject(error);
          resolve(batch.length);
        })
      }
    } catch (e){
      console.log("Error:" + e)
		  return -1
    }
  }

  /**
 * Deletes all AIS messages whose timestamp is more than 5 minutes older than current time.
 * @function cleanupMessages
 * @param {datetime} timestamp - The current time.
 * @returns {integer} deletionAmount - Number of deleted ais messages.
 */
  cleanupMessages(timestamp) {
    return new Promise((resolve, reject) => {
      let connection = mysql.createConnection({
        ...dbconfigs,
        multipleStatements: true
      });
      
      let now = new Date(timestamp);
      connection.query(
        `
        DELETE FROM d_position_report 
        WHERE Timestamp NOT BETWEEN ? AND ?;
        DELETE FROM d_static_data 
        WHERE Timestamp NOT BETWEEN ? AND ?;
        `,
        [
          convertTimestamp(subMinutes(now, 5)),
          convertTimestamp(now),
          convertTimestamp(subMinutes(now, 5)),
          convertTimestamp(now)
        ]
        ,
        function (error, results, fields) {
          if (error) reject(error);
          let totalRowsAffected = 0;
          for (let res of results) {
            totalRowsAffected += res.affectedRows;
          }
          resolve(totalRowsAffected);
          connection.destroy();
        })
    })
  }

  /**
 * Inserts a single ais message into the database.
 * @function insertAISMessage
 * @param {JSON} message - AIS messages to insert (either a position report or a static data report).
 * @returns {integer} 1 or 0 - 1 for successful insertion; 0 for failed insertion.
 */
  insertAISMessage(message) {
    return new Promise((resolve, reject) => {
      let connection = mysql.createConnection(dbconfigs);
      if (message.MsgType == "position_report") {
        let position = message.Position;
        connection.query(
          `
          INSERT INTO d_position_report
          SET ?
          `,
          [
            {
              Timestamp : convertTimestamp(message.Timestamp), 
                Class : message.Class,
                MMSI : message.MMSI, 
                Longitude : position.coordinates[1], 
                Latitude : position.coordinates[0], 
                Status : message.Status ? message.Status : null, 
                RoT : message.RoT ? message.RoT : null, 
                SoG : message.SoG ? message.SoG : null, 
                CoG :message.CoG ? message.CoG : null, 
                Heading : message.Heading ? message.Heading : null
            }
          ]
          ,
          function (error, results, fields) {
            if (error) {
              console.log("ERROR INSERTING POSITION REPORT")
              reject(error);
            } else {
              if (results.affectedRows == 1) {
                resolve(1)
              }else {
                resolve(0)
              }

              //resolve(results);
            }
            connection.destroy();
          })
      } else if (message.MsgType == "static_data") {
        connection.query(
          `
          INSERT INTO d_static_data
          SET ?
          `,
          [
            {
            Timestamp : convertTimestamp(message.Timestamp),
            MMSI : message.MMSI ? message.MMSI : null, 
            IMO :(message.IMO && message.IMO != "Unknown") ? message.IMO : null, 
            Name : message.Name ? message.Name : null, 
            Class : message.Class ? message.Class : null, 
            CallSign : message.CallSign ? message.CallSign : null, 
            VesselType : message.VesselType ? message.VesselType : null, 
            CargoType : message.CargoType ? message.CargoType : null,
            Destination : message.Destination ? message.Destination : null,
            ETA : message.ETA ? convertTimestamp(message.ETA) : null,
            Length : message.Length ? message.Length : null,
            Breadth : message.Breadth ? message.Breadth : null
            }
          ]
          ,
          function (error, results, fields) {
            if (error) {
              console.log("ERROR INSERTING STATIC DATA")
              console.log(error)
              reject(error);
            } else {
              if (results.affectedRows == 1) {
                resolve(1)
              } else{
                resolve (0)
              }
              //resolve(results);
            }
            connection.destroy();
          })
      }
      else {
        resolve(0)
      }
    })
  }
  /**
 * Read all most recent ship positions. THis function takes in no parameters.
 * @function readMostRecentPositionAllShips
 * @returns {array} array of ship documents - Ship document of JSON form that contains MMSI, latitude, longitude, IMO, and Name.
 */
  readMostRecentPositionAllShips() {
    return new Promise((resolve, reject) => {
      let connection = mysql.createConnection(dbconfigs);
      var query = "Select Timestamp,VESSEL.MMSI,Latitude,Longitude,IMO,Name,CoG FROM VESSEL, d_position_report WHERE VESSEL.MMSI=d_position_report.MMSI AND (Timestamp, Vessel.MMSI) IN (Select Max(Timestamp), MMSI FROM d_position_report GROUP BY MMSI)"
      
      connection.query(
        query,
        function (error, results, fields) {
          if (error) {
            console.log("ERROR READING POSITIONS")
            reject(error);
          }else{
            let array = [];
            for (let i = 0; i<results.length; i++){
              array.push({"MMSI":results[i].MMSI,"lat":results[i].Latitude,"long":results[i].Longitude, "IMO":results[i].IMO, "Name":results[i].Name, "CoG": results[i].CoG})
            }
            resolve(array);
          }
          connection.destroy();
        })
    });
  }

  /**
 * Retrieves the most recent position of the ship that contains the provided mmsi.
 * @function readMostRecentPosition
 * @param {integer} MMSI - MMSI of the ship.
 * @returns {JSON} json position document - Position document of JSON form that contains the MMSI, Latitude, Longitude, and IMO.
 */
  readMostRecentPosition(MMSI) { 
    return new Promise((resolve, reject) => {
      let connection = mysql.createConnection(dbconfigs);
      var query = "Select VESSEL.MMSI,Latitude,Longitude,IMO,Name FROM VESSEL, d_position_report WHERE VESSEL.MMSI=d_position_report.MMSI AND VESSEL.MMSI=" + MMSI + " order by Timestamp DESC limit 1";
      connection.query(
        query,
        function (error, results, fields) {
          if (error) {
            console.log("ERROR READING POSITION")
            reject(error);
          }else{
            
            let result = {"MMSI": MMSI, "lat": results[0].Latitude, "long": results[0].Longitude, "IMO": results[0].IMO}
            //resolve(JSON.stringify(result));
            resolve(result)
          }
          connection.destroy();
        })
    });
  }
 /**
 * Reads the information of the vessel that matches the provided parameters. 
 * @function readPermanentVesselData
 * @param {integer} MMSI - MMSI of the vessel.
 * @param {integer} IMO (optional)- IMO of the vessel.
 * @param {string} Name (optional)- Name of the vessel.
 * @param {integer} CallSign (optional)- Call sign of the vessel.
 * @returns {JSON} json vessel document - Vessel document of JSON form that contains the vessel information from the database.
 */
  readPermanentVesselData(MMSI, IMO=0, Name=0, CallSign=0) { // need to fix optional parameters
    return new Promise((resolve, reject) => {
      var query=""
      let connection = mysql.createConnection(dbconfigs);
      if ((arguments.length) ==1){
        query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI;
      }
      else if (arguments.length == 2) {
        if (typeof arguments[1] === 'string') {
          Name = arguments[1]
          query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND Name='" + Name + "'";
        }
        else if (MMSI.toString().length >0 && IMO.toString().length >0 && Name == 0 && CallSign == 0){
          query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND IMO=" + IMO;
        }
        else if (MMSI.toString().length >0 && IMO == 0 && Name == 0 && CallSign.toString().length>0){
          query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND CallSign=" + CallSign;;
        }
      }
      else {
        if (MMSI.toString().length >0 && IMO.toString().length >0 && Name.length >0 && CallSign == 0){
          query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND IMO=" + IMO + " AND Name='" + Name + "'";
        }
        else if (MMSI.toString().length >0 && IMO.toString().length >0 && Name == 0 && CallSign.toString().length>0){
          query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND IMO=" + IMO + " AND CallSign=" + CallSign;
        }
        else if (MMSI.toString().length >0 && IMO == 0 && Name.length > 0 && CallSign.toString().length > 0){
          query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND Name='" + Name + "' AND CallSign=" + CallSign;
        }
        else if (MMSI.toString().length >0 && IMO.toString().length > 0 && Name.length > 0 && CallSign.toString().length> 0){
          query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND IMO=" + IMO + " AND Name='" + Name + "' AND CallSign=" + CallSign;
        }
      }
      connection.query(
        query,
        function (error, results, fields) {
          if (error) {
            console.log("ERROR READING VESSEL INFORMATION")
            reject(error);
          }else{
            let array = [];
            for (let i = 0; i<results.length; i++){
              array.push({"IMO":results[i].IMO,"Flag":results[i].Flag,"Name":results[i].Name, "Built":results[i].Built, "CallSign":results[i].CallSign, "Length":results[i].Length, "Breadth":results[i].Breadth, "Tonnage":results[i].Tonnage, "MMSI":results[i].MMSI,"Type":results[i].Type, "Status":results[i].Status, "Owner":results[i].Owner})
            }
            resolve(array);
          }
          connection.destroy();
        }
      )
    });
  }
/**
 * Reads the most recent position of every ship that is within the tile that matches the provided tile Id.
 * @function readRecentPositionsInTile
 * @param {integer} tiledId - Id of a map view tile.
 * @returns {array} array of ship odocuments - Array of ship documents (json form) that each contain MMSI, Latitude, Longitude, IMO, Name.
 */
  readRecentPositionsInTile(tileId) {
    return new Promise((resolve, reject) => {
      //let connection = mysql.createConnection(dbconfigs);
      let connection = mysql.createConnection({
        ...dbconfigs,
        multipleStatements: true
      });
      let query2 = "Select Timestamp,VESSEL.MMSI,Latitude,Longitude,IMO,Name,CoG FROM VESSEL, d_position_report WHERE VESSEL.MMSI=d_position_report.MMSI AND longitude>(Select LongitudeW from map_view where Id="+ tileId + ") AND longitude <(Select LongitudeE from map_view where Id=" + tileId + ") "
      + "AND Latitude>(Select LatitudeS from map_view where Id=" + tileId + ") AND latitude<(Select LatitudeN from map_view where Id=" + tileId + ") AND (Timestamp, Vessel.MMSI) IN (Select Max(Timestamp), MMSI FROM d_position_report GROUP BY MMSI);"
      
      connection.query(
        query2,
        function(error, results, fields) {
          if (error) {
            console.log("ERROR INSERTING POSITION REPORT")
            reject(error);
          }else{
            let array = [];
            for (let i = 0; i<results.length; i++){
              array.push({"MMSI":results[i].MMSI,"lat":results[i].Latitude,"long":results[i].Longitude, "IMO":results[i].IMO, "Name":results[i].Name})
            }
            resolve(array)
          }
          connection.destroy();
        }
      )
    })
  }
  /**
 * Reads the information of all ports that have the provided name and the optional country parameter.
 * @function readAllPortsMatchingName
 * @param {string} Name- Name of the Port.
 * @param {string} Country (optional)- Country that the port is in.
 * @returns {array} array of port documents - Array of port documents (json form) that each contain the id, name, country, latitude, longitude and containing map views (scale 1, 2, and 3) of the port.
 */
  readAllPortsMatchingName(Name, Country){
    return new Promise((resolve, reject) => {
      let connection = mysql.createConnection(dbconfigs);
      if (Name.length >0 && Country == undefined){
        let query1= "SELECT Id, Name, Country, Latitude, Longitude, MapView1_Id, MapView2_Id, MapView3_Id FROM PORT where Name=" + connection.escape(Name)
        connection.query(
          query1,
          function (error, results, fields) {
            if (error) {
              console.log("ERROR INSERTING POSITION REPORT")
              reject(error);
            } else {
              let array = [];
              for (let i = 0; i<results.length; i++){
                array.push({"Id":results[i].Id,"Name":results[i].Name,"Country":results[i].Country, "Latitude":results[i].Latitude, "Longitude":results[i].Longitude, "MapView1_Id":results[i].MapView1_Id, "MapView2_Id":results[i].MapView2_Id, "MapView3_Id":results[i].MapView3_Id})
              }
              resolve(array);
            }
            connection.destroy();
          })
        }
        else if (Name.length >0 && Country.length >0){
          let query1 =  "SELECT Id, Name, Country, Latitude, Longitude, MapView1_Id, MapView2_Id, MapView3_Id FROM PORT where Name=" + connection.escape(Name) + " AND Country=" + connection.escape(Country)
          connection.query(
            query1,
            function (error, results, fields) {
              if (error) {
                console.log("ERROR INSERTING POSITION REPORT")
                reject(error);
              } else {
                let array = [];
                for (let i = 0; i<results.length; i++){
                  array.push({"Id":results[i].Id,"Name":results[i].Name,"Country":results[i].Country, "Latitude":results[i].Latitude, "Longitude":results[i].Longitude, "MapView1_Id":results[i].MapView1_Id, "MapView2_Id":results[i].MapView2_Id, "MapView3_Id":results[i].MapView3_Id})
                }
                resolve(array);
              }
              connection.destroy();
            })
        }
    })
  }

  /**
 * Reads the most recent position of all ships that are in the tile of scale 3 that contains the provided port name and country.
 * @function readAllShipPositionsInScale3ContainingPort
 * @param {string} portName - Name of the Port.
 * @param {string} country - Country that the port is in.
 * @returns {array} array of port documents - If there is more than one port with that matched the provided port name and country, the function returns an array of port documents (json form) that each contain the id, name, country, latitude, longitude and containing map views (scale 1, 2, and 3) of the port.
 * @returns {array} array of position documents - If there is a unique port that matches the provided port name and country, the function return an a array of position documents of JSON form that each contain the MMSI, Latitude, Longitude, and IMO.
 */
  readAllShipPositionsInScale3ContainingPort(portName, country) {
    return new Promise((resolve, reject) => {
      let connection = mysql.createConnection(dbconfigs);
      
        let query1= "SELECT * FROM aistestdata.port where Name='" + portName + "' AND Country='" + country + "'";
        connection.query(
          query1,
          function (error, results, fields) {
            if (error) {
              console.log("ERROR INSERTING POSITION REPORT")
              reject(error);
            } else {
              let portCount = results.length;
              
              if (portCount == 1) {
                
                let connection2 = mysql.createConnection(dbconfigs);
                let tileId = results[0].MapView3_Id
                let query2 = "Select Timestamp,VESSEL.MMSI,Latitude,Longitude,IMO FROM VESSEL, d_position_report WHERE VESSEL.MMSI=d_position_report.MMSI AND longitude>(Select LongitudeW from map_view where Id="+ tileId + ") AND longitude<(Select LongitudeE from map_view where Id=" + tileId + ") "
                + "AND Latitude>(Select LatitudeS from map_view where Id=" + tileId + ") AND latitude<(Select LatitudeN from map_view where Id=" + tileId + ") AND (Timestamp, Vessel.MMSI) IN (Select Max(Timestamp), MMSI FROM d_position_report GROUP BY MMSI);"
                connection2.query(
                  query2,
                  function (error, results, fields) {
                    if (error) {
                      console.log("ERROR INSERTING POSITION REPORT")
                      reject(error);
                    } else {
                      let array = [];
                      for (let i = 0; i<results.length; i++){
                        array.push({"MMSI":results[i].MMSI,"lat":results[i].Latitude,"long":results[i].Longitude, "IMO":results[i].IMO})
                      }
                      resolve(array)
                    }
                    connection2.destroy();
                  }
                )
              }
              else if (portCount >1){
                
                let array = [];
                for (let i = 0; i<portCount; i++){
                  array.push({"Id":results[i].Id,"Name":results[i].Name,"Country":results[i].Country, "Latitude":results[i].Latitude, "Longitude":results[i].Longitude, "MapView1_Id":results[i].MapView1_Id, "MapView2_Id":results[i].MapView2_Id, "MapView3_Id":results[i].MapView3_Id})
                }
                console.log(array)
                resolve(array);
              }
              //console.log(results.length)
              
            }
            connection.destroy();
          })
        
    })
  }

  getVessels(tileId, scale, timestamp) { // good chance this gonna be deleted
    return new Promise((resolve, reject) => {
      const session = mysqlx.getSession(dbconfigs);
      // we can query the tileId on map_view
      session
        .then((session) => {
          return session
            .sql(
              `
              SELECT *
              FROM ais_message, position_report
              WHERE AISMessage_Id = Id
              AND Timestamp = ?
              AND MapView` +
                scale +
                `_Id = ?
              `
            )
            .bind(timestamp)
            .bind(tileId)
            .execute();
        })
        .then((vessels) => {
          resolve(vessels.fetchAll());
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
};

function convertTimestamp(timestamp) {
  if (timestamp instanceof Date) { 
    timestamp = timestamp.toISOString() 
  }
  return timestamp.slice(0, 19).replace('T', ' ');
}

function subMinutes(date, minutes) {
  return new Date(date.getTime() - minutes * 60000);
}