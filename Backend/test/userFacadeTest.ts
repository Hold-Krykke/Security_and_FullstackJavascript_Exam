var path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import { expect } from "chai";
import { ApiError } from '../src/customErrors/apiError';
import bcrypt from "bcryptjs";
import UserDataAccessorObject from "../src/dataAccessorObjects/userDAO";
import IUser from "../src/interfaces/IUser";
import UserFacade from "../src/facades/userFacade";

const schema: string = process.env.DATABASE_SCHEMA_TEST || "";
let UDAO: UserDataAccessorObject;
let facade: UserFacade;

describe("Verify the UserFacade", () => {

    before(async () => {
        if (!schema) {
            throw new Error("DataAccessorObject could not created - check .env for missing values");
        }
        if (schema != "exam_test") {
            throw new Error("You must use a test database");
        }
        UDAO = new UserDataAccessorObject(schema);
        console.log("New data accessor object created using database: ", schema);
        facade = new UserFacade(schema);
    })
    after(() => {
        const status = UDAO.terminateConnectionPool();
        console.log("Database connection pool has been terminated? ", status);
    })
    beforeEach(async () => {
        if (UDAO == null) {
            throw new Error("Data accessor object has not been instantiated");
        }
        await UDAO.truncateUserTable();
        const hashedPassword = await bcrypt.hash("secret", await bcrypt.genSalt());
        const user1: IUser = { username: "Johnny", password: hashedPassword, email: "johnny@ringo.com", isOAuth: false, refreshToken: null };
        const user2: IUser = { username: "Jenny", password: hashedPassword, email: "jenny@thekill.com", isOAuth: false, refreshToken: null };
        const user3: IUser = { username: "Dimwit", password: null, email: null, isOAuth: true, refreshToken: "MansGotThatRefreshToken" };
        await UDAO.addUser(user1);
        await UDAO.addUser(user2);
        await UDAO.addUser(user3);
    })

    it("Should add non OAuth user Donald Trump", async () => {
        const user: IUser = { username: "Donald Trump", password: "secret", email: "donald@trump.com", isOAuth: false, refreshToken: null };
        try{
            const success: boolean = await facade.addNonOAuthUser(user);
            expect(success).to.be.equal(true);
        } catch(err) {
            console.log("Test failed");
            console.log(err);
        }
    })
})