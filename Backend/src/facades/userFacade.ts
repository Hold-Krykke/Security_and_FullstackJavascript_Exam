const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import IUser from '../interfaces/IUser';
const bcrypt = require('bcryptjs');
import { ApiError } from '../customErrors/apiError';
import UserDataAccessorObject from '../dataAccessorObjects/userDAO';


export default class UserFacade {

    private _UDAO: UserDataAccessorObject;
    constructor(schema: string) {
        this._UDAO = new UserDataAccessorObject(schema);
    }

    /**
     * Used to add a new non OAuth user to the database.
     * User added will be a non OAuth type.
     * @param user IUser with at least username, password (plain text) and email
     */
    async addNonOAuthUser(user: IUser): Promise<boolean> {
        const hash: string = await new Promise((resolve, reject) => {
            bcrypt.hash(user.password, 10, (err: Error, hash: string) => {
                if (err) {
                    reject(err);
                }
                return resolve(hash);
            });
        });

        let newUser: IUser = { username: user.username, password: hash, email: user.email, isOAuth: user.isOAuth, refreshToken: null }
        try {
            await this._UDAO.addUser(newUser);
            return true;
        } catch (err) {
            throw new ApiError(`User could not be added, username (${user.username}) or (${user.email}) already exists`, 400)
        }
    }

    /**
     * Used to get specific user from the database.
     * @param username username of user
     */
    async getUserByUsername(username: string): Promise<IUser> {
        const user = await this._UDAO.getUserByUsername(username)
        if (!user) {
            throw new ApiError(`User with username: ${username} was not found`, 404)
        }
        return user;
    }

    /**
     * Used to get specific user from the database based on email. Use this for authentication
     * @param email email of user
     */
    async getUserByEmail(email: string): Promise<IUser> {
        const user = await this._UDAO.getUserByEmail(email)
        if (!user) {
            throw new ApiError(`User with email: ${email} was not found`, 404)
        }
        return user;
    }

    /**
     * Used to delete specific user from the database.
     * Returns promise with success message if user was deleted
     * @param username username of user
     */
    async deleteUser(username: string): Promise<string> {
        const status = await this._UDAO.deleteUser(username);
        // Weird way of checking for succes. Maybe this should be refactored.
        if (status.message.includes("succesfully deleted")) {
            return `User ${username} was removed`;
        }
        else throw new ApiError(`Requested user ${username} could not be removed`, 400)
    }

    // Do we even want this functionality? What for?
    // static async getAllUsers(): Promise<Array<any>> {
    //     const all = UDAO.thisMethodIsNotSupported();
    //     return all.toArray();
    // }

    /**
     * Used for login.
     * @param email email of user
     * @param plainTextPassword password in plain text
     */
    async checkUser(email: string, plainTextPassword: string): Promise<boolean> {
        let result = false;
        const user = await this.getUserByEmail(email);
        if (!user) return new Promise((resolve) => {resolve(false)});

        await new Promise((resolve, reject) => {
            bcrypt.compare(plainTextPassword, user.password, (err: Error, res: boolean) => {
                if (err) {
                    console.log('ERROR')
                    reject(err);
                } else {
                    result = res;
                    resolve(res);
                }
            });
        })
        return result;
    }

    /* ------------------------------------------ */
    /* --------- OAuth specific methods --------- */
    /* ------------------------------------------ */

    /**
     * Used to add OAuth type user.
     * This type of user is saved without a password and username
     * @param user 
     */
    async addOAuthUser(user: IUser): Promise<boolean> {
        const newUser: IUser = user;
        newUser.isOAuth = true;
        try {
            await this._UDAO.addUser(newUser);
            return true;
        } catch (err) {
            throw new ApiError(`User could not be added, email: (${user.email}) already exists`, 400)
        }
    }

    async updateUsernameOfOAuthUser(user: IUser): Promise<boolean> {
        const updateUser: IUser = user;
        updateUser.isOAuth = true;
        try {
            await this._UDAO.updateUsernameOfOAuthUser(updateUser);
            return true;
        } catch (err) {
            throw new ApiError(`Username could not be updated for user with email: (${user.email})`, 400)
        }
    }

    /**
     * Used to check if user is an OAuth type user or not
     * @param username username of user
     */
    async isOAuthUser(username: string): Promise<boolean> {
        try {
            const status = await this._UDAO.isOAuthUser(username);
            return status;
        } catch (err) {
            throw new ApiError(`User ${username} not found`, 400)
        }
    }

    /**
     * Used to update the refresh token of specific user.
     * @param identifier username or email
     * @param token new refresh token
     * @param identifierIsEmail pass true if identifier is an email, pass false if identifier is a username
     */
    async updateUserRefreshToken(identifier: string, token: string, identifierIsEmail: boolean): Promise<boolean> {
        try {
            if (identifierIsEmail) {
                return await this._UDAO.updateUserRefreshTokenByEmail(identifier, token);
            } else {
                return await this._UDAO.updateUserRefreshTokenByUsername(identifier, token);
            }
        } catch (err) {
            throw new ApiError(`User ${identifier} not found`, 400)
        }
    }

    /**
     * Used to get the refresh token of specific user.
     * Returns empty string if the user has no token
     * @param email email of user
     */
    async getUserRefreshToken(email: string): Promise<string> {
        try {
            const result = await this._UDAO.getRefreshTokenByEmail(email);
            if (result) return result;
            else return "";
        } catch (err) {
            throw new ApiError(`User ${email} not found`, 400)
        }
    }
}
