import { SERVER_URL } from './constants/settings';
import { gql } from "graphql-tag"

facade = () => {
  async function fetchSomething() {
    const res = await fetch(`${SERVER_URL}/somewhere`).then((res) =>
      res.json()
    );
    return res;
  }

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
    fetchSomething,
    GET_USER,
    ADD_USER
  };
};
