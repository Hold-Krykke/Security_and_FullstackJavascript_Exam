var path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import mysql from "mysql";
// import that let's us access secret SSL information needed to make secure connection
import { SSLAccessor } from "../ssl.js";
import IUser from "../interfaces/IUser.js";

const host = process.env.DATABASE_IP;
const username = process.env.DATABASE_USER_USERNAME;
const password = process.env.DATABASE_USER_PASSWORD;
const schema = process.env.DATABASE_SCHEMA;
const port = 3306

export default class UserDataAccessorObject {

  private _pool: mysql.Pool;

  constructor() {
    this._pool = this._createConnectionPool();
  }

  // /**
  //  * Used to create new connection pool. It is NOT necessarry to call this method when instantiating class.
  //  * > Returns true if pool was created or false if it failed to create a pool.
  //  */
  // createConnectionPool(): Promise<boolean> {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       this._pool = this._createConnectionPool()
  //       resolve(true);
  //     } catch (err) {
  //       console.log(err);
  //       reject(false);
  //     }
  //   })
  // }

  private _createConnectionPool(): mysql.Pool {
    return mysql.createPool({
      host,
      port,
      user: username,
      password,
      database: schema,
      ssl: this._getSSLConfiguration(),
    });
  }

  private _getSSLConfiguration() {
    if (!SSLAccessor) {
      throw new Error("Cannot access SSL information. Please provide SSL CA, CERT and KEY.");
    }
    return {
      ca: SSLAccessor.get_SSL_CA(),
      key: SSLAccessor.get_SSL_KEY(),
      cert: SSLAccessor.get_SSL_CERT()
    }
  }

  /**
   * Used to terminate the connection pool within instance of class.
   */
  terminateConnectionPool() {
    this._pool.end();
  }

  /**
   * Used to get a user from database based on given email.
   * @param email Email address of the user
   */
  getUserByEmail(username: string): Promise<IUser> {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((err, connection) => {
        if (err) {
          console.log("Failed to get connection from pool");
          reject(err);
        }
        else {
          try {
            connection.query('SELECT * FROM users WHERE username = ?', [username], function (error, result) {
              if (error) {
                console.log("An error occurred when trying to fetch user");
                reject(error);
              }
              const data = result[0];
              //I couldn't find a better way to destructure this data
              const { username, password, email, isOAuth, refreshToken } = data;
              const user: IUser = {
                username,
                password,
                email,
                isOAuth,
                refreshToken
              }
              resolve(user);
            });
          } catch (error) {
            console.log("Failed to get user by email");
            reject(error);
          } finally {
            //console.log("Releasing connection back to the pool");
            connection.release();
          }
        }
      });
    })
  }

  /**
   * Used to create user in database. 
   * Will return promise with success message if user was persisted.
   * Will return rejected promise with specific message if a duplicate error occurs.
   * username and email (if provided) must be unique
   * @param user User contain at least username, password (hashed) and isOAuth
   */
  addUser(user: IUser): Promise<any> {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((err, connection) => {
        if (err) {
          console.log("Failed to get connection from pool");
          reject(err);
        }
        else {
          try {
            connection.query('INSERT INTO `exam`.`users` (`username`, `password`, `email`, `isOAuth`, `refreshToken`) VALUES ( ?, ?, ?, ?, ?);',
            [user.username, user.password, user.email, user.isOAuth, user.refreshToken], function(error){
              if (error) {
                console.log("An error occurred when trying to insert user in database");
                if (error.message.includes("ER_DUP_ENTRY: Duplicate entry")) {
                  reject({"message": "Username or email already exists"});
                }
                reject(error);
              }
              resolve({"message": `User ${user.username} was succesfully created`});
            })
          } catch (err) {
            console.log("Failed to create user");
            reject(err);
          } finally {
            connection.release();
          }
        }
      });
    })
  }

  /**
   * Used to update the refresh token of a user.
   * Returns promise with success message if token was updated
   * @param username username of user
   * @param token new refresh token
   */
  updateUserRefreshToken(username: string, token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((err, connection) => {
        if (err) {
          console.log("Failed to get connection from pool");
          reject(err);
        }
        else {
          try {
            connection.query('UPDATE `exam`.`users` SET `refreshToken` = ? WHERE (`username` = ?);',
            [token, username], function(error){
              if (error) {
                console.log("An error occurred when trying to update user refresh token");
                reject(error);
              }
              resolve({"message": `User ${username}'s refresh token was succesfully updated`});
            })
          } catch (err) {
            console.log("Failed to update token");
            reject(err);
          } finally {
            connection.release();
          }
        }
      });
    })
  }

}

const dao: UserDataAccessorObject = new UserDataAccessorObject();
// async function getUser() {
//   const user: IUser = await dao.getUserByEmail("Johnny");
//   console.log(user);
// }
// getUser();

// const newUser: IUser = {username: "ass", password: "xyzhash", isOAuth: false, email: "bitch@mail.com", refreshToken: null};

// async function addUser(newUser: IUser){
//   let succes = await dao.addUser(newUser);
//   console.log(succes);
// }
// addUser(newUser);

async function updateUserRefreshToken(username: string, token: string){
  let succes = await dao.updateUserRefreshToken(username, token);
  console.log(succes);
}
updateUserRefreshToken("Jenny", "megatoken");


setTimeout(() => {
  console.log("Ending pool");
  dao.terminateConnectionPool();
}, 6000);
