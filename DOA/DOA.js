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
      let scale;
      const session = mysqlx.getSession(dbconfigs);
      // we can query the tileId on map_view
      session
        .then((session) => {
          let map_view = session.getSchema().getTable("map_view");
          return map_view
            .select(["scale"])
            .where("id=:i")
            .bind("i", tileId)
            .execute();
        })
        // then we could find all vessels by the tiles in position_report
        .then((tile) => {
          scale = tile.fetchAll()[0][0];
          session
            .then((session) => {
              let position_report = session
                .getSchema()
                .getTable("position_report");
              return position_report
                .select()
                .where("MapView" + scale + "_Id =:id")
                .limit(10000)
                .bind("id", tileId)
                .execute();
            })
            .then((vessels) => {
              console.log("resolving");
              resolve(vessels.fetchAll());
              console.log("After resolve");
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
};
