const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Experience = require("../models/Experience");

exports.bookExperience = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { experienceId, date, time, qty } = req.body;

    const experience = await Experience.findById(experienceId).session(session);
    if (!experience) throw new Error("Experience not found");

    const slots = experience.availability.get(date);
    const slot = slots.find(s => s.time === time);
    if (!slot || slot.slots < qty) throw new Error("Slots unavailable");

    slot.slots -= qty;
    await experience.save({ session });

    const [booking] = await Booking.create(
      [{
        userId: req.session.userId,
        experienceId,
        date,
        time,
        qty
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, bookingId: booking._id });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ success: false, message: err.message });
  }
};

exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({
    userId: req.session.userId,
    paymentStatus: "paid"            // 🔥 only show successfully paid bookings
  }).populate("experienceId");

  res.render("my-bookings", { bookings });
};


exports.cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking || booking.status === "cancelled") {
    return res.send("Invalid booking");
  }

  const experience = await Experience.findById(booking.experienceId);
  const slots = experience.availability.get(booking.date);
  const slot = slots.find(s => s.time === booking.time);

  slot.slots += booking.qty;
  booking.status = "cancelled";

  await experience.save();
  await booking.save();

  res.redirect("/my-bookings");
};

exports.checkoutPage = async (req, res) => {
  const Booking = require("../models/Booking");

  const booking = await Booking.findById(req.params.bookingId)
    .populate("experienceId");

  if (!booking) {
    return res.status(404).render("error", {
      statusCode: 404,
      message: "Booking not found"
    });
  }

  const subtotal = booking.experienceId.price * booking.qty;
  const total = subtotal + 59;

  res.render("checkout", {
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
