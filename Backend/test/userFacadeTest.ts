var path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });
import "chai"
import { expect } from "chai";
import { ApiError } from "../src/customErrors/apiError";
import bcrypt from "bcryptjs";
import UserDataAccessorObject from "../src/dataAccessorObjects/userDAO";
import IUser from "../src/interfaces/IUser";
import UserFacade from "../src/facades/userFacade";
import * as mocha from "mocha"

const schema: string = process.env.DATABASE_SCHEMA_TEST || "";
let UDAO: UserDataAccessorObject;
let facade: UserFacade;

describe("Verify the UserFacade", () => {
  before(async () => {
    if (!schema) {
      throw new Error(
        "DataAccessorObject could not created - check .env for missing values"
      );
    }
    if (schema != "exam_test") {
      throw new Error("You must use a test database");
    }
    UDAO = new UserDataAccessorObject(schema);
    console.log("New data accessor object created using database: ", schema);
    facade = new UserFacade(schema);
  });
  after(() => {
    const status = UDAO.terminateConnectionPool();
    console.log("Database connection pool has been terminated? ", status);
  });
  beforeEach(async () => {
    if (UDAO == null) {
      throw new Error("Data accessor object has not been instantiated");
    }
    await UDAO.truncateUserTable();
    const hashedPassword = await bcrypt.hash("secret", await bcrypt.genSalt());
    const user1: IUser = {
      username: "Johnny",
      password: hashedPassword,
      email: "johnny@ringo.com",
      isOAuth: false,
      refreshToken: null,
    };
    const user2: IUser = {
      username: "Jenny",
      password: hashedPassword,
      email: "jenny@thekill.com",
      isOAuth: false,
      refreshToken: null,
    };
    const user3: IUser = {
      username: "Dimwit",
      password: null,
      email: "dim@wit.com",
      isOAuth: true,
      refreshToken: "MansGotThatRefreshToken",
    };
    await UDAO.addUser(user1);
    await UDAO.addUser(user2);
    await UDAO.addUser(user3);
  });

  it("Should add OAuth user Google Boi", async () => {
    const user: IUser = {
      username: null,
      password: null,
      email: "googleboi@gmail.com",
      isOAuth: true,
      refreshToken: "GoogleRefreshToken",
    };
    const success: boolean = await facade.addOAuthUser(user);
    expect(success).to.be.equal(true);
  });

  it("Should get user Johnny", async () => {
    const user: IUser = await facade.getUserByUsername("Johnny");
    expect(user.email).to.be.equal("johnny@ringo.com");
    expect(user.isOAuth).to.be.equal(0);
    expect(user.password).to.not.be.equal(null);
  });

  it("Negative, Should fail to get user IDontExist", async () => {
    try {
      const user: IUser = await facade.getUserByUsername("IDontExist");
    } catch (err) {
      expect(err instanceof ApiError).to.be.equal(true);
      expect(err.message).to.be.equal(
        "User with username: IDontExist was not found"
      );
    }
  });

  it("Should delete user Johnny", async () => {
    const success: string = await facade.deleteUser("Johnny");
    expect(success).to.be.equal("User Johnny was removed");
  });

  it("Should check user Jenny", async () => {
    const success: boolean = await facade.checkUser(
      "jenny@thekill.com",
      "secret"
    );
    expect(success).to.be.equal(true);
  });

  it("Negative, Should check user Jenny", async () => {
    const success: boolean = await facade.checkUser(
      "jenny@thekill.com",
      "bad password"
    );
    expect(success).to.be.equal(false);
  });

  it("Negative, Should fail to check user IDontExist", async () => {
    try {
      const success: boolean = await facade.checkUser("i@dont.exist", "secret");
    } catch (err) {
      expect(err instanceof ApiError).to.be.equal(true);
      expect(err.message).to.be.equal(
        "User with email: i@dont.exist was not found"
      );
    }
  });

  it("Should check if user Jenny is OAuth type user", async () => {
    const status: boolean = await facade.isOAuthUser("Jenny");
    expect(status).to.be.equal(false);
  });

  it("Negative, Should fail to check if user IDontExist is OAuth type user", async () => {
    try {
      const status: boolean = await facade.isOAuthUser("IDontExist");
    } catch (err) {
      expect(err instanceof ApiError).to.be.equal(true);
      expect(err.message).to.be.equal("User IDontExist not found");
    }
  });

  it("Should update refresh token of user Dimwit based on username", async () => {
    const status: boolean = await facade.updateUserRefreshToken(
      "Dimwit",
      "NewToken",
      false
    );
    expect(status).to.be.equal(true);
  });

  it("Should update refresh token of user Dimwit based on email", async () => {
    const status: boolean = await facade.updateUserRefreshToken(
      "dim@wit.com",
      "NewToken",
      true
    );
    expect(status).to.be.equal(true);
  });

  it("Negative, Should fail to update refresh token of user IDontExist", async () => {
    try {
      const status: boolean = await facade.updateUserRefreshToken(
        "IDontExist",
        "NewToken",
        false
      );
    } catch (err) {
      expect(err instanceof ApiError).to.be.equal(true);
      expect(err.message).to.be.equal("User IDontExist not found");
    }
  });

  it("Should get refresh token of user Dimwit", async () => {
    const token: string = await facade.getUserRefreshToken("dim@wit.com");
    expect(token).to.be.equal("MansGotThatRefreshToken");
  });
});
