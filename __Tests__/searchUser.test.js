const { searchUser } = require("../controllers/UsersController");
const { User } = require("../models/User");

jest.mock("../models/User");

describe("searchUser", () => {
  it("should return 404 if no search query is provided", async () => {
    const req = { query: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await searchUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No search query" });
  });

  it("should return matching users if query is valid", async () => {
    const req = { query: { searchQuery: "John" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.find.mockResolvedValue([
      { _id: "1", name: "John", email: "john@example.com" },
    ]);

    await searchUser(req, res);

    expect(User.find).toHaveBeenCalledWith(
      {
        $or: [
          { name: { $regex: "^John" } },
          { email: { $regex: "^John" } },
        ],
      },
      "_id name email phone profileImage "
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { _id: "1", name: "John", email: "john@example.com" },
    ]);
  });
});

