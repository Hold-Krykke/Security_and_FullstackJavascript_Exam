export default interface IUser {
    username: string,
    password: string | null,
    email: string,
    isOAuth: boolean,
    refreshToken: string | null
}
