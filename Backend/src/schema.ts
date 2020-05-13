// schema.ts
import "graphql-import-node";
import * as typeDefs from "./schema/schema.graphql";
import { makeExecutableSchema } from "graphql-tools";
import resolvers from "./resolverMap";
import { GraphQLSchema } from "graphql";

// This is used in server.ts for new Apolloserver
const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs, // typeDefs come from "./schema/schema.graphql"
  resolvers, // resolvers come from "./resolverMap"
});

export default schema;
