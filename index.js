const mongoose = require("mongoose");
const Experience = require("./models/Experience");
const Booking = require("./models/Booking");
const Razorpay = require("razorpay");
const session = require("express-session");
const User = require("./models/User");
const express = require("express");
require("dotenv").config();

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/roamly")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

app.use(session({
  name: "roamly.sid",
  secret: process.env.SESSION_SECRET || "roamly_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,        // ✅ JS cannot access cookie
    secure: false,         // ✅ change to true when HTTPS
    sameSite: "lax",       // ✅ CSRF protection
    maxAge: 1000 * 60 * 60 * 24 // ✅ 1 day
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

/* ---------- AUTH HELPERS ---------- */

function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect("/");
  next();
}

// For API-style routes (used by fetch) → return JSON, not redirects
function requireLoginApi(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

async function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.redirect("/");
  const user = await User.findById(req.session.userId);
  if (!user || user.role !== "admin") return res.send("Access denied");
  next();
}

/* ---------- AUTH ROUTES ---------- */

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.send("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password
  });

  req.session.userId = user._id;
  res.redirect("/explore");
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.send("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.send("Invalid credentials");
  }

  // ✅ Regenerate session (prevents fixation attacks)
  req.session.regenerate(err => {
    if (err) return res.send("Session error");

    req.session.userId = user._id;
    res.redirect("/explore");
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send("Logout failed");

    res.clearCookie("roamly.sid");
    res.redirect("/");
  });
});


/* ---------- ADMIN ---------- */

app.get("/admin/dashboard", requireAdmin, async (req, res) => {
  const bookings = await Booking.find()
    .populate("experienceId")
    .populate("userId");
  res.render("admin-dashboard", { bookings });
});

app.get("/admin", (req, res) => {
  res.render("admin");
});

app.post("/admin/trips", async (req, res) => {
  try {
    const {
      title,
      location,
      price,
      duration,
      image,
      description,
      highlights,
      availability
    } = req.body;

    const experience = new Experience({
      title,
      location,
      price,
      duration,
      image,
      description,
      highlights: highlights.split(",").map(h => h.trim()),
      availability: JSON.parse(availability)
    });

    await experience.save();
    res.redirect("/explore");
  } catch (err) {
    console.error(err);
    res.status(500).send("Invalid input");
  }
});

/* ---------- EXPLORE & EXPERIENCE ---------- */

app.get("/explore", async (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  let experiences = await Experience.find().lean();

  if (q) {
    experiences = experiences.filter(exp =>
      exp.title.toLowerCase().includes(q) ||
      exp.location.toLowerCase().includes(q)
    );
  }

  res.render("explore", { experiences, query: q });
});

app.get("/experience/:id", async (req, res) => {
  const experience = await Experience.findById(req.params.id).lean();
  if (!experience) return res.status(404).send("Not found");

  experience.availability = Object.fromEntries(
    Object.entries(experience.availability)
  );

  res.render("experience", { experience });
});

/* ---------- BOOKING CREATION ---------- */

app.post("/book", requireLogin, async (req, res) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const { experienceId, date, time, qty } = req.body;

    const experience = await Experience.findById(experienceId).session(dbSession);
    if (!experience) throw new Error("Experience not found");

    const slots = experience.availability.get(date);
    const slot = slots.find(s => s.time === time);
    if (!slot || slot.slots < qty) throw new Error("Slots unavailable");

    slot.slots -= qty;
    await experience.save({ session: dbSession });

    const bookingArr = await Booking.create([{
      userId: req.session.userId,
      experienceId,
      date,
      time,
      qty,
      status: "confirmed",
      paymentStatus: "pending"
    }], { session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    res.json({ success: true, bookingId: bookingArr[0]._id });
  } catch (err) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error(err);
    res.json({ success: false, message: err.message });
  }
});

/* ---------- CHECKOUT & MY BOOKINGS ---------- */

app.get("/checkout/:bookingId", requireLogin, async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId)
    .populate("experienceId");

  if (!booking) return res.status(404).send("Booking not found");

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
    razorpayKey: process.env.RAZORPAY_KEY_ID // ✅ PASS IT
  });
});




app.get("/my-bookings", requireLogin, async (req, res) => {
  const bookings = await Booking.find({ userId: req.session.userId })
    .populate("experienceId");

  res.render("my-bookings", { bookings });
});

/* ---------- CANCEL BOOKING ---------- */

app.post("/booking/:id/cancel", requireLogin, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).send("Booking not found");
  if (booking.status === "cancelled") return res.status(400).send("Already cancelled");

  const experience = await Experience.findById(booking.experienceId);
  if (!experience) return res.status(404).send("Experience not found");

  const slots = experience.availability.get(booking.date);
  const slot = slots.find(s => s.time === booking.time);
  if (!slot) return res.status(500).send("Slot mismatch");

  slot.slots += booking.qty;
  booking.status = "cancelled";

  await experience.save();
  await booking.save();

  res.redirect("/my-bookings");
});

/* ---------- RAZORPAY PAYMENT ROUTES ---------- */

// Create Razorpay order
app.post("/payment/create-order", requireLoginApi, async (req, res) => {
  console.log("🔥 /payment/create-order", req.body);

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

  res.json({
    orderId: order.id,
    amount,
    bookingId: booking._id
  });
});

// Verify payment (simplified)
app.post("/payment/verify", requireLoginApi, async (req, res) => {
  const booking = await Booking.findById(req.body.bookingId);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  booking.paymentStatus = "paid";
  await booking.save();

  res.json({ success: true });
});

/* ---------- SERVER ---------- */

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
