const resolvers = {
  Query: {
    // Replace any on getUser with user type
    currentUser: (parent: any, args: any, context: { getUser: () => any }) =>
      context.getUser(),
  },
  Mutation: {
    logout: (parent: any, args: any, context: { logout: () => any }) =>
      context.logout(),

    login: async (parent: any, { email, password }: any, context: any) => {
      const { user } = await context.authenticate("graphql-local", {
        email,
        password,
      });
      await context.login(user);
      return { user };
    },
  },
};

export default resolvers;
