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

  const UPDATE_POSITION = gql`
    mutation updatePosition($username: String!, $coordinates: LocationInput!) {
      updatePosition(username: $username, coordinates: $coordinates) {
        lastUpdated
        username
        location {
          coordinates
        }
      }
    }
  `;

  const NEARBY_USERS = gql`
    mutation getNearbyUsers($username: String!, $coordinates: LocationInput!, $distance: Float!) {
      getNearbyUsers(username: $username, coordinates: $coordinates, distance: $distance) {
        username
        lon
        lat
      }
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
    UPDATE_POSITION,
    UPDATE_USERNAME_OF_OAUTHUSER,
    CHECK_JWT,
    NEARBY_USERS
  };
};

export default facade();
