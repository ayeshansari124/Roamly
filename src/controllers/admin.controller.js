const Experience = require("../models/Experience");
const Booking = require("../models/Booking");

/* ================= DASHBOARD ================= */
exports.adminBookingsPage = async (req, res) => {
  const bookings = await Booking.find()
    .populate("userId", "email")
    .populate("experienceId", "title")
    .sort({ createdAt: -1 });

  res.render("admin-dashboard", { bookings });
};

/* ================= ADD PAGE ================= */
exports.addExperiencePage = (req, res) => {
  res.render("admin", {
    experience: null,
    isEdit: false
  });
};

/* ================= CREATE ================= */
exports.createExperience = async (req, res) => {
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
    availability: availability ? JSON.parse(availability) : {}
  });

  res.redirect("/explore");
};

/* ================= EDIT PAGE ================= */
exports.editExperiencePage = async (req, res) => {
  const experience = await Experience.findById(req.params.id);
  if (!experience) return res.status(404).render("error", {
    statusCode: 404,
    message: "Experience not found"
  });

  res.render("admin", {
    experience,
    isEdit: true
  });
};

/* ================= UPDATE ================= */
exports.updateExperience = async (req, res) => {
  try {
    const updated = await Experience.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        highlights: req.body.highlights.split(",").map(h => h.trim()),
        availability: req.body.availability
          ? JSON.parse(req.body.availability)
          : {}
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Experience not found"
      });
    }

    res.redirect("/explore");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      statusCode: 500,
      message: "Failed to update experience"
    });
  }
};


/* ================= DELETE ================= */
exports.deleteExperience = async (req, res) => {
  const expId = req.params.id;

  const bookings = await Booking.find({ experienceId: expId });
  if (bookings.length > 0) {
    return res.status(400).render("error", {
      statusCode: 400,
      message: `Cannot delete. ${bookings.length} bookings exist for this experience.`
    });
  }
  await Experience.findByIdAndDelete(expId);
  res.redirect("/explore");
};
