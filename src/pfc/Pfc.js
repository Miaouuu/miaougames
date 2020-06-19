const User = require("./../models/User");

class Pfc {
  static GAMES = [];

  constructor(client, originalMessage, firstUser, secondUser) {
    this.creator = firstUser;
    this.users = [firstUser, secondUser];
    this.answers = ["", ""];
    this.inGame = true;
    this.step = 0;
    this.controller(client, originalMessage);
  }

  controller(client, originalMessage) {
    originalMessage.channel
      .send(
        "Tu es prêt <@" +
          originalMessage.mentions.users.keys().next().value +
          "> ? [Oui/Non]"
      )
      .then((msg) => {
        msg.react("👍");
        msg.react("👎");
        msg
          .awaitReactions(
            (reaction, user) =>
              user.id === this.users[1] &&
              (reaction.emoji.name === "👍" || reaction.emoji.name === "👎"),
            { max: 1, time: 10000 }
          )
          .then((react) => {
            if (react.first().emoji.name === "👍") {
              clearTimeout(this.acceptDelay);
              msg.channel.send("Le match a été accepté ! Préparez-vous !");
              this.step++;
              this.countdown(msg);
            } else if (react.first().emoji.name === "👎") {
              clearTimeout(this.acceptDelay);
              msg.channel.send("Le match a été refusé ! BOUUUH !!");
              this.deletePfc();
            }
          })
          .catch(() => {});
      })
      .catch((err) => {
        if (err) throw err;
      });
    this.acceptDelay = setTimeout(() => {
      originalMessage.channel.send("Temps écoulé ! Le match est annulé.");
      this.deletePfc();
    }, 10000);
    client.on("message", (msg) => {
      if (this.inGame) {
        switch (this.step) {
          case 0:
            this.accept(msg);
            break;
          case 1:
            this.verify(msg);
            break;
        }
      }
    });
  }

  accept(msg) {
    if (msg.author.id === this.users[1]) {
      if (msg.content.toUpperCase().indexOf("OUI") !== -1) {
        clearTimeout(this.acceptDelay);
        msg.channel.send("Le match a été accepté ! Préparez-vous !");
        this.step++;
        this.countdown(msg);
      } else if (msg.content.toUpperCase().indexOf("NON") !== -1) {
        clearTimeout(this.acceptDelay);
        msg.channel.send("Le match a été refusé ! BOUUUH !!");
        this.deletePfc();
      }
    }
  }

  countdown(msg) {
    let count = 4;
    this.countdownTimer = setInterval(() => {
      count--;
      msg.channel.send(count);
      if (count === 0) {
        clearInterval(this.countdownTimer);
        this.delay(msg);
      }
    }, 1000);
  }

  delay(msg) {
    this.delayChoose = setTimeout(() => {
      msg.channel.send("Un joueur n'a pas répondu !");
      this.deletePfc();
    }, 3000);
  }

  verify(msg) {
    let user = this.users.indexOf(msg.author.id);
    if (user !== -1) {
      if (!this.countdownTimer._destroyed) {
        clearTimeout(this.delayChoose);
        clearInterval(this.countdownTimer);
        msg.channel.send("BOUUUHH !!! Faux départ. Fin du jeu.");
        this.deletePfc();
      }
      if (this.answers[user] === "") {
        switch (msg.content.toUpperCase()) {
          case "CISEAUX":
            this.answers[user] = "C";
            break;
          case "CISEAU":
            this.answers[user] = "C";
            break;
          case "PAPIER":
            this.answers[user] = "F";
            break;
          case "FEUILLE":
            this.answers[user] = "F";
            break;
          case "PIERRE":
            this.answers[user] = "P";
            break;
          case "CAILLOU":
            this.answers[user] = "P";
            break;
        }
        if (this.answers[0] !== "" && this.answers[1] !== "") {
          clearTimeout(this.delayChoose);
          this.allCases(msg);
        }
      }
    }
  }

  allCases(msg) {
    if (this.answers[0] === this.answers[1]) {
      msg.channel.send("Égalité !");
      this.updateUser(0, 0, 0, 1);
      this.updateUser(1, 0, 0, 1);
    } else if (this.answers[0] === "P") {
      if (this.answers[1] === "C") {
        msg.channel.send("<@" + this.users[0] + "> a gagné !");
        this.updateUser(0, 1, 0, 0);
        this.updateUser(1, 0, 1, 0);
      } else if (this.answers[1] === "F") {
        msg.channel.send("<@" + this.users[1] + "> a gagné !");
        this.updateUser(0, 0, 1, 0);
        this.updateUser(1, 1, 0, 0);
      }
    } else if (this.answers[0] === "F") {
      if (this.answers[1] === "C") {
        msg.channel.send("<@" + this.users[1] + "> a gagné !");
        this.updateUser(0, 0, 1, 0);
        this.updateUser(1, 1, 0, 0);
      } else if (this.answers[1] === "P") {
        msg.channel.send("<@" + this.users[0] + "> a gagné !");
        this.updateUser(0, 1, 0, 0);
        this.updateUser(1, 0, 1, 0);
      }
    } else if (this.answers[0] === "C") {
      if (this.answers[1] === "P") {
        msg.channel.send("<@" + this.users[1] + "> a gagné !");
        this.updateUser(0, 0, 1, 0);
        this.updateUser(1, 1, 0, 0);
      } else if (this.answers[1] === "F") {
        msg.channel.send("<@" + this.users[0] + "> a gagné !");
        this.updateUser(0, 1, 0, 0);
        this.updateUser(1, 0, 1, 0);
      }
    }
    this.deletePfc();
  }

  updateUser(user, win, loose, tie) {
    User.updateOne(
      { discordId: this.users[user] },
      { $inc: { wins: win, looses: loose, tie: tie, total: 1 } },
      { upsert: true, setDefaultsOnInsert: true },
      (err) => {
        if (err) throw err;
      }
    );
  }

  deletePfc() {
    this.inGame = false;
    let indexGame = Pfc.GAMES.findIndex(
      (ele) => ele.users[0] === this.users[0] && ele.users[1] === this.users[0]
    );
    Pfc.GAMES.splice(indexGame, 1);
  }
}

module.exports = Pfc;
