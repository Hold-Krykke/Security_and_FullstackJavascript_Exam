import { SERVER_URL } from './constants/settings';

facade = () => {

    async function fetchSomething() {
        const res = await fetch(`${SERVER_URL}/somewhere`).then(res => res.json());
        return res;
    }


    return {
        fetchSomething
    }
}

export default facade();