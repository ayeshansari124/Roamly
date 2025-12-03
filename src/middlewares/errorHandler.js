module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  return req.xhr || req.headers.accept?.includes("json")
    ? res.status(status).json({ error: message })
    : res.status(status).render("error", { statusCode: status, message });
};
