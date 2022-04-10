let mysqlx = require("@mysql/xdevapi");
const config = require("../config.js");
let dbconfigs = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: "",
  schema: config.db.schema,
};

module.exports = class DOA {
  getTest(echo) {
    return echo;
  }

  
  readMostRecentPosition(MMSI) { 
    return new Promise((resolve, reject) => {
      const session = mysqlx.getSession(dbconfigs);
      session.then(session => {
        var idQuery = "SELECT Id FROM ais_message WHERE ais_message.MMSI=" + MMSI + " order by Timestamp Desc Limit 1";
        return session.sql("SELECT Latitude, Longitude, Vessel_IMO FROM position_report, ais_message WHERE Id=(" + idQuery + ") AND AISMessage_Id=(" + idQuery + ")")	
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
          query= "SELECT Id, Name, Country, Latitude, Longitude, MapView1_Id, MapView2_Id, MapView3_Id FROM Port where Name='" + Name + "'";
        }
        else if (Name.length >0 && Country.length >0){
          query= "SELECT Id, Name, Country, Latitude, Longitude, MapView1_Id, MapView2_Id, MapView3_Id FROM Port where Name='" + Name + "' AND Country='" + Country + "'";
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
