const { updateMeById } = require("../path/to/controller");
const { User } = require("../models/User");

jest.mock("../models/User");

describe("updateMeById", () => {
  it("should update user data and return success message", async () => {
    const req = {
      user: { id: "1" },
      body: { data: { name: "Updated Name", email: "updated@example.com" } },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findByIdAndUpdate.mockResolvedValue({
      _id: "1",
      name: "Updated Name",
      email: "updated@example.com",
    });

    await updateMeById(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      { name: "Updated Name", email: "updated@example.com" },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Sucessfuly updated user",
      newUser: {
        _id: "1",
        name: "Updated Name",
        email: "updated@example.com",
      },
      error: false,
    });
  });
});

