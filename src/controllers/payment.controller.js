const razorpay = require("../config/razorpay");
const Booking = require("../models/Booking");

exports.createOrder = async (req, res) => {
  const booking = await Booking.findById(req.body.bookingId)
    .populate("experienceId");

  if (!booking || booking.paymentStatus === "paid") {
    return res.status(400).json({ error: "Invalid booking" });
  }

  const amount = booking.experienceId.price * booking.qty + 59;

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: booking._id.toString()
  });

  res.json({ orderId: order.id, amount });
};

exports.verifyPayment = async (req, res) => {
  const booking = await Booking.findById(req.body.bookingId);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  booking.paymentStatus = "paid";
  await booking.save();

  res.json({ success: true });
};
