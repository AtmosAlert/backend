const { authenticate } = require("../middlewares/Authenticate");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken");

describe("authenticate middleware", () => {
  it("should authenticate a valid token and proceed to the next middleware", () => {
    const req = {
      headers: {
        authorization: "Bearer validToken",
      },
    };
    const res = {};
    const next = jest.fn();

    jwt.verify.mockReturnValue({ id: "user123" });

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("validToken", process.env.ACCESS_TOKEN_SECRET);
    expect(req.user).toEqual({ id: "user123" });
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if no token is provided", () => {
    const req = {
      headers: {
        authorization: "",
      },
    };
    const res = {
      sendStatus: jest.fn(),
    };
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token verification fails", () => {
    const req = {
      headers: {
        authorization: "Bearer invalidToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("invalidToken", process.env.ACCESS_TOKEN_SECRET);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Authentication failed" });
    expect(next).not.toHaveBeenCalled();
  });
});

