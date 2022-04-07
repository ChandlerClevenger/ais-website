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
