var path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import mysql from "mysql";
import { SSLAccessor } from "../ssl.js";

const host = process.env.DATABASE_IP;
const username = process.env.DATABASE_USER_USERNAME;
const password = process.env.DATABASE_USER_PASSWORD;
const schema = process.env.DATABASE_SCHEMA;
const port = 3306

// var connection = mysql.createConnection({
//   host: host,
//   user: username,
//   password: password,
//   database: schema,
//   ssl: SSLAccessor.get_SSL_CA()
// });

var connection = mysql.createConnection({
  host,
  port,
  user: username,
  password,
  database: schema,
  ssl: getSSLConfiguration()
});

function getSSLConfiguration() {
  if (!SSLAccessor) {
    throw new Error("Cannot access SSL information. Please provide SSL CA, CERT and KEY.");
  }
  return {
    // This is an important step into making the keys work. When loaded into
    // the environment the \n characters will not be actual new-line characters.
    // so the .replace() calls fixes that.
    ca: SSLAccessor.get_SSL_CA(),
    key: SSLAccessor.get_SSL_KEY(),
    cert: SSLAccessor.get_SSL_CERT()
  }
}

function testConnection() {
  connection.connect();
  connection.query('SELECT * FROM test', function (error, results, fields) {
    if (error) throw error;
    console.log('The data is: ', results[0].data);
  });

  connection.end();
}

testConnection();