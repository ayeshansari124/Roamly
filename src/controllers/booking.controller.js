const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Experience = require("../models/Experience");

exports.bookExperience = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { experienceId, date, time, qty } = req.body;

    const experience = await Experience.findById(experienceId).session(session);
    if (!experience) throw Error("Experience not found");

    const slot = experience.availability.get(date)?.find(s => s.time === time);
    if (!slot || slot.slots < qty) throw Error("Slots unavailable");

    slot.slots -= qty;
    await experience.save({ session });

    const [booking] = await Booking.create(
      [{ userId: req.session.userId, experienceId, date, time, qty }],
      { session }
    );

    await session.commitTransaction();
    res.json({ success: true, bookingId: booking._id });
  } catch (err) {
    await session.abortTransaction();
    res.json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

exports.checkoutPage = async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId)
    .populate("experienceId");

  if (!booking) {
    return res.status(404).render("error", {
      title: "Not Found",
      statusCode: 404,
      message: "Booking not found"
    });
  }

  const subtotal = booking.experienceId.price * booking.qty;
  const total = subtotal + 59;

  res.render("checkout", {
    title: "Checkout",
    bookingId: booking._id,
    experience: booking.experienceId,
    date: booking.date,
    time: booking.time,
    qty: booking.qty,
    subtotal,
    total,
    razorpayKey: process.env.RAZORPAY_KEY_ID
  });
};

exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({
    userId: req.session.userId,
    paymentStatus: "paid"
  }).populate("experienceId");

  res.render("my-bookings", { title: "My Bookings", bookings });
};

exports.cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking || booking.status === "cancelled") {
    return res.status(400).render("error", {
      title: "Error",
      statusCode: 400,
      message: "Invalid booking"
    });
  }

  const experience = await Experience.findById(booking.experienceId);
  const slot = experience.availability
    .get(booking.date)
    .find(s => s.time === booking.time);

  slot.slots += booking.qty;
  booking.status = "cancelled";

  await experience.save();
  await booking.save();

  res.redirect("/my-bookings");
};
