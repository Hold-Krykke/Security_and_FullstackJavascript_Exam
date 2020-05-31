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

  const UPDATE_USERNAME_OF_OAUTHUSER = gql`
    mutation updateUsernameOfOAuthUser($username: String!) {
      registerOAuthUser(username: $username)
    }
  `;

  return {
    GET_USER,
    ADD_USER,
    UPDATE_USERNAME_OF_OAUTHUSER
  };
};

export default facade();