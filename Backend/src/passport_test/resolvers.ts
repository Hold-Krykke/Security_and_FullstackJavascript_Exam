import { v4 as uuid } from "uuid";

const resolvers = {
  Query: {
    currentUser: (parent: any, args: any, context: any) => context.user,
  },
  Mutation: {
    logout: (parent: any, args: any, context: any) => context.logout(),

    login: async (parent: any, { email, password }: any, context: any) => {
      const { user } = await context.authenticate("graphql-local", {
        email,
        password,
      });
      await context.login(user);
      return { user };
    },
    /**
     * First, we need to check if a user with the provided email already exists.
     * If not we add the user. Otherwise, we throw an error.
     * We also want the user to be logged in directly after signing up.
     * In order to create a persistent session and set the corresponding cookie,
     * we need to call the login function here as well.
     */
    signup: async (
      parent: any,
      { firstName, lastName, email, password }: any, // This is args, destructured
      context: any
    ) => {
      const existingUsers = context.User.getUsers();
      const userWithEmailAlreadyExists = !!existingUsers.find(
        (user: { email: any }) => user.email === email
      ); // bang, bang https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript

      if (userWithEmailAlreadyExists) {
        throw new Error("User with email already exists");
      }

      const newUser = {
        id: uuid(),
        firstName,
        lastName,
        email,
        password,
      };

      context.User.addUser(newUser);

      await context.login(newUser);

      return { user: newUser };
    },
  },
};

export default resolvers;
