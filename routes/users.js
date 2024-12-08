const express = require("express");
const router = express.Router();

const UsersController = require("../controllers/UsersController");

router.get("/me", UsersController.getMebyId); // Returns logged in user
router.get("/me/alertpref", UsersController.getAlertPreferences);

router.put("/me", UsersController.updateMeById);
router.put("/me/password", UsersController.resetPassword);
router.put("/me/alertpref", UsersController.setAlertPreferences); // Returns users based on search (only public info)

router.get("/:userId", UsersController.getUserById);
router.get("/", UsersController.searchUser); // Returns users based on search (only public info)
// router.delete("/me")

module.exports = router;