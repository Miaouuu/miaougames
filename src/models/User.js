const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  discordId: String,
  wins: {
    type: Number,
    default: 0,
  },
  looses: {
    type: Number,
    default: 0,
  },
  tie: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
});

module.exports = User = mongoose.model("User", userSchema);
