const User = require("../models/User");

exports.getHome = (req, res) => {
  res.render("index", {
    layout: false,
  });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.exists({ email }))
    return res
      .status(400)
      .render("error", {
        title: "Error",
        statusCode: 400,
        message: "User already exists",
      });

  const user = await User.create({ name, email, password });
  req.session.userId = user._id;
  req.session.role = user.role;

  res.redirect("/explore");
};

exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.redirect("/");

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).render("error", {
      title: "Login Failed",
      statusCode: 401,
      message: "Invalid credentials",
    });
  }

  req.session.regenerate(() => {
    req.session.userId = user._id;
    req.session.role = user.role;
    res.redirect("/explore");
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("roamly.sid");
    res.redirect("/");
  });
};
