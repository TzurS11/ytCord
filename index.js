const { Client, Collection } = require("discord.js");
const client = new Client({ intents: 3276543, partials: ["CHANNEL"] });

const fs = require("fs");
const path = require("path");
require("dotenv").config();

if (!fs.existsSync("songs")) {
  fs.mkdirSync("songs");
} else {
  fs.readdir("songs", (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join("songs", file), (err) => {
        if (err) throw err;
      });
    }
  });
}

client.aliases = new Collection();
client.interactions = new Collection();

fs.readdir("./events/", (err, files) => {
  const eventHandler = require("./handler/eventHandler");
  eventHandler(err, files, client);
});

client.login(process.env.DISCORD_TOKEN);
