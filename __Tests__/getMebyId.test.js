const { getMebyId } = require("../path/to/controller");
const { User } = require("../models/User");

jest.mock("../models/User");

describe("getMebyId", () => {
  it("should return 404 if user is not found", async () => {
    const req = { user: { id: "1" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    User.findById.mockResolvedValue(null);

    await getMebyId(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ error: "User not found" });
  });

  it("should return user data if found", async () => {
    const req = { user: { id: "1" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue({ _id: "1", name: "John" });

    await getMebyId(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: "1", name: "John" });
  });
});

