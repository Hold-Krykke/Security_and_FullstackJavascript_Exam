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
import PositionFacade from "./facades/positionFacade";
import setup from "./config/setupDB";

/**
 * AUTHENTICATION ERROR HANDLING:
 * In the Resolver for a protected Action, we can check Context for the User.
 * So if the User is not there, we throw a new AuthenticationError(err.msg); or with a custom String like "You must be logged in."
 */

const schema: string = process.env.DATABASE_SCHEMA || "";

const userFacade: UserFacade = new UserFacade(schema);
const positionFacade: PositionFacade = new PositionFacade();
// Resolvers
// Used in Schema to make a GraphQL schema
// Schema is used to make Apollo Server

(async function setupDB() {
  const client = await setup();
  positionFacade.setDatabase(client, "exam");
})();

// We need to implement security in the resolvers, JWT etc. when the login system is ready

const resolverMap: IResolvers = {
  Query: {
    // Do we need this?
    // allUsers(_: void, args: void): any {
    //     return UserFacade.getAllUsers();
    // },
    getUser(_: void, args: any): any {
      return userFacade.getUser(args.username);
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
      return userFacade.addNonOAuthUser(user);
    },
    deleteUser: (_, args: any) => {
      return userFacade.deleteUser(args.username);
    },
    getNearbyUsers: (_, args: any) => {
      const username: string = args.username;
      const lon: number = args.coordinates.lon;
      const lat: number = args.coordinates.lat;
      const distance: number = args.distance;
      const nearbyUsers = positionFacade.nearbyUsers(
        username,
        lon,
        lat,
        distance
      );
      return nearbyUsers;
    },
    updatePosition: (_, args: any) => {
      const username: string = args.username;
      const lon: number = args.coordinates.lon;
      const lat: number = args.coordinates.lat;
      const result = positionFacade.createOrUpdatePosition(username, lon, lat);
      return result;
    },
  },
};

export default resolverMap;
