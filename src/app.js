const express = require("express");
const path = require("path");
const session = require("express-session");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const expRoutes = require("./routes/experience.routes");
const bookingRoutes = require("./routes/booking.routes");
const paymentRoutes = require("./routes/payment.routes");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "roamly.sid",
    secret: process.env.SESSION_SECRET || "dev_secret_roamly", // keep stable
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 🔥 7 days login persistence
      // secure: true  // turn this on in production over HTTPS
    }
  })
);

app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.userId;
  res.locals.userRole = req.session.role || null;
  next();
});

// Static files AFTER session is fine
app.use(express.static(path.join(__dirname, "..", "public")));

// ✅ ROUTES AFTER SESSION
app.use(authRoutes);
app.use(adminRoutes);
app.use(expRoutes);
app.use(bookingRoutes);
app.use(paymentRoutes);

// 404
app.use((req, res) => {
  res.status(404).render("error", {
    statusCode: 404,
    message: "Page not found"
  });
});

// ❗ Central error handler LAST
app.use(errorHandler);

module.exports = app;
