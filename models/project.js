const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
  title: { type: String, required: true },
  subTitle: { type: String, required: true },
  image_cover: { type: String, required: true },
  image_min: { type: String, required: true },
  description: { type: String, required: true },
  problematic: { type: String },
  site: { type: String },
  github: { type: String },
  technologies: [{ type: String, required: true }],
  like: { type: Number, default: 0 },
});

module.exports = mongoose.model('Project', projectSchema);
