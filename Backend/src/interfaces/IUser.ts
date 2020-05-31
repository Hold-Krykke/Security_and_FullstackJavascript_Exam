export default interface IUser {
    username: string | null,
    password: string | null,
    email: string,
    isOAuth: boolean,
    refreshToken: string | null
}
