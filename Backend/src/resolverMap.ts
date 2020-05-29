import { IResolvers } from "graphql-tools";
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });
// import setup from './config/setupDB'
import UserFacade from "./facades/userFacade";
import IUser from "./interfaces/IUser";
import {
  AuthenticationError, // IF NOT AUTHENTICATED - for authentication failures
  UserInputError, // For validation errors on user input
  ForbiddenError, // IF NOT AUTHORIZED - for authorization failures
  ApolloError, // IF NOT ANY OF THE ABOVE THREE - If failure is not caught in one of these three, message will be INTERNAL_SERVER_ERROR
} from "apollo-server-express";
import validateEmail from "./util/validateEmail";
import PositionFacade from "./facades/positionFacade";
import setup from "./config/setupDB";
import validateCoordinates from "./util/validateCoordinates";

/**
 * AUTHENTICATION / AUTHORIZATION ERROR HANDLING:
 * If Token is not OK, throw AuthenticationError
 * If Token is OK, but person is not permitted to do an action, throw ForbiddenError.
 * If User Input has passed GraphQLs own type-checks, then do your own and throw UserInputError if not OK. Like for lon/lat or email.
 * Those are just strings in GraphQL, but has to be a certain way, so we make custom checks.
 * In the Resolver for a protected Action, we can check Context for the User.
 * So if the User is not there, we throw a new ForbiddenError(err.msg); or with a custom String like "You must be logged in."
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
    getUser(_: void, args: any, context): any {
      console.log(context);
      // This is an Authorization Guard.
      // Protect GraphQL mutations like this.
      if (!context.valid) {
        throw new AuthenticationError("You need to be logged in to do that.");
      }
      return userFacade.getUserByUsername(args.username);
    },
  },
  Mutation: {
    registerOAuthUser: (_, args: any, context) => {
      if (!context.valid) {
        throw new AuthenticationError("You need to be logged in to do that.");
      }
      // Only OAuth type users are allowed to use this endpoint
      if (!context.token.isOAuth) {
        throw new ForbiddenError("Wrong type of user");
      }
      const username: string = args.username;
      // You're only able to edit your own username
      const email = context.token.useremail;
      const isOAuth = true;
      const user: IUser = {
        username,
        password: null,
        email,
        isOAuth,
        refreshToken: null
      }
      try{
        const success = userFacade.updateUsernameOfOAuthUser(user);
      } catch(err){
        throw new UserInputError("Username already taken");
      }
    },
    addUser: (_, { input }) => {
      const email: string = input.email;
      // if (!validateEmail(email)) {
      //   throw new UserInputError("Email Argument invalid", {
      //     invalidArgs: "email",
      //   });
      // }
      const username: string = input.username;
      const password: string = input.password;
      const isOAuth: boolean = false;
      if (username != "" && password != "" && email != "") {
        let user: IUser = {
          username,
          password,
          email,
          isOAuth,
          refreshToken: null,
        };
        return userFacade.addNonOAuthUser(user);
      } else {
        throw new UserInputError("Bad input");
      }
    },
    deleteUser: (_, args: any) => {
      return userFacade.deleteUser(args.username);
    },
    getNearbyUsers: (_, args: any) => {
      if (args.distance <= 0) {
        throw new UserInputError(
          "Please provide a search distance that is greater than 0",
          {
            invalidArgs: "distance",
          }
        );
      }
      isCoordinates(args.coordinates);
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
      isCoordinates(args.coordinates);
      const username: string = args.username;
      const lon: number = args.coordinates.lon;
      const lat: number = args.coordinates.lat;
      const result = positionFacade.createOrUpdatePosition(username, lon, lat);
      return result;
    },
  },
};

export default resolverMap;

// This could be placed in utils, but I wanted to keep Apollo Errors thrown in this file.
function isCoordinates(coordinates: any) {
  if (!validateCoordinates(coordinates.lon, coordinates.lat)) {
    throw new UserInputError(
      "Please provide proper Coordinates. lon between -180 and 180, and lat between -90 and 90",
      {
        invalidArgs: "coordinates",
        errorCode: 400,
      }
    );
  }
}
