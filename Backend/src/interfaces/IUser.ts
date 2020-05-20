export default interface IUser {
    username: string,
    password: string | null,
    email: string | null,
    isOAuth: boolean,
    refreshToken: string | null
}
