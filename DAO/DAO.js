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

  insertAISMessageBatch(batch) {
    try {
      if (this.stub) {
        if(typeof batch == 'object'){
          return batch.length;
        }
        else{
          return -1
        }
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
    try {
      if (this.stub) {
        return typeof timestamp;
      }
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
    } catch (e){
      console.log("Error:" + e)
		  return -1
    }
  }

  insertAISMessage(message) {
    try{
      if (this.stub) {
        return message.constructor;
      }
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
      })
    }
    catch (e){
        console.log("Error:" + e)
        return -1
    }
  }

  readMostRecentPositionAllShips() {
    try{
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
    catch (e){
      console.log("Error:" + e)
		  return -1
    }
  }

  readMostRecentPosition(MMSI) { 
    try{
      if (this.stub) {
        return typeof MMSI;
      }
      else{
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
    }
    catch (e){
      console.log("Error:" + e)
		  return -1
    }
  }


  readPermanentVesselData(MMSI, IMO, Name, CallSign) {
    try{
      if (this.stub) {
        return [typeof MMSI, typeof IMO, typeof Name, typeof CallSign];
      }
      return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(dbconfigs);
        var query = "SELECT * FROM VESSEL WHERE MMSI=" + MMSI + (IMO ? " AND IMO=" + IMO: "") + (Name ? " AND Name='" + Name : "") + (CallSign ? "' AND CallSign=" + CallSign : "");
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
    catch(e){
      console.log("Error:" + e)
		  return -1
    }
  }

  readAllPortsMatchingName(Name, Country){
    try{
      if (this.stub) {
        return [typeof Name, typeof Country];
      }
      else{
        return new Promise((resolve, reject) => {
          let connection = mysql.createConnection(dbconfigs);
          let query1= "SELECT Id, Name, Country, Latitude, Longitude, MapView1_Id, MapView2_Id, MapView3_Id FROM PORT where Name=" + connection.escape(Name) + (Country ? " AND Country=" + connection.escape(Country) : "")
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
        })
      }
    }
    catch(e){
      console.log("Error:" + e)
		  return -1
    }
  }

  getVessels(tileId, scale, timestamp) { // good chance this gonna be deleted
    try{
    return new Promise((resolve, reject) => {
      const session = mysqlx.getSession(dbconfigs);
      // we can query the tileId on map_view
      session
        x.then((session) => {
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
  catch(e){
      console.log("Error:" + e)
		  return -1
    }
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