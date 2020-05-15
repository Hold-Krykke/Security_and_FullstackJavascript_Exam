import { IResolvers } from "graphql-tools";

const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
//require('dotenv').config();
import * as mongo from 'mongodb'
import IUser from './interfaces/IUser';
const bcrypt = require('bcryptjs');
import setup from './config/setupDB'
import UserFacade from './facades/userFacade'

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
    console.log(path.join(process.cwd(), '.env'))
    let testuser: IUser = { userName: 'hest', password: 'hat' }
    const client = await setup()
    UserFacade.setDatabase(client)
    console.log(UserFacade.addUser(testuser))

})()

const resolverMap: IResolvers = {
    Query: {
        helloWorld(_: void, args: void): string {
            return `Hello world!`;
        },
    },
};

export default resolverMap;
