const deny = (req, res, next, status, message, redirect = false) =>
  redirect
    ? res.status(status).redirect("/")
    : res.status(status).json({ error: message });

exports.requireLogin = (req, res, next) =>
  req.session.userId
    ? next()
    : deny(req, res, next, 401, "Not authenticated", true);

exports.requireLoginApi = (req, res, next) =>
  req.session.userId ? next() : deny(req, res, next, 401, "Not authenticated");

exports.requireAdmin = (req, res, next) =>
  req.user?.role === "admin"
    ? next()
    : res
        .status(403)
        .render("error", { statusCode: 403, message: "Access denied" });
