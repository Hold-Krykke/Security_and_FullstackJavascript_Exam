import * as mongo from "mongodb";
import setup from "../src/config/setupDB";
import PositionFacade from "../src/facades/positionFacade";
import { expect } from "chai";
import { ApiError } from '../src/customErrors/apiError';
import { positionCreator } from "../src/util/geoUtils"
import * as mocha from "mocha"

let testPositionCollection: mongo.Collection;
let facade: PositionFacade;
let client: mongo.MongoClient;

describe("Verify the PositionFacade", () => {
    before(async () => {
        client = await setup();
        testPositionCollection = client.db("exam_test").collection("positions");
        if (!testPositionCollection) {
            throw new Error("Could not initialize collection");
        }
        facade = new PositionFacade();
        facade.setDatabase(client, "exam_test");
    })

    after(async () => {
        console.log("Closing client in test file");
        await client.close();
    })

    beforeEach(async () => {
        // Clear collection
        // Passing an empty filer {} means that we're not going delete something specific, just everything in the collection
        await testPositionCollection.deleteMany({});
        // Creating positions for testing
        const positions = [
            positionCreator(12.5, 55.77, "George", true),
            positionCreator(12.124, 55.77, "Johnny", true),
            positionCreator(12.12, 55.77, "Jenny", true),
        ]
        // Inserting into test collection
        await testPositionCollection.insertMany(positions);
    })

    it("Should find (Only) Jenny", async () => {
        const playersFound = await facade.nearbyUsers("Johnny", 12.123, 55.77, 1000);
        expect(playersFound.length).to.be.equal(1);
        expect(playersFound[0].username).to.be.equal("Jenny")
    })

    it("Should find 2 other users", async () => {
        const playersFound = await facade.nearbyUsers("Johnny", 12.123, 55.77, 50000);
        expect(playersFound.length).to.be.equal(2);
        expect(playersFound[0].username).to.be.equal("Jenny")
        expect(playersFound[1].username).to.be.equal("George")
    })

    it("Should not find anyone", async () => {
        const playersFound = await facade.nearbyUsers("Johnny", 12.123, 55.77, 10)
        expect(playersFound.length).to.be.equal(0);
    })

    it("Negative, Should fail to find anyone", async () => {
        try {
            const playersFound = await facade.nearbyUsers("IDontExist", 12.123, 55.77, 1000);
        } catch (err) {
            expect(err.errorCode).to.be.equal(400);
            expect(err.message).to.be.equal("Failed to get nearby players")
        }
    })

    it("Negative, Should fail to find anyone with negative distance", async () => {
        try {
            const playersFound = await facade.nearbyUsers("Johnny", 12.123, 55.77, -1000);
        } catch (err) {
            expect(err.message).to.be.equal("Please provide a search distance that is greater than 0");
        }
    })

    it("Negative, Should not update the position of non-existing user", async () => {
        try {
            const result = await facade.createOrUpdatePosition("IDontExist", 12.48, 55.79);
        } catch (err) {
            console.log(err);
            expect(err.errorCode).to.be.equal(400)
            expect(err.message).to.be.equal("Failed to create or update position")
        }
    })

    it("Should update the position of Johnny", async () => {
        const result = await facade.createOrUpdatePosition("Johnny", 12.48, 55.87);
        expect(result.username).to.be.equal("Johnny");
        expect(result.location.type).to.be.equal("Point");
        expect(result.location.coordinates[0]).to.be.equal(12.48);
    })
})