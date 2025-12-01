const Booking = require("../models/Booking");
const Experience = require("../models/Experience");

exports.dashboard = async (req, res) => {
  const bookings = await Booking.find()
    .populate("experienceId")
    .populate("userId");

  res.render("admin-dashboard", { bookings });
};

exports.addExperiencePage = (req, res) => {
  res.render("admin");
};

exports.addExperience = async (req, res) => {
  try {
    const {
      title,
      location,
      price,
      duration,
      image,
      description,
      highlights,
      availability
    } = req.body;

    await Experience.create({
      title,
      location,
      price,
      duration,
      image,
      description,
      highlights: highlights.split(",").map(h => h.trim()),
      availability: JSON.parse(availability)
    });

    res.redirect("/explore");
  } catch (err) {
    console.error(err);
    res.status(500).send("Invalid input");
  }
};
