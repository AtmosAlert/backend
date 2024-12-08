const express = require("express");
const router = express.Router();

const WeatherController = require("../controllers/WeatherController");

router.get("/alerts", WeatherController.getAlerts);

module.exports = router;
