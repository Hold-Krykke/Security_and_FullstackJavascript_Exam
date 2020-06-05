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

  const CHECK_JWT = gql`
    query checkJWT($input: String) {
      checkToken(input: $input)
    }
  `;

  return {
    GET_USER,
    ADD_USER,
    UPDATE_USERNAME_OF_OAUTHUSER,
    CHECK_JWT
  };
};

export default facade();