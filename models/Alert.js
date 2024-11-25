const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const alertSchema = new Schema(
  {
    areas: { type: [String], required: true }, // Array of areas affected by the alert
    geocode: { type: [String], required: true }, // Array of geocode identifiers (UGC codes)
    senderName: { type: String, required: true }, // Name of the sender of the alert
    headline: { type: String, required: true }, // Headline for the alert
    description: { type: String }, // Optional detailed description of the alert
    sent: { type: Date, required: true }, // Time when the alert was sent
    effective: { type: Date, required: true }, // Time when the alert becomes effective
    eventStartTime: { type: Date, required: true }, // Expected start time of the event
    expires: { type: Date, required: true }, // Expiry time of the alert
    eventEndTime: { type: Date }, // Expected end time of the event
    severity: {
      type: String,
      enum: ["Minor", "Moderate", "Severe", "Extreme"],
      required: true,
    }, // Severity of the alert
    certainty: {
      type: String,
      enum: ["Observed", "Likely", "Possible", "Unlikely", "Unknown"],
      required: true,
    }, // Certainty level
    urgency: {
      type: String,
      enum: ["Immediate", "Expected", "Future", "Past", "Unknown"],
      required: true,
    }, // Urgency of the alert
    event: { type: String, required: true }, // The type of event the alert is about
    sender: { type: String, required: true }, // Sender of the alert
  },
  { timestamps: true }
);

const Alert = mongoose.model("Alert", alertSchema);
module.exports = { Alert, alertSchema };
