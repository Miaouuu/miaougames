const Morp = require("./Morp");

module.exports = (client, msg) => {
  if (msg.mentions.users.keys().next().value !== "723355231865274410") {
    Morp.GAMES.push(
      new Morp(
        client,
        msg,
        msg.author.id,
        msg.mentions.users.keys().next().value
      )
    );
  } else {
    msg.channel.send("Vous ne pouvez pas défier MiaouGames !");
  }
};
