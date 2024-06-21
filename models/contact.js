const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
  name: { type: String, require: true },
  emailContact: { type: String, require: true },
  // phone: { type: Number },
  // messages: [
  //   {
  //     message: { type: String, require: true },
  //     date: { type: String, require: true },
  //   },
  // ],
  // toAnswer: { type: Boolean, default: true },
});

module.exports = mongoose.model('Contact', contactSchema);
