const Discord = require("discord.js");
const mongoose = require("mongoose");
const client = new Discord.Client();

const pfcController = require("./pfc/controller");
const statsController = require("./stats/controller");
const morpController = require("./morp/controller");

require("dotenv").config();

mongoose.connect("mongodb://localhost:27017/miaougames", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

client.on("ready", () => {
  client.user.setActivity("concocter un nouveau jeu");
});

client.on("message", (msg) => {
  if (msg.content.indexOf("?pfc ") === 0) {
    pfcController(client, msg);
  } else if (msg.content.indexOf("?stats ") === 0) {
    statsController(msg);
  } else if (msg.content.indexOf("?morp ") === 0) {
    morpController(client, msg);
  }
});

client.login(process.env.DISCORD_TOKEN);
