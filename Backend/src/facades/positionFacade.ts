const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import IPoint from "../interfaces/IPoint";
import IPosition from "../interfaces/IPosition";
import * as mongo from "mongodb"
import { ApiError } from "../customErrors/apiError"

let positionCollection: mongo.Collection;
const EXPIRATION_TIME: number = 30; // Seconds

export default class PositionFacade {

    async setDatabase(client: mongo.MongoClient, databaseName: string) {
        try {
            positionCollection = client.db(databaseName).collection("positions");
            // Create expiresAfterSeconds index on lastUpdated
            await positionCollection.createIndex({ "lastUpdated": 1 }, { expireAfterSeconds: EXPIRATION_TIME })
            // Create 2dsphere index on location
            await positionCollection.createIndex({ location: "2dsphere" })
            // Create unique index for userName since it's unique in the other database and is going to be used and searched for a lot
            await positionCollection.createIndex({ username: 1 }, { unique: true })
        } catch (err) {
            console.log("Could not connect to database\n", err);
        }

    }

    async nearbyPlayers(username: string, lon: number, lat: number, distance: number): Promise<Array<any>> {
        try {
            const point: IPoint = { type: "Point", coordinates: [lon, lat] }
            const date = new Date();

            const position: IPosition = {
                username,
                lastUpdated: date,
                location: point
            }
            await positionCollection.findOneAndUpdate(
                // Filter: What are we searching for?
                { username },
                // Update: What data do we want to set/update?
                {
                    // The $set operator replaces the value of a field with the specified value.
                    // Doc: https://docs.mongodb.com/manual/reference/operator/update/set/
                    $set: { position }
                },
                // Options:
                // upsert creates the document, if it does not exist already
                { upsert: true, returnOriginal: false }

            )
            const nearbyPlayers = await this.findNearbyPlayers(username, point, distance);

            //If anyone found,  format acording to requirements
            const formatted = nearbyPlayers.map((user) => {
                return {
                    username: user.username,
                    lon: user.location.coordinates[0],
                    lat: user.location.coordinates[1]
                }
            })
            return formatted

        } catch (err) {
            throw new ApiError("Failed to get nearby players");
        }
    }

    findNearbyPlayers(username: string, point: IPoint, distance: number): Promise<Array<IPosition>> {
        try {
            const found = positionCollection.find(
                {
                    // The $ne operator matches all values that are not equal to a specified value.
                    userName: { $ne: username },
                    location:
                    {
                        // The $near operator returns geospatial objects in proximity to a point.
                        $near:
                        {
                            $geometry: point,
                            $maxDistance: distance
                        }
                    }
                }
            )
            return found.toArray();
        } catch (err) {
            throw new ApiError("Failed to get nearby players");
        }
    }

    static async createOrUpdatePosition(username: string, lat: number, lon: number): Promise<any> {
        const point: IPoint = { type: "Point", coordinates: [lon, lat] }
        const date = new Date();
        try {
            const found = await positionCollection.findOneAndUpdate(
                { username }, //Add what we are searching for (the username in a Position Document)
                {
                    $set: {
                        lastUpdated: date,
                        username,
                        location: point
                    }
                },
                { upsert: true, returnOriginal: false }
            )
            const formatted: IPosition = {
                lastUpdated: found.value.lastUpdated,
                username: found.value.username,
                location: found.value.location
            }
            return formatted;
        } catch (err) {
            throw new ApiError("Failed to create or update position");
        }
    }

}