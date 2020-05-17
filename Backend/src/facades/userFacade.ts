const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import * as mongo from 'mongodb'
import IUser from '../interfaces/IUser';
const bcrypt = require('bcryptjs');
import { ApiError } from '../customErrors/apiError'

let userCollection: mongo.Collection;

export default class UserFacade {
    static async setDatabase(client: mongo.MongoClient) {
        try {
            if (!client.isConnected()) {
                await client.connect();
            }
            userCollection = client.db().collection('users');
            await userCollection.createIndex({ userName: 1 }, { unique: true })
            await userCollection.createIndex({ name: 1 }, { unique: true })
            return client.db();

        } catch (err) {
            console.error('\nCould not create connect\n', err)
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

        let newUser: IUser = { userName: user.userName, password: hash, name: user.name }
        try {
            await userCollection.insertOne(newUser);
            return true;
        } catch (err) {
            throw new ApiError(`User could not be added, username (${user.userName}) and name (${user.name}) must be unique`, 400)
        }
    }

    static async getUser(userName: string, proj?: object): Promise<IUser> {
        const user = await userCollection.findOne(
            { userName },
            proj
        )
        if (!user) {
            throw new ApiError(`User with username: ${userName} was not found`, 404)
        }
        return user;
    }

    static async deleteUser(userName: string): Promise<string> {
        const status = await userCollection.deleteOne({ userName })
        if (status.deletedCount === 1) {
            return `${userName} was removed`;
        }
        else throw new ApiError(`Requested user ${userName} could not be removed`, 400)
    }

    static async getAllUsers(proj?: object): Promise<Array<any>> {
        const all = userCollection.find(
            {},
            { projection: proj }
        )
        return all.toArray();
    }
}
