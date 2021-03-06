var path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import mysql from "mysql";
// import that let's us access secret SSL information needed to make secure connection
import { SSLAccessor } from "../ssl.js";
import IUser from "../interfaces/IUser.js";

const host = process.env.DATABASE_IP;
const username = process.env.DATABASE_USER_USERNAME;
const password = process.env.DATABASE_USER_PASSWORD;
const port = 3306

/**
 * Class used to connect to MySQL database. 
 * Pass schema to constructor to choose which database to work with
 */
export default class UserDataAccessorObject {

  private _pool: mysql.Pool;
  private _currentSchema: string;

  constructor(schema: string) {
    this._pool = this._createConnectionPool(schema);
    this._currentSchema = schema;
  }

  private _createConnectionPool(schema: string): mysql.Pool {
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
   * Do not use this method unless you are absolutely sure you're not going 
   * to use the instance anymore
   */
  terminateConnectionPool(): boolean {
    this._pool.end();
    return true;
  }

  /**
   * Used to get a user by email. Use this for authentication.
   * @param email email of user
   */
  getUserByEmail(email: string): Promise<IUser> | Promise<any> {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((err, connection) => {
        if (err) {
          console.log("Failed to get connection from pool");
          reject(err);
          return;
        }
        else {
          try {
            connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, result) {
              if (error) {
                console.log("An error occurred when trying to fetch user");
                reject(error);
                return;
              }
              const data = result[0];
              if (typeof (data) == "undefined") {
                resolve(null);
                // return statement necessary to end method
                return;
              }
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
   * Can be used to add both OAuth users and normal users
   * Will return promise with success message if user was persisted.
   * Will return rejected promise with specific message if a duplicate error occurs.
   * username and email (if provided) must be unique
   * @param user 
   */
  addUser(user: IUser): Promise<any> {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((err, connection) => {
        if (err) {
          console.log("Failed to get connection from pool");
          reject(err);
          return;
        }
        else {
          try {
            connection.query('INSERT INTO `users` (`username`, `password`, `email`, `isOAuth`, `refreshToken`) VALUES ( ?, ?, ?, ?, ?);',
              [user.username, user.password, user.email, user.isOAuth, user.refreshToken],
              function (error) {
                if (error) {
                  console.log("An error occurred when trying to insert user in database");
                  if (error.message.includes("ER_DUP_ENTRY: Duplicate entry")) {
                    reject({ "message": "Username or email already exists" });
                    return;
                  }
                  reject(error);
                  return;
                }
                resolve({ "message": `User ${user.username} was succesfully created` });
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
   * Returns promise boolean true if token was updated
   * @param username username of user
   * @param token new refresh token
   */
  updateUserRefreshTokenByUsername(username: string, token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((err, connection) => {
        if (err) {
          console.log("Failed to get connection from pool");
          reject(err);
          return;
        }
        else {
          try {
            connection.query('UPDATE `users` SET `refreshToken` = ? WHERE (`username` = ?);',
              [token, username], function (error, result) {
                if (error) {
                  console.log("An error occurred when trying to update user refresh token");
                  reject(error);
                  return;
                }
                if (result.affectedRows == 0) {
                  // Should promise be resolved instead (a bit less aggressive strategy)
                  reject({ "message": `User ${username} does not exist` });
                  return;
                }
                resolve(true);
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

  /**
   * Used to update the refresh token of a user.
   * Returns promise boolean true if token was updated
   * @param email email of user
   * @param token new refresh token
   */
  updateUserRefreshTokenByEmail(email: string, token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((err, connection) => {
        if (err) {
          console.log("Failed to get connection from pool");
          reject(err);
          return;
        }
        else {
          try {
            connection.query('UPDATE `users` SET `refreshToken` = ? WHERE (`email` = ?);',
              [token, email], function (error, result) {
                if (error) {
                  console.log("An error occurred when trying to update user refresh token");
                  reject(error);
                  return;
                }
                if (result.affectedRows == 0) {
                  // Should promise be resolved instead (a bit less aggressive strategy)
                  reject({ "message": `User with email: ${email} does not exist` });
                  return;
                }
                resolve(true);
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

  updateUsernameOfOAuthUser(user: IUser): Promise<any> {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((err, connection) => {
        if (err) {
          console.log("Failed to get connection from pool");
          reject(err);
          return;
        }
        else {
          try {
            connection.query('UPDATE `users` SET `username` = ? WHERE (`email` = ?);',
              [user.username, user.email], function (error, result) {
                if (error) {
                  console.log("An error occurred when trying to update username of OAuth user");
                  reject(error);
                  return;
                }
                if (result.affectedRows == 0) {
                  // Should promise be resolved instead (a bit less aggressive strategy)?
                  reject({ "message": `User with email: ${user.email} does not exist` });
                  return;
                }
                resolve(true);
              })
          } catch (err) {
            console.log("Failed to update username");
            reject(err);
          } finally {
            connection.release();
          }
        }
      });
    })
  }

  /**
   * Used to get refresh token of specific user.
   * @param email email of user
   */
  getRefreshTokenByEmail(email: string): Promise<string> | Promise<any> {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((err, connection) => {
        if (err) {
          console.log("Failed to get connection from pool");
          reject(err);
          return;
        }
        else {
          try {
            connection.query('SELECT `refreshToken` FROM `users` WHERE (`email` = ?);',
              [email], function (error, result) {
                if (error) {
                  console.log("An error occurred when trying to get refresh token");
                  reject(false);
                  return;
                }
                if (result[0].refreshToken) {
                  resolve(result[0].refreshToken);
                  return;
                }
                else resolve(null);
              });
          } catch (error) {
            console.log("Failed to refresh token");
            reject(false);
          } finally {
            connection.release();
          }
        }
      });
    })
  }

  /**
   * Used to delete all data in users table.
   * Only allows deletion in test databases.
   * Returns false if: 
   * deletion fails
   * current database is not a test database
   */
  truncateUserTable(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((err, connection) => {
        if (err) {
          console.log("Failed to get connection from pool");
          reject(err);
          return;
        }
        else {
          if (!this._currentSchema.includes("_test")) {
            resolve(false);
            return;
          }
          try {
            connection.query('TRUNCATE TABLE users;',
              [], function (error, result) {
                if (error) {
                  console.log("An error occurred when truncating table");
                  reject(false);
                  return;
                }
                resolve(true);
              });
          } catch (error) {
            console.log("Failed to truncate table");
            reject(false);
          } finally {
            connection.release();
          }
        }
      });
    })
  }

}

