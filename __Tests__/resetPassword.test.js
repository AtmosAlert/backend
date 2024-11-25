const { resetPassword } = require("../controllers/UsersController");
const { User } = require("../models/User");
const bcrypt = require("bcryptjs");

jest.mock("../models/User");
jest.mock("bcryptjs");

describe("resetPassword", () => {
  it("should return 400 if current password is incorrect", async () => {
    const req = {
      user: { id: "1" },
      body: { currentPassword: "wrongpassword", newPassword: "newpassword" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    User.findById.mockResolvedValue({ password: "hashedPassword" });
    bcrypt.compare.mockResolvedValue(false);

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Wrong current" });
  });

  it("should update password if current password matches", async () => {
    const req = {
      user: { id: "1" },
      body: { currentPassword: "currentpassword", newPassword: "newpassword" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue({ password: "hashedPassword" });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("newHashedPassword");

    await resetPassword(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith("1", {
      password: "newHashedPassword",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Sucessfuly updated password",
    });
  });
});
