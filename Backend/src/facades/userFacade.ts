const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import * as mongo from 'mongodb'
import IUser from '../interfaces/IUser';
const bcrypt = require('bcryptjs');
import setup from '../config/setupDB'


let userCollection: mongo.Collection;

export default class UserFacade {
    static async setDatabase(client: mongo.MongoClient) {
        try {
            if (!client.isConnected()) {
                await client.connect();
            }
            userCollection = client.db().collection("users");
            await userCollection.createIndex({ userName: 1 }, { unique: true })
            return client.db();

        } catch (err) {
            console.error("Could not create connect", err)
        }
    }

    static async addUser(user: IUser): Promise<boolean> {
        const hash: String = await new Promise((resolve, reject) => {
            bcrypt.hash(user.password, 10, (err: Error, hash: string) => {
                if (err) {
                    reject(err);
                }
                return resolve(hash);
            });
        });

        let newUser = { ...user, password: hash }
        try {
            await userCollection.insertOne(newUser);
            return true;
        } catch (err) {
            console.log(err.errmsg)
            return false;
        }
    }
}
