export default interface IPosition {
    lastUpdated: Date,
    username: string,
    location: {
        type: string,
        coordinates: Array<number>
    }
}
