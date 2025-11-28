const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  experienceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Experience",
    required: true
  },
  date: String,
  time: String,
  qty: Number,
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  paymentStatus: {
  type: String,
  enum: ["pending", "paid"],
  default: "pending"
}

  }
});

module.exports = mongoose.model("Booking", bookingSchema);
