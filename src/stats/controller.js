const User = require("./../models/User");

module.exports = (msg) => {
  User.findOne(
    { discordId: msg.mentions.users.keys().next().value },
    (err, raw) => {
      if (err) throw err;
      if (raw) {
        msg.channel.send(
          raw.wins +
            " W, " +
            raw.looses +
            " L, " +
            raw.tie +
            " E, Total : " +
            raw.total
        );
      } else {
        msg.channel.send("Le joueur n'a pas encore fait une partie.");
      }
    }
  );
};
