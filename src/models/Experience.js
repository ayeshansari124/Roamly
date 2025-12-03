const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    slots: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  duration: { type: String, required: true },
  image: { type: String },
  description: { type: String, required: true },
  highlights: { type: [String], default: [] },

  availability: {
    type: Map,
    of: [availabilitySchema],
    default: {}
  }
});

experienceSchema.index({ title: 1, location: 1 });

module.exports = mongoose.model("Experience", experienceSchema);
