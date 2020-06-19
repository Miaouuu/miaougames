const Pfc = require("./Pfc");

module.exports = (client, msg) => {
  Pfc.GAMES.push(
    new Pfc(client, msg, msg.author.id, msg.mentions.users.keys().next().value)
  );
};
