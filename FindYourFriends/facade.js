import { SERVER_URL } from './constants/settings';
import { gql } from "apollo-boost"

facade = () => {

    async function fetchSomething() {
        const res = await fetch(`${SERVER_URL}/somewhere`).then(res => res.json());
        return res;
    }


    return {
        fetchSomething
    }
}




const ADD_USER = gql`
    mutation addUser($input: UserInput!) {
        addUser(input: $input)
    }
`;

export default facade();
export {ADD_USER};