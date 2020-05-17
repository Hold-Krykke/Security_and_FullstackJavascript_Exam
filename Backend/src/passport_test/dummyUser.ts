const users = [
  {
    id: "1",
    firstName: "Maurice",
    lastName: "Moss",
    email: "maurice@moss.com",
    password: "abcdefg",
  },
  {
    id: "2",
    firstName: "Roy",
    lastName: "Trenneman",
    email: "roy@trenneman.com",
    password: "imroy",
  },
];

export default {
  getUsers: () => users,
  getUser: (id: any) => users.filter((user) => user.id == id),
  getByEmail: (email: string, password: string) =>
    users.filter((user) => {
      return user.email == email && user.password == password;
    }),
  addUser: (user: any) => users.push(user),
};
