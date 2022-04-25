const DAO = require("./DAO/DAO.js");
let db = new DAO();

assert.equal("hello?", db.getTest("hello?"))