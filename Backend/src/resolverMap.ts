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
    // let testuser: IUser = { userName: 'hat4', password: 'hat' }
    // console.log(UserFacade.addUser(testuser))
})()

const resolverMap: IResolvers = {
    Query: {
        helloWorld(_: void, args: void): string {
            return `Hello world!`;
        },
    },
    // VIRKER IKKE
    Mutation: {
        addUser: (_, { input }) => {
            const userName: string = input.userName;
            const password: string = input.password;
            const user: IUser = { userName, password }
            const added = UserFacade.addUser(user);
            return added;
        },
    },
    // Mutation: {
    //     addUser: (root, { input }) => {
    //         const user: IUser = { input.userName, input.password }
    //         UserFacade.addUser(user)
    //     });
    // }
};

export default resolverMap;
