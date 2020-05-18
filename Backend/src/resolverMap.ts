import { IResolvers } from "graphql-tools";
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });
import setup from "./config/setupDB";
import UserFacade from "./facades/userFacade";
import IUser from "./interfaces/IUser";
import jwt from "jsonwebtoken";

// Resolvers
// Used in Schema to make a GraphQL schema
// Schema is used to make Apollo Server

(async function setupDB() {
  const client = await setup();
  UserFacade.setDatabase(client);
})();

const resolverMap: IResolvers = {
  Query: {
    allUsers(_: void, args: void): any {
      return UserFacade.getAllUsers();
    },
    getUser(_: void, args: any): any {
      return UserFacade.getUser(args.userName);
    },
    login: async (
      parent: void,
      args: { userName: string; password: string },
      context: any
    ) => {
      const { userName, password } = args;
      const user = await UserFacade.getUser(userName);
      if (!user) {
        throw new Error("User does not exist!");
      }
      if (await UserFacade.checkUser(userName, password)) {
        // User exists and has a valid password.
      } else {
        throw new Error("Password is incorrect!"); // Maybe we shouldn't do this. Don't want to give the Hacker any hints! #Security
        // But giving the "hint" is good for debugging. But in production it should just be "User credentials are invalid!" in both Errors.
      }
      // Making token to hand to user
      const tokenExpiration = 1;
      const tokenConfig = {
        expiresIn: `${tokenExpiration}h`,
      };
      const token = jwt.sign(
        { userName: user.userName },
        process.env.JWT_SECRET,
        tokenConfig
      );
      /*
      type AuthData {
            userName: String!
            token: String!
            tokenExpiration: Int!
        }
      */
      return { userName: user.userName, token, tokenExpiration };
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
