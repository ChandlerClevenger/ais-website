let mysqlx = require("@mysql/xdevapi");
let dbconfigs = {
  host: "localhost",
  port: "3306",
  user: "root",
  password: "",
  schema: "aistestdata",
};

module.exports = class DOA {
  getVessels(tileId) {
    const session = mysqlx.getSession(dbconfigs);
    // we can query the tileId on map_view
    session
      .then((session) => {
        return session
          .sql("Select * FROM map_view WHERE id=:id")
          .bind("id", tileId)
          .execute();
      })
      .then((tile) => {
        console.log(tile);
      });
  }
};
