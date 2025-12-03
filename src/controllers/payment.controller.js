const razorpay = require("../config/razorpay");
const Booking = require("../models/Booking");

exports.createOrder = async (req, res) => {
  const booking = await Booking.findById(req.body.bookingId).populate(
    "experienceId"
  );

  if (
    !booking ||
    booking.paymentStatus === "paid" ||
    String(booking.userId) !== String(req.session.userId)
  ) {
    return res.status(400).json({ error: "Invalid booking" });
  }

  const amount = booking.experienceId.price * booking.qty + 59;

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: booking._id.toString(),
  });

  res.json({ success: true, orderId: order.id, amount });
};

exports.verifyPayment = async (req, res) => {
  const booking = await Booking.findById(req.body.bookingId).populate(
    "experienceId"
  );

  if (!booking) return res.status(404).json({ error: "Booking not found" });

  const totalAmount = booking.experienceId.price * booking.qty + 59;

  booking.paymentStatus = "paid";
  booking.amountPaid = totalAmount;

  await booking.save();

  res.json({ success: true });
};
