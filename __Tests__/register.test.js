const { register } = require("../path/to/your/controller");
const { User } = require("../models/User");
const bcrypt = require("bcryptjs");

jest.mock("../models/User");
jest.mock("bcryptjs");

describe("register", () => {
  it("should return 409 if user already exists", async () => {
    const req = {
      body: { email: "test@example.com", phone: "1234567890" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.find.mockResolvedValue([{ email: "test@example.com" }]);

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "User already exists!" });
  });

  it("should return success message if user is created", async () => {
    const req = {
      body: {
        email: "test@example.com",
        phone: "1234567890",
        name: "Test User",
        password: "password123",
      },
    };
    const res = {
      json: jest.fn(),
    };

    User.find.mockResolvedValue([]);
    bcrypt.hash.mockResolvedValue("hashedPassword");
    User.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));

    await register(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(User).toHaveBeenCalledWith({
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      password: "hashedPassword",
    });
    expect(res.json).toHaveBeenCalledWith({ message: "User Added Successfully" });
  });

  it("should return an error if saving fails", async () => {
    const req = {
      body: {
        email: "test@example.com",
        phone: "1234567890",
        name: "Test User",
        password: "password123",
      },
    };
    const res = {
      json: jest.fn(),
    };

    User.find.mockResolvedValue([]);
    bcrypt.hash.mockResolvedValue("hashedPassword");
    User.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error("Save failed")),
    }));

    await register(req, res);

    expect(res.json).toHaveBeenCalledWith({ err: new Error("Save failed") });
  });
});
