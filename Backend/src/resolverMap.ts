import { IResolvers } from "graphql-tools";

// Resolvers
// Used in Schema to make a GraphQL schema
// Schema is used to make Apollo Server
// This matches with the schema.graphql, like so:
/* ./schema/schema.graphql
type Query {
  helloWorld: String!
}
*/
const resolverMap: IResolvers = {
  Query: {
    helloWorld(parent: void, args: void, context: any): string {
      return `Hello world!`;
    },
  },
};

export default resolverMap;
