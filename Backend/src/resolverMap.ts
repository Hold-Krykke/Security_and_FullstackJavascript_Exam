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
const jwt = require("jsonwebtoken");

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

const tokenExpirationInSeconds = Number(process.env.TOKEN_EXPIRATION)

const userFacade: UserFacade = new UserFacade(schema);
const positionFacade: PositionFacade = new PositionFacade();
// Resolvers
// Used in Schema to make a GraphQL schema
// Schema is used to make Apollo Server

(async function setupDB() {
    const client = await setup();
    positionFacade.setDatabase(client, "exam");
})();

const resolverMap: IResolvers = {
    Query: {
        getUser(_: void, args: any, context): any {
            // This is an Authorization Guard.
            // Protect GraphQL mutations like this.
            // requiresLogIn(context);
            return userFacade.getUserByUsername(args.username);
        },
        checkToken(_, args, context): boolean {
            try {
                requiresLogIn(context);
                return true;
            } catch (err) {
                return false;
            }
        }
    },
    Mutation: {
        registerOAuthUser: async (_: void, args: any, context: any) => {
            // requiresLogIn(context)
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
            try {
                const success = await userFacade.updateUsernameOfOAuthUser(user);
                if (success) {
                    const payload = { useremail: context.token.email, username: args.username, isOAuth: true };
                    const token = jwt.sign(payload, process.env.SECRET, {
                        expiresIn: tokenExpirationInSeconds,
                    });
                    return token;
                } else {
                    throw new UserInputError("Username already taken", {
                        invalidArgs: "Username"
                    });
                }
            } catch (err) {
                throw new UserInputError("Username already taken");
            }
        },
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
            if (username != "" && password != "" && email != "") {
                let user: IUser = {
                    username,
                    password,
                    email,
                    isOAuth,
                    refreshToken: null,
                };
                try {
                    return userFacade.addNonOAuthUser(user);
                } catch (err) {
                    throw new UserInputError("Bad input");
                }
            } else {
                throw new UserInputError("Bad input");
            }
        },
        deleteUser: (_, args: any, context) => {
            // requiresLogIn(context)
            // mayOnlyModifySelf(args, context)
            return userFacade.deleteUser(args.username);
        },
        getNearbyUsers: (_, args: any, context) => {
            // requiresLogIn(context)
            // mayOnlyModifySelf(args, context)
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
        updatePosition: (_, args: any, context) => {
            // requiresLogIn(context)
            // mayOnlyModifySelf(args, context)
            isCoordinates(args.coordinates);
            const username: string = args.username;
            const lon: number = args.coordinates.lon;
            const lat: number = args.coordinates.lat;
            const result = positionFacade.createOrUpdatePosition(username, lon, lat);
            return result;
        },
    }
}

const mayOnlyModifySelf = async (args: any, context: any) => {
    const user = await userFacade.getUserByEmail(context.token.useremail);
    if (!(user.username == args.username)) {
        throw new ForbiddenError("You don't have permission to do that.");
    }
};

const requiresLogIn = (context: any) => {
    if (!context.valid || !context.token) {
        throw new AuthenticationError("You need to be logged in to do that.");
    }
};

// This could be placed in utils, but I wanted to keep Apollo Errors thrown in this file.
function isCoordinates(coordinates: any) {
    if (!validateCoordinates(coordinates.lon, coordinates.lat)) {
        throw new UserInputError(
            "Please provide proper Coordinates. lon between -180 and 180, and lat between -90 and 90"
        );
    }
}

export default resolverMap;
