import { IResolvers } from 'graphql-tools';
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
// import setup from './config/setupDB'
import UserFacade from './facades/userFacade'
import IUser from './interfaces/IUser';

// Resolvers
// Used in Schema to make a GraphQL schema
// Schema is used to make Apollo Server

// (async function setupDB() {
//     const client = await setup()
//     //UserFacade.setDatabase(client)
// })()

const resolverMap: IResolvers = {
    Query: {
        // Do we need this?
        // allUsers(_: void, args: void): any {
        //     return UserFacade.getAllUsers();
        // },
        getUser(_: void, args: any): any {
            return UserFacade.getUser(args.username);
        },
    },
    Mutation: {
        addUser: (_, { input }) => {
            const username: string = input.username;
            const password: string = input.password;
            const email: string = input.email;
            const isOAuth: boolean = false;
            const user: IUser = { username, password, email, isOAuth, refreshToken: null };
            const added = UserFacade.addNonOAuthUser(user);
            return added;
        },
        deleteUser: (_, args: any) => {
            const userName: string = args.username;
            const msg = UserFacade.deleteUser(userName);
            return msg;
        },
    },
};

export default resolverMap;
