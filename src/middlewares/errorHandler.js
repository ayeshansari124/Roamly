module.exports = (err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  // API routes → JSON
  if (req.originalUrl.startsWith("/payment") || req.xhr || req.headers.accept?.includes("json")) {
    return res.status(statusCode).json({ error: message });
  }

  // Page routes → render error page
  res.status(statusCode).render("error", {
    statusCode,
    message
  });
};
