const Morp = require("./Morp");

module.exports = (client, msg) => {
  Morp.GAMES.push(
    new Morp(client, msg, msg.author.id, msg.mentions.users.keys().next().value)
  );
};
