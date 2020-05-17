import { IResolvers } from "graphql-tools";
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import setup from './config/setupDB'
import UserFacade from './facades/userFacade'
import IUser from './interfaces/IUser';

// Resolvers
// Used in Schema to make a GraphQL schema
// Schema is used to make Apollo Server
// This matches with the schema.graphql, like so:
/* ./schema/schema.graphql
type Query {
  helloWorld: String!
}
*/

(async function setupDB() {
    const client = await setup()
    UserFacade.setDatabase(client)
})()

const resolverMap: IResolvers = {
    Query: {
        helloWorld(_: void, args: void): string {
            return `Hello world!`;
        },
        allUsers(_: void, args: void): any {
            return UserFacade.getAllUsers();
        },
        getUser(_: void, args: any): any {
            return UserFacade.getUser(args.userName);
        },
    },
    Mutation: {
        addUser: (_, { input }) => {
            const userName: string = input.userName;
            const password: string = input.password;
            const name: string = input.name;
            const user: IUser = { userName, password, name };
            const added = UserFacade.addUser(user);
            return added;
        },
        deleteUser: (_, args: any) => {
            const userName: string = args.userName;
            const msg = UserFacade.deleteUser(userName);
            return msg;
        },
    },
};

export default resolverMap;
