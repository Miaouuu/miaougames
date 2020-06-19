const User = require("./../models/User");

module.exports = (msg) => {
  User.findOne(
    { discordId: msg.mentions.users.keys().next().value },
    (err, raw) => {
      if (err) throw err;
      msg.channel.send(
        raw.wins + " W, " + raw.looses + " L, Total : " + raw.total
      );
    }
  );
};
