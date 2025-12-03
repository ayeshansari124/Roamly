const Experience = require("../models/Experience");

exports.explore = async (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  const experiences = q
    ? await Experience.find({
        $or: [{ title: new RegExp(q, "i") }, { location: new RegExp(q, "i") }],
      }).lean()
    : await Experience.find().lean();

  res.render("explore", { title: "Explore - Experiences", experiences, query: q });
};

exports.viewExperience = async (req, res) => {
  const exp = await Experience.findById(req.params.id);
  if (!exp) {
    return res.status(404).render("error", {
      title: "Not Found",
      statusCode: 404,
      message: "Experience not found",
    });
  }

  let availability = {};
  if (exp.availability instanceof Map) {
    availability = Object.fromEntries(exp.availability);
  } else {
    availability = exp.availability || {};
  }

  const experience = {
    ...exp.toObject(),
    availability,
  };

  res.render("experience", {
    title: experience.title,
    experience,
  });
};
