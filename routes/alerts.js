const express = require("express");
const router = express.Router();

const AlertsController = require("../controllers/AlertsController");

router.get("/", AlertsController.getAlerts);

module.exports = router;
