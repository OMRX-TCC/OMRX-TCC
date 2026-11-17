const mysql = require("mysql2/promise");
const { DATABASE } = require("../config");

const database = mysql.createPool({
  host: DATABASE.host,
  user: DATABASE.user,
  password: DATABASE.password,
  database: DATABASE.name,
});

module.exports = database;
