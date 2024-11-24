const { getUserById } = require("../path/to/controller");
const { User } = require("../models/User");

jest.mock("../models/User");

describe("getUserById", () => {
  it("should return 404 if user is not found", async () => {
    const req = { params: { userId: "1" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    User.findById.mockResolvedValue(null);

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ error: "User not found" });
  });

  it("should return user if found", async () => {
    const req = { params: { userId: "1" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue({ _id: "1", name: "John" });

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: "1", name: "John" });
  });
});

