const Discord = require("discord.js");
const client = new Discord.Client();

const pfcController = require("./pfc/controller");

require("dotenv").config();

client.on("message", (msg) => {
  if (msg.content.indexOf("?pfc ") === 0) {
    pfcController(client, msg);
  }
});

client.login(process.env.DISCORD_TOKEN);
