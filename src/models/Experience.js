const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    time: String,
    slots: Number
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema({
  title: String,
  location: String,
  price: Number,
  duration: String,
  image: String,
  description: String,
  highlights: [String],

  availability: {
    type: Map,
    of: [availabilitySchema]
  }
});

module.exports = mongoose.model("Experience", experienceSchema);
