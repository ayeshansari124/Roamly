const expressLayouts = require("express-ejs-layouts");
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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "partials/layout");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

app.use(
  session({
    name: "roamly.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 604800000,
    },
  })
);

app.use(express.static(path.join(__dirname, "..", "public")));

app.use((req, res, next) => {
  if (req.session.userId) {
    req.user = { _id: req.session.userId, role: req.session.role };
    res.locals.isAuthenticated = true;
    res.locals.userRole = req.session.role;
  } else {
    res.locals.isAuthenticated = false;
    res.locals.userRole = null;
  }
  next();
});

app.use((req, res, next) => {
  res.locals.title = "Roamly";
  next();
});

app.use("/", authRoutes);
app.use("/", expRoutes);
app.use("/", bookingRoutes);
app.use("/", paymentRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) =>
  res
    .status(404)
    .render("error", { statusCode: 404, message: "Page not found" })
);

app.use(errorHandler);

module.exports = app;
