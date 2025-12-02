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

exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).render("error", {
      statusCode: 403,
      message: "Access denied"
    });
  }
  next();
};
