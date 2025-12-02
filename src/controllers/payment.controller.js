// src/controllers/payment.controller.js
const razorpay = require("../config/razorpay");
const Booking = require("../models/Booking");

exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId).populate("experienceId");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ error: "Booking already paid" });
    }

    // Optional: enforce booking belongs to logged-in user
    if (String(booking.userId) !== String(req.session.userId)) {
      return res.status(403).json({ error: "Not your booking" });
    }

    const baseAmount = booking.experienceId.price * booking.qty;
    const totalAmount = baseAmount + 59; // flat tax/fee

    const order = await razorpay.orders.create({
      amount: totalAmount * 100,  // paise
      currency: "INR",
      receipt: booking._id.toString()
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: totalAmount
    });
  } catch (err) {
    console.error("❌ Error in createOrder:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // NOTE: For real production, you should verify Razorpay signature here.
    booking.paymentStatus = "paid";
    await booking.save();

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Error in verifyPayment:", err);
    return res.status(500).json({ error: "Payment verification failed" });
  }
};
