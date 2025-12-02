const User = require("../models/User");

exports.getHome = (req, res) => {
  res.render("index");
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.send("User already exists");

  const user = await User.create({ name, email, password });

  req.session.userId = user._id;
  req.session.role = user.role;     

  res.redirect("/explore");
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.send("Invalid credentials");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.send("Invalid credentials");

  req.session.regenerate(err => {
    if (err) return res.send("Session error");

    req.session.userId = user._id;
    req.session.role = user.role;   
    res.redirect("/explore");
  });
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    res.clearCookie("roamly.sid");
    res.redirect("/");
  });
};

