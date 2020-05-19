var path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import mysql from "mysql";
// import that let's us access secret SSL information needed to make secure connection
import { SSLAccessor } from "../ssl.js";
import IUser from "../interfaces/IUser.js";


// Default max amount of connections is 10 which is enough for us
var pool = createConnectionPool();

function createConnectionPool() {
  let host = process.env.DATABASE_IP;
  let username = process.env.DATABASE_USER_USERNAME;
  let password = process.env.DATABASE_USER_PASSWORD;
  let schema = process.env.DATABASE_SCHEMA;
  let port = 3306

  return mysql.createPool({
    host,
    port,
    user: username,
    password,
    database: schema,
    ssl: getSSLConfiguration(),
  });
}

function getSSLConfiguration() {
  if (!SSLAccessor) {
    throw new Error("Cannot access SSL information. Please provide SSL CA, CERT and KEY.");
  }
  return {
    ca: SSLAccessor.get_SSL_CA(),
    key: SSLAccessor.get_SSL_KEY(),
    cert: SSLAccessor.get_SSL_CERT()
  }
}

function testConnection() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log("Failed to test connection using pool");
      throw err;
    }
    try {
      connection.query('SELECT * FROM test', function (error, results, fields) {
        if (error) throw error;
        console.log('The data is: ', results[0].data);
      });
    } catch (error) {
      throw error;
    } finally {
      console.log("Releasing connection back to the pool");
      connection.release();
    }
  });
}

function getUserByEmail(email: string, callback: Function) {
  // let user: IUser = {username: "", password: "", email: null, isOAuth: false, refreshToken: null};
  pool.getConnection((err, connection) => {
    if (err) {
      console.log("Failed to get connection from pool");
      //throw err;
    }
    try {
      connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, result) {
        if (error) {
          console.log("An error occurred when trying to fetch user");
          // throw error;
        }
        const data = result[0];
        //I couldn't find a better way to destructure this data
        const {username, password, email, isOAuth, refreshToken} = data;
        const user: IUser = {
          username,
          password,
          email,
          isOAuth,
          refreshToken
        }
        return callback(user);
      });
    } catch (error) {
      console.log("Failed to get user by email");
      // throw error;
    } finally {
      console.log("Releasing connection back to the pool");
      connection.release();
    }
  });
}

let johnny = {}
getUserByEmail("johnny@ringo.com", (data: IUser) => {
  johnny = data;
  console.log("Data:",data);
});

console.log("Johnny:\n", johnny);

setTimeout(() => {
  console.log("Ending pool");
  pool.end();
}, 6000);