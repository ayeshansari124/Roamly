const Experience = require("../models/Experience");
const Booking = require("../models/Booking");

function parseAvailability(req, res) {
  let availability = req.body.availability;
  let parsed = {};
  try {
    if (Array.isArray(availability)) {
      parsed = availability[0] ? JSON.parse(availability[0]) : {};
    } else if (typeof availability === "string" && availability.trim()) {
      parsed = JSON.parse(availability.trim());
    }
  } catch (err) {
    res.status(400).render("error", {
      title: "Invalid availability",
      statusCode: 400,
      message: "Time slots data is invalid. Please re-add slots.",
    });
    return null;
  }
  return parsed;
}

exports.adminBookingsPage = async (req, res) => {
  const bookings = await Booking.find()
    .populate("userId", "email")
    .populate("experienceId", "title price")
    .sort("-createdAt");

  res.render("admin-dashboard", {
    title: "Admin - Bookings",
    bookings,
  });
};

exports.addExperiencePage = (req, res) => {
  res.render("admin", {
    title: "Admin - Add Experience",
    experience: null,
    isEdit: false,
  });
};

exports.createExperience = async (req, res) => {
  const { highlights = "", ...data } = req.body;

  const parsedAvailability = parseAvailability(req, res);
  if (parsedAvailability === null) return;

  await Experience.create({
    ...data,
    highlights: highlights
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean),
    availability: parsedAvailability,
  });

  res.redirect("/explore");
};

exports.editExperiencePage = async (req, res) => {
  const experience = await Experience.findById(req.params.id);
  if (!experience) {
    return res.status(404).render("error", {
      title: "Error",
      statusCode: 404,
      message: "Experience not found",
    });
  }

  res.render("admin", {
    title: "Admin - Edit Experience",
    experience,
    isEdit: true,
  });
};

exports.updateExperience = async (req, res) => {
  const { highlights = "", ...data } = req.body;

  const parsedAvailability = parseAvailability(req, res);
  if (parsedAvailability === null) return;

  const updated = await Experience.findByIdAndUpdate(
    req.params.id,
    {
      ...data,
      highlights: highlights
        .split(",")
        .map(h => h.trim())
        .filter(Boolean),
      availability: parsedAvailability
    },
    { new: true }
  );

  if (!updated) {
    return res.status(404).render("error", {
      title: "Error",
      statusCode: 404,
      message: "Experience not found"
    });
  }

  res.redirect("/explore");
};

exports.deleteExperience = async (req, res) => {
  const count = await Booking.countDocuments({
    experienceId: req.params.id,
  });

  if (count) {
    return res.status(400).render("error", {
      title: "Error",
      statusCode: 400,
      message: `Cannot delete. ${count} bookings exist.`,
    });
  }

  await Experience.findByIdAndDelete(req.params.id);
  res.redirect("/explore");
};
