let mysql = require("mysql");
//const parse = require("@mysql/xdevapi/lib/DevAPI/Util/URIParser");
const config = require("../config.js");
let dbconfigs = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.schema
};

module.exports = class DOA {
  getTest(echo) {
    return echo;
  }

  insertMesssageBatchOLD(batch){
    var array = JSON.parse(batch)
    for (let i= 0; i<array.length; i++){
      var newArray = JSON.stringify(array[i])
      this.insertAISMessage(newArray)
    }
    return array.length;
  }

  insertAISMessageOLD(messageDoc) {
    return new Promise((resolve, reject) => {
      const session = mysqlx.getSession(dbconfigs);
      session.then(session => {
        var max = "Select MAX(Id) FROM ais_message";
        return session.sql(max)
        .execute();
      })
      .then( session => {

        let v = session.fetchAll();
        resolve(v);
        let maxId = v[0][0]+1

        const session2 = mysqlx.getSession(dbconfigs);
        session2.then(session2 => {
          var parsedMessage = JSON.parse(messageDoc)
          var timestamp = parsedMessage.Timestamp
          var newTimeStamp = timestamp.replace(/Z/g, "");
          //console.log(newTimeStamp)
          let query = ""
          let query2 = ""
          let id1 = ""
          let id2 = ""
          let id3 = ""
          //console.log(parsedMessage.MsgType)
      
          if (parsedMessage.MsgType == 'position_report') {
            var coordinates = parsedMessage.Position.coordinates
            var latitude = coordinates[0]
            var longitude = coordinates[1]
            var mapView1 = "SELECT Id FROM aistestdata.map_view where Scale=1 AND LatitudeS<= " + latitude + " AND LatitudeN >= " + latitude + " AND LongitudeW <= " + longitude + " AND LongitudeE >= " + longitude;
            var mapView2 = "SELECT Id FROM aistestdata.map_view where Scale=2 AND LatitudeS<= " + latitude + " AND LatitudeN >= " + latitude + " AND LongitudeW <= " + longitude + " AND LongitudeE >= " + longitude;
            var mapView3 = "SELECT Id FROM aistestdata.map_view where Scale=3 AND LatitudeS<= " + latitude + " AND LatitudeN >= " + latitude + " AND LongitudeW <= " + longitude + " AND LongitudeE >= " + longitude;
            query = "INSERT INTO AIS_MESSAGE VALUES (" + maxId + ", '" + newTimeStamp + "', " + parsedMessage.MMSI + ", '" + parsedMessage.Class + "', NULL);"
            const session4 = mysqlx.getSession(dbconfigs);
            session4.then(session4 => {
              query2= "INSERT INTO POSITION_REPORT VALUES(" + maxId + ",'" + parsedMessage.Status + "', " + longitude + ", " + latitude + ", " + parsedMessage.RoT + ", " + parsedMessage.SoG + ", " + parsedMessage.CoG + ", " + parsedMessage.Heading + ", NULL, NULL, NUll, NULL);"
              //console.log("query2: " + query2)
              return session4.sql(query2)
              .execute()
            })
            .then(session4 => {
              let v = session4.fetchAll();
              resolve(v)
              //console.log(v)
              //console.log("done")
              const session5 = mysqlx.getSession(dbconfigs);
              session5.then(session5 => {
                return session5.sql(mapView1)
                .execute()
              })
              .then(session5 => {
                let v = session5.fetchAll();
                resolve(v)
                //console.log("done2")
                id1 = v[0][0]
                const session6 = mysqlx.getSession(dbconfigs);
                session6.then(session6 => {
                  return session6.sql("UPDATE POSITION_REPORT SET MapView1_Id=" + id1 + " where AISMessage_Id=" + maxId)
                  .execute()
                })
                .then(session6 => {
                  let v = session6.fetchAll();
                  resolve(v)
                  //console.log(v)
                  //console.log("done3")
                })
                .catch(err => {reject(err);})
              })
              .catch(err => {reject(err);})
              const session7 = mysqlx.getSession(dbconfigs);
              session7.then(session7 => {
                return session7.sql(mapView2)
                .execute()
              })
              .then(session7 => {
                let v = session7.fetchAll();
                resolve(v)
                id2 = v[0][0]
                const session8 = mysqlx.getSession(dbconfigs);
                session8.then(session8 => {
                  return session8.sql("UPDATE POSITION_REPORT SET MapView2_Id=" + id2 + " where AISMessage_Id=" + maxId)
                  .execute()
                })
                .then(session8 => {
                  let v = session8.fetchAll();
                  resolve(v)
                  //console.log(v)
                  //console.log("done4")
                })
                .catch(err => {reject(err);})
              })
              .catch(err => {reject(err);})
              const session9 = mysqlx.getSession(dbconfigs);
              session9.then(session9 => {
                return session9.sql(mapView3)
                .execute()
              })
              .then(session9 => {
                let v = session9.fetchAll();
                resolve(v)
                //console.log("Done5")
                id3 = v[0][0]
                const session10 = mysqlx.getSession(dbconfigs);
                session10.then(session10 => {
                  return session10.sql("UPDATE POSITION_REPORT SET MapView3_Id=" + id3 + " where AISMessage_Id=" + maxId)
                  .execute()
                })
                .then(session10 => {
                  let v = session10.fetchAll();
                  resolve(v)
                 // console.log(v)
                  //console.log("done6")
                })
                .catch(err => {reject(err);})
              })
              .catch(err => {reject(err);})
            })
            .catch(err => {reject(err);})
          }
          else if (parsedMessage.MsgType == 'static_data') {
            var eta = parsedMessage.ETA
            var newETA = eta.replace(/Z/g, "")
            query = "INSERT INTO AIS_MESSAGE VALUES (" + maxId + ", '" + newTimeStamp + "', " + parsedMessage.MMSI + ", '" + parsedMessage.Class + "', " + parsedMessage.IMO + ");" 
            const session3 = mysqlx.getSession(dbconfigs);
            session3.then(session3 => {
              if (parsedMessage.CargoType == undefined){
                query2="INSERT INTO STATIC_DATA VALUES(" + maxId + ", " + parsedMessage.IMO + ", '" + parsedMessage.CallSign + "', '" + parsedMessage.Name + "', '" + parsedMessage.VesselType +  "', NULL, " + parsedMessage.Length + ", " + parsedMessage.Breadth + ", " + parsedMessage.Draught + ", '" + parsedMessage.Destination + "', '" + newETA + "', NULL)"
              } else{
                query2="INSERT INTO STATIC_DATA VALUES(" + maxId + ", " + parsedMessage.IMO + ", '" + parsedMessage.CallSign + "', '" + parsedMessage.Name + "', '" + parsedMessage.VesselType +  "', '" + parsedMessage.CargoType + "', " + parsedMessage.Length + ", " + parsedMessage.Breadth + ", " + parsedMessage.Draught + ", '" + parsedMessage.Destination + "', '" + newETA + "', NULL)"
              }
              console.log(query2)
              return session3.sql(query2)
              .execute();
              
            })
            .then(session3 => {
              let s = session3.fetchAll();
              resolve(s)
              //console.log(s)
              //console.log()
              //console.log("done7")
            })
            .catch(err => {reject(err);})
          }
          return session2.sql(query)
          .execute();
        })
        .then(session2 => {
          let s = session2.fetchAll();
          resolve(s)
          //console.log(s);
          //console.log("done8")
        })
        .catch(err => {reject(err);})
      })
      .catch(err => {reject(err); })
    });
  }

  readMostRecentPosition(MMSI) { 
    return new Promise((resolve, reject) => {
      const session = mysqlx.getSession(dbconfigs);
      session.then(session => {
        var idQuery = "SELECT Id FROM AIS_MESSAGE WHERE AIS_MESSAGE.MMSI=" + MMSI + " order by Timestamp Desc Limit 1";
        return session.sql("SELECT Latitude, Longitude, Vessel_IMO FROM POSITION_REPORT, AIS_MESSAGE WHERE Id=(" + idQuery + ") AND AISMessage_Id=(" + idQuery + ")")	
        .execute();
      })
      .then( res => {

        let v = res.fetchAll();
        let result = {
          "MMSI": MMSI, "lat": v[0][0], "long": v[0][1], "IMO": v[0][2],
        }
        resolve(result);

        console.log(JSON.stringify(result));
        process.kill(process.pid, 'SIGTERM')
      })
      .catch(err => {reject(err); })
    });
  }

  readPermanentVesselData(MMSI, IMO, Name, CallSign) { // need to fix optional parameters
    
    return new Promise((resolve, reject) => {
      const session = mysqlx.getSession(dbconfigs);
      
      session.then(session => {
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
        return session.sql(query)
        .execute()
      })
      .then( res => {
        let result = res.fetchAll();
        let array = [];
        for (let i = 0; i<result.length; i++){
            array.push({"IMO":result[i][0],"Flag":result[i][1],"Name":result[i][2], "Built":result[i][3], "CallSign":result[i][4], "Length":result[i][5], 
            "Breadth":result[i][6], "Tonnage":result[i][7], "MMSI":result[i][8],"Type":result[i][9], "Status":result[i][10], "Owner":result[i][11]})
        }
        resolve(array);
        
        console.log(JSON.stringify(array));
        process.kill(process.pid, 'SIGTERM')
      })
      .catch(err => {reject(err); })
    });
  }

  readAllPortsMatchingName(Name, Country){
    return new Promise((resolve, reject) => {
      const session = mysqlx.getSession(dbconfigs);
      session.then(session => {
        var query=""
        if (Name.length >0 && Country == undefined){
          query= "SELECT Id, Name, Country, Latitude, Longitude, MapView1_Id, MapView2_Id, MapView3_Id FROM PORT where Name='" + Name + "'";
        }
        else if (Name.length >0 && Country.length >0){
          query= "SELECT Id, Name, Country, Latitude, Longitude, MapView1_Id, MapView2_Id, MapView3_Id FROM PORT where Name='" + Name + "' AND Country='" + Country + "'";
        }
        
        return session.sql(query)	
        .execute();
      })
      .then( res => {
        let result = res.fetchAll();
        let array = [];
        for (let i = 0; i<result.length; i++){
            array.push({"Id":result[i][0],"Name":result[i][1],"Country":result[i][2], "Latitude":result[i][3], "Longitude":result[i][4], "MapView1_Id":result[i][5], 
            "MapView2_Id":result[i][6], "MapView3_Id":result[i][7]})
        }
        resolve(array);

        console.log(JSON.stringify(array))
        process.kill(process.pid, 'SIGTERM')
      })
      .catch(err => {reject(err); })
    });
  }

  insertAISMessageBatch(batch) {
    return new Promise((resolve, reject) => {
      let error;
      for(let message of batch) {
        this.insertAISMessage(message).catch(err => {error = err});
      }
      if (error) reject(error);
      resolve(batch.length);
    })
  }

  insertAISMessage(message) {
    return new Promise((resolve, reject) => {
      let connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        database : 'aistestdata'
      });
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
              resolve(results);
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
              resolve(results);
            }
            connection.destroy();
          })
      }
    })
  }

  getVessels(tileId, scale, timestamp) {
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
  return timestamp.slice(0, 19).replace('T', ' ');
}
