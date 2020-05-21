import { IResolvers } from "graphql-tools";
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });
// import setup from './config/setupDB'
import UserFacade from "./facades/userFacade";
import IUser from "./interfaces/IUser";
import {
  AuthenticationError,
  UserInputError,
  ApolloError,
} from "apollo-server-express";
import validateEmail from "./util/validateEmail";

const schema: string = process.env.DATABASE_SCHEMA || "";

const facade: UserFacade = new UserFacade(schema);

/**
 * AUTHENTICATION ERROR HANDLING:
 * In the Resolver for a protected Action, we can check Context for the User.
 * So if the User is not there, we throw a new AuthenticationError(err.msg); or with a custom String like "You must be logged in."
 */

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
      try {
        return facade.getUser(args.username);
      } catch (err) {
        throw new ApolloError(err.msg, err.errorCode);
      }
    },
  },
  Mutation: {
    addUser: (_, { input }) => {
      const email: string = input.email;
      if (!validateEmail(email)) {
        throw new UserInputError("Email Argument invalid", {
          invalidArgs: "email",
        });
      }
      const username: string = input.username;
      const password: string = input.password;
      const isOAuth: boolean = false;
      const user: IUser = {
        username,
        password,
        email,
        isOAuth,
        refreshToken: null,
      };
      try {
        return facade.addNonOAuthUser(user);
      } catch (err) {
        throw new ApolloError(err.msg, err.errorCode);
      }
    },
    deleteUser: (_, args: any) => {
      const userName: string = args.username;
      const msg = facade.deleteUser(userName);
      return msg;
    },
  },
};

export default resolverMap;
