class Morp {
  static GAMES = [];

  constructor(client, originalMessage, firstUser, secondUser) {
    this.creator = firstUser;
    this.users = [firstUser, secondUser];
    this.grid = [
      [-1, -1, -1],
      [-1, -1, -1],
      [-1, -1, -1],
    ];
    this.inGame = true;
    this.turn = -1;
    this.controller(client, originalMessage);
  }

  controller(client, originalMessage) {
    originalMessage.channel
      .send(
        "Tu es prêt <@" +
          originalMessage.mentions.users.keys().next().value +
          "> ?"
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
              this.randomStart(msg);
            } else if (react.first().emoji.name === "👎") {
              clearTimeout(this.acceptDelay);
              msg.channel.send("Le match a été refusé ! BOUUUH !!");
              this.deleteMorp();
            }
          })
          .catch(() => {});
      })
      .catch((err) => {
        if (err) throw err;
      });
    this.acceptDelay = setTimeout(() => {
      originalMessage.channel.send("Temps écoulé ! Le match est annulé.");
      this.deleteMorp();
    }, 10000);
    client.on("message", (msg) => {
      if (this.inGame) {
        if (msg.author.id === this.users[this.turn]) {
          if (
            msg.content.length === 3 &&
            (msg.content[0] === "0" ||
              msg.content[0] === "1" ||
              msg.content[0] === "2") &&
            (msg.content[2] === "0" ||
              msg.content[2] === "1" ||
              msg.content[2] === "2")
          ) {
            if (this.grid[msg.content[0]][msg.content[2]] === -1) {
              this.grid[msg.content[0]][msg.content[2]] = this.turn;
              msg.channel.send(this.showGrid());
              this.turn = Number(!this.turn);
              clearTimeout(this.delayTimer);
              this.delay(msg);
              this.verifWin(msg);
            } else {
              msg.channel.send("Déjà pris. Change !");
            }
          } else {
            msg.channel.send("Je n'ai pas compris. Réessayez !");
          }
        }
      }
    });
  }

  delay(msg) {
    this.delayTimer = setTimeout(() => {
      let random = this.randomPick();
      this.grid[random[0]][random[1]] = this.turn;
      msg.channel.send("Tu as pris trop de temps. J'ai joué pour toi.");
      msg.channel.send(this.showGrid());
      this.turn = Number(!this.turn);
      this.delay(msg);
      this.verifWin(msg);
    }, 20000);
  }

  showGrid() {
    let grid = "";
    this.grid.forEach((row) => {
      row.forEach((ele) => {
        switch (ele) {
          case -1:
            grid += "|     ";
            break;
          case 0:
            grid += "| X ";
            break;
          case 1:
            grid += "| O ";
            break;
        }
      });
      grid += "|\n";
    });
    return grid;
  }

  randomStart(msg) {
    let start = Math.floor(Math.random() * Math.floor(2));
    this.turn = start;
    msg.channel.send("<@" + this.users[start] + "> commence !");
    msg.channel.send(this.showGrid());
    this.delay(msg);
  }

  randomPick() {
    let array = [];
    this.grid.forEach((row, index) => {
      let indexC = row.indexOf(-1);
      if (indexC !== -1) {
        array = [index, indexC];
      }
    });
    return array;
  }

  verifWin(msg) {
    for (let i = 0; i <= 1; i++) {
      this.grid.forEach((row) => {
        if (row[0] === i && row[1] === i && row[2] === i) {
          msg.channel.send("<@" + this.users[i] + "> a gagné !");
          this.deleteMorp();
          return;
        }
      });
      for (let column = 0; column <= 2; column++) {
        if (
          this.grid[0][column] === i &&
          this.grid[1][column] === i &&
          this.grid[2][column] === i
        ) {
          msg.channel.send("<@" + this.users[i] + "> a gagné !");
          this.deleteMorp();
          return;
        }
      }
      if (
        this.grid[0][0] === i &&
        this.grid[1][1] === i &&
        this.grid[2][2] === i
      ) {
        msg.channel.send("<@" + this.users[i] + "> a gagné !");
        this.deleteMorp();
        return;
      } else if (
        this.grid[0][2] === i &&
        this.grid[1][1] === i &&
        this.grid[2][0] === i
      ) {
        msg.channel.send("<@" + this.users[i] + "> a gagné !");
        this.deleteMorp();
        return;
      }
    }
    let tie = [];
    this.grid.forEach((row) => {
      tie.push(row.indexOf(-1));
    });
    if (tie[0] === -1 && tie[1] === -1 && tie[2] === -1) {
      msg.channel.send("Égalité !");
      this.deleteMorp();
    }
  }

  deleteMorp() {
    clearTimeout(this.delayTimer);
    this.inGame = false;
    let indexGame = Morp.GAMES.findIndex(
      (ele) => ele.users[0] === this.users[0] && ele.users[1] === this.users[0]
    );
    Morp.GAMES.splice(indexGame, 1);
  }
}

module.exports = Morp;
