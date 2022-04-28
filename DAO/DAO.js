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
        let newBatch = JSON.parse(batch)
        return newBatch.length;
      }
      else{
        if (typeof batch == 'string') {
          batch = JSON.parse(batch)
        }
        return new Promise((resolve, reject) => {
          let error;
          for(let message of batch) {
            this.insertAISMessage(message).catch(err => {error = err});
          }
          if (error) reject(error);
          resolve(batch.length);
        }).catch((e) => {
          console.log(e.toString())
          return -1
        })
      }
    } catch (e){
      //console.log(e.toString())
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
    try{
      if (this.stub) {
        convertTimestamp(timestamp)
        return 1;
      }
      return new Promise((resolve, reject) => {
        let connection = mysql.createConnection({
          ...dbconfigs,
          multipleStatements: true
        });
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
      }).catch((e) => {
        console.log(e.toString())
        return -1
      })
    }catch (e){
      //console.log(e.toString())
      return -1
    }
  }

  /**
 * Inserts a single ais message into the database.
 * @function insertAISMessage
 * @param {JSON} message - AIS messages to insert (either a position report or a static data report).
 * @returns {integer} 1 or 0 - 1 for successful insertion; 0 for failed insertion.
 */
  insertAISMessage(message) {
    try{
      if (this.stub) {
        JSON.parse(message)
        return 1;
      }
      return new Promise((resolve, reject) => {
        if (typeof message == 'string') {
          message = JSON.parse(message)
        }
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
              }
              connection.destroy();
            })
        }
        else {
          resolve(0)
        }
      }).catch((e) => {
        console.log(e.toString())
        return -1
      })
    }
    catch (e){
      //console.log(e.toString())
      return -1
    }
  }

  /**
 * Read all most recent ship positions. THis function takes in no parameters.
 * @function readMostRecentPositionAllShips
 * @returns {array} array of ship documents - Ship document of JSON form that contains MMSI, latitude, longitude, IMO, and Name.
 */
  readMostRecentPositionAllShips() {
    try{
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
      }).catch((e) => {
        console.log(e.toString())
        return -1
      })
    }
    catch (e) {
      //console.log(e.toString())
      return -1
    }
  }

  /**
 * Retrieves the most recent position of the ship that contains the provided mmsi.
 * @function readMostRecentPosition
 * @param {integer} MMSI - MMSI of the ship.
 * @returns {JSON} json position document - Position document of JSON form that contains the MMSI, Latitude, Longitude, and IMO.
 */
  readMostRecentPosition(MMSI) { 
    try{
      if (this.stub) {
        if(typeof MMSI != 'number'){
          return -1
        }
        return 1;
      }
      else {
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
                let result = results[0] ? {"MMSI": MMSI, "lat": results[0].Latitude, "long": results[0].Longitude, "IMO": results[0].IMO} : {}
                resolve(result)
              }
              connection.destroy();
            })
        }).catch((e) => {
          console.log(e.toString())
          return -1
        })
      }
    }
    catch (e){
      console.log(e.toString())
      return -1
    }
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

  readPermanentVesselData(MMSI, IMO, Name, CallSign) {
    try{
      if (this.stub) {
        if(typeof MMSI != 'number'){
          return -1
        }
        return 1
      }
      return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(dbconfigs);
        var query = "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + (IMO ? " AND IMO=" + IMO: "") + (Name ? " AND Name='" + Name + "'": "") + (CallSign ? "AND CallSign='" + CallSign + "'" : "");
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
      }).catch((e) => {
        console.log( e)
        return -1
      })
    }
    catch(e){
      console.log(e.toString())
      return -1
    }
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
      let query2 = "Select Timestamp,VESSEL.MMSI,Latitude,Longitude,IMO,Name,CoG FROM VESSEL, d_position_report WHERE VESSEL.MMSI=d_position_report.MMSI AND longitude>(Select ActualLongitudeW from map_view where Id="+ tileId + ") AND longitude <(Select ActualLongitudeE from map_view where Id=" + tileId + ") "
      + "AND Latitude>(Select ActualLatitudeS from map_view where Id=" + tileId + ") AND latitude<(Select ActualLatitudeN from map_view where Id=" + tileId + ") AND (Timestamp, Vessel.MMSI) IN (Select Max(Timestamp), MMSI FROM d_position_report GROUP BY MMSI);"
      
      connection.query(
        query2,
        function(error, results, fields) {
          if (error) {
            console.log("ERROR READING RECENT POSITIONS IN TILE")
            reject(error);
          }else{
            let array = [];
            for (let i = 0; i<results.length; i++){
              array.push({"MMSI":results[i].MMSI,"lat":results[i].Latitude,"long":results[i].Longitude, "IMO":results[i].IMO, "Name":results[i].Name, "CoG":results[i].CoG})
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
    try{
      if(typeof Name != 'string'){
        return -1
      }
      if (this.stub) {
        return 1;
      }
      else{
        return new Promise((resolve, reject) => {
          let connection = mysql.createConnection(dbconfigs);
          let query1= "SELECT Id, Name, Country, Latitude, Longitude, MapView1_Id, MapView2_Id, MapView3_Id FROM PORT where Name=" + connection.escape(Name) + (Country ? " AND Country=" + connection.escape(Country) : "")
          connection.query(
            query1,
            function (error, results, fields) {
              if (error) {
                console.log("ERROR READING PORTS MATCHING NAME/COUNTRY")
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
        }).catch((e) => {
          console.log(e.toString())
          return -1
        })
      }
    }
    catch(e){
      console.log(e.toString())
      return -1
    }
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
                      console.log("ERROR READING SHIPS IN SCALE 3 TILE")
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

    /**
 * Function solely used for testing. Purpose: Deletes all AIS messages from the database at the start of the integration testing.
 * @function readMostRecentPosition
 * @returns {integer} deletionAmount - Number of rows affected
 */
  deleteMessages() {
    return new Promise((resolve, reject) => {
      let connection = mysql.createConnection({...dbconfigs,  multipleStatements: true});
      var query = "DELETE FROM d_position_report; DELETE FROM d_static_data;"
      connection.query(
        query,
        function (error, results) {
          if (error) {
            console.log("ERROR DELETING ENTRIES FROM AIS MESSAGES")
            reject(error);
          } else {
            let totalRowsAffected = 0;
            for (let res of results) {
              totalRowsAffected += res.affectedRows;
            }
            resolve(totalRowsAffected);
          }
          connection.destroy();
        })
    }).catch((e) => {
      console.log(e.toString())
      return -1
    })
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