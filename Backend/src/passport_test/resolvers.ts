const resolvers = {
  Query: {
    // Replace any on getUser with user type
    currentUser: (parent: any, args: any, context: { getUser: () => any }) =>
      context.getUser(),
  },
  Mutation: {
    logout: (parent: any, args: any, context: { logout: () => any }) =>
      context.logout(),
  },
};

export default resolvers;
