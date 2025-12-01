const User = require("../models/User");

// Page-based auth
exports.requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }
  next();
};

// API-based auth (JSON response)
exports.requireLoginApi = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

exports.requireAdmin = async (req, res, next) => {
  if (!req.session.userId) return res.redirect("/");

  const user = await User.findById(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.send("Access denied");
  }

  next();
};

// res.render("any-view", {
//   isAuthenticated: !!req.user,
//   userRole: req.user?.role || "user"
// });

