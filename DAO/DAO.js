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

//updated insertBatch function to use stubs for unit tests
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

  readMostRecentPositionAllShips() {
    return new Promise((resolve, reject) => {
      let connection = mysql.createConnection(dbconfigs);
      var query = "Select Max(Timestamp),VESSEL.MMSI,Latitude,Longitude,IMO,Name FROM VESSEL, d_position_report WHERE VESSEL.MMSI=d_position_report.MMSI GROUP BY(VESSEL.MMSI);"
      connection.query(
        query,
        function (error, results, fields) {
          if (error) {
            console.log("ERROR INSERTING POSITION REPORT")
            reject(error);
          }else{
            let array = [];
            for (let i = 0; i<results.length; i++){
              array.push({"MMSI":results[i].MMSI,"lat":results[i].Latitude,"long":results[i].Longitude, "IMO":results[i].IMO, "Name":results[i].Name})
            }
            resolve(array);
          }
          connection.destroy();
        })
    });
  }

  readMostRecentPosition(MMSI) { 
    return new Promise((resolve, reject) => {
      let connection = mysql.createConnection(dbconfigs);
      var query = "Select VESSEL.MMSI,Latitude,Longitude,IMO,Name FROM VESSEL, d_position_report WHERE VESSEL.MMSI=d_position_report.MMSI AND VESSEL.MMSI=" + MMSI + " order by Timestamp DESC limit 1";
      connection.query(
        query,
        function (error, results, fields) {
          if (error) {
            console.log("ERROR INSERTING POSITION REPORT")
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

  
  readPermanentVesselData(MMSI, IMO, Name, CallSign) { // need to fix optional parameters
    return new Promise((resolve, reject) => {
      let connection = mysql.createConnection(dbconfigs);
      var query=""
      if (MMSI.toString().length >0 && IMO == undefined && Name == undefined && CallSign == undefined){
        query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI;
      }
      else if (MMSI.toString().length >0 && IMO.toString().length >0 && Name == undefined && CallSign == undefined){
        query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND IMO=" + IMO;
      }
      else if (MMSI.toString().length >0 && IMO == undefined && Name.length >0 && CallSign == undefined){
        query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND Name='" + Name + "'";
      }
      else if (MMSI.toString().length >0 && IMO == undefined && Name == undefined && CallSign.toString().length>0){
        query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND CallSign=" + CallSign;;
      }
      else if (MMSI.toString().length >0 && IMO.toString().length >0 && Name.length >0 && CallSign == undefined){
        query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND IMO=" + IMO + " AND Name='" + Name + "'";
      }
      else if (MMSI.toString().length >0 && IMO.toString().length >0 && Name == undefined && CallSign.toString().length>0){
        query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND IMO=" + IMO + " AND CallSign=" + CallSign;
      }
      else if (MMSI.toString().length >0 && IMO == undefined && Name.length > 0 && CallSign.toString().length > 0){
        query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND Name='" + Name + "' AND CallSign=" + CallSign;
      }
      else if (MMSI.toString().length >0 && IMO.toString().length > 0 && Name.length > 0 && CallSign.toString().length> 0){
        query= "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + " AND IMO=" + IMO + " AND Name='" + Name + "' AND CallSign=" + CallSign;
      }
      connection.query(
        query,
        function (error, results, fields) {
          if (error) {
            console.log("ERROR INSERTING POSITION REPORT")
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

  //Read all most recent ship positions in the given tile
  // uses the permanent, non-dynamic tables
  readRecentPositionsInTile(tileId) {
    return new Promise((resolve, reject) => {
      let connection = mysql.createConnection(dbconfigs);
      let query = ""
      if (tileId.toString().length == 1) {
        query = "Select Max(Timestamp), ais_message.MMSI, Latitude, Longitude, Vessel_IMO, Name from vessel, ais_message, position_report where Id=position_report.AisMessage_Id AND Vessel_IMO=IMO AND MapView1_Id=" + tileId + " GROUP BY(Vessel_IMO);"
      }
      else if (tileId.toString().length == 4) {
        query = "Select Max(Timestamp), ais_message.MMSI, Latitude, Longitude, Vessel_IMO, Name from vessel, ais_message, position_report where Id=position_report.AisMessage_Id AND Vessel_IMO=IMO AND MapView2_Id=" + tileId + " GROUP BY(Vessel_IMO);"
      }
      else if (tileId.toString().length == 5) {
        query = "Select Max(Timestamp), ais_message.MMSI, Latitude, Longitude, Vessel_IMO, Name from vessel, ais_message, position_report where Id=position_report.AisMessage_Id AND Vessel_IMO=IMO AND MapView3_Id=" + tileId + " GROUP BY(Vessel_IMO);"
      }
      connection.query(
        query,
        function(error, results, fields) {
          if (error) {
            console.log("ERROR INSERTING POSITION REPORT")
            reject(error);
          }else{
            let array = [];
            for (let i = 0; i<results.length; i++){
              array.push({"MMSI":results[i].MMSI,"lat":results[i].Latitude,"long":results[i].Longitude, "IMO":results[i].Vessel_IMO, "Name":results[i].Name})
            }
            resolve(array);
          }
          connection.destroy();
        }
      )
    })
  }

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