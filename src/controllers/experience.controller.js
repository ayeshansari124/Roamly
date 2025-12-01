const Experience = require("../models/Experience");

exports.explore = async (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  let experiences = await Experience.find().lean();

  if (q) {
    experiences = experiences.filter(exp =>
      exp.title.toLowerCase().includes(q) ||
      exp.location.toLowerCase().includes(q)
    );
  }

  res.render("explore", { experiences, query: q });
};

exports.viewExperience = async (req, res) => {
  const experience = await Experience.findById(req.params.id).lean();
  if (!experience) return res.status(404).send("Not found");

  experience.availability = Object.fromEntries(
    Object.entries(experience.availability)
  );

  res.render("experience", { experience });
};
