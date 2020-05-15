const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import * as mongo from 'mongodb'
import IUser from '../interfaces/IUser';
const bcrypt = require('bcryptjs');


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
        const hash: string = await new Promise((resolve, reject) => {
            bcrypt.hash(user.password, 10, (err: Error, hash: string) => {
                if (err) {
                    reject(err);
                }
                return resolve(hash);
            });
        });

        let newUser: IUser = { userName: user.userName, password: hash }
        console.log(newUser);
        try {
            await userCollection.insertOne(newUser);
            return true;
        } catch (err) {
            // Errorhandling needed
            console.log(err.errmsg)
            return false;
        }
    }

    static async getUser(userName: string, proj?: object): Promise<IUser> {
        console.log(userName)
        const user = await userCollection.findOne(
            { userName },
            proj
        )
        if (!user) {
            // Errorhandling needed
            console.log('User not found')
        }
        return user;
    }

    static async deleteUser(userName: string): Promise<string> {
        const status = await userCollection.deleteOne({ userName })
        if (status.deletedCount === 1) {
            return "User was deleted";
        } // Errorhandling needed
        else return 'Requested delete could not be performed'
    }

    static async getAllUsers(proj?: object): Promise<Array<any>> {
        const all = userCollection.find(
            {},
            { projection: proj }
        )
        return all.toArray();
    }
}
