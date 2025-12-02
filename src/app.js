const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const expRoutes = require("./routes/experience.routes");
const bookingRoutes = require("./routes/booking.routes");
const paymentRoutes = require("./routes/payment.routes");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

/* =========================
   VIEW ENGINE
========================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* =========================
   BODY PARSERS
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   ✅ SESSION (FIXED)
========================= */
app.use(
  session({
    name: "roamly.sid",

    secret: process.env.SESSION_SECRET || "dev_secret_roamly",

    resave: false,
    saveUninitialized: false,


store: MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: "sessions"
}),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7 // ✅ 7 days persistence
      // secure: true  // enable ONLY when using HTTPS
    }
  })
);

/* =========================
   GLOBAL TEMPLATE VARS
========================= */
app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.userId;
  res.locals.userRole = req.session.role || null;
  next();
});

/* =========================
   STATIC FILES
========================= */
app.use(express.static(path.join(__dirname, "..", "public")));

/* =========================
   ROUTES (AFTER SESSION)
========================= */
app.use("/", authRoutes);
app.use("/", expRoutes);
app.use("/", bookingRoutes);
app.use("/", paymentRoutes);
app.use("/admin", adminRoutes);

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).render("error", {
    statusCode: 404,
    message: "Page not found"
  });
});

/* =========================
   CENTRAL ERROR HANDLER
========================= */
app.use(errorHandler);

module.exports = app;
