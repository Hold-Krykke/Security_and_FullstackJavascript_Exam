export default interface IUser {
    username: string,
    password: string,
    email: string | null,
    isOAuth: boolean,
    refreshToken: string | null
}
