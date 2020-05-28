import gql from "graphql-tag";

facade = () => {
  const GET_USER = gql`
    query User($username: String!) {
      getUser(username: $username) {
        email
        username
      }
    }
  `;

  const ADD_USER = gql`
    mutation addUser($input: UserInput!) {
      addUser(input: $input)
    }
  `;

  return {
    GET_USER,
    ADD_USER
  };
};

export default facade();