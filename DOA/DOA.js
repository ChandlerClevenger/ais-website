let mysqlx = require("@mysql/xdevapi");
let dbconfigs = {
  host: "localhost",
  port: 33060,
  user: "root",
  password: "",
  schema: "aistestdata",
};

module.exports = class DOA {
  getTest(echo) {
    return echo;
  }
  getVessels(tileId) {
    return new Promise((resolve, reject) => {
      let results;
      const session = mysqlx.getSession(dbconfigs);
      // we can query the tileId on map_view
      session
        .then((session) => {
          let map_view = session.getSchema().getTable("map_view");
          return map_view.select().where("id=:i").bind("i", tileId).execute();
        })
        // then we could find all vessels by the tiles in position_report
        .then((res) => {
          results = JSON.stringify(res.fetchAll());
          resolve(results);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
};
