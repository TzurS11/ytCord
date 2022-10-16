const {
  Client,
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionCollector,
} = require("discord.js");
const client = new Client({ intents: 3276543, partials: ["CHANNEL"] });

let defaultPrefix = "!";

const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const youtube = require("youtube-search-api");
require("dotenv").config();

client.aliases = new Collection();
client.interactions = new Collection();

fs.readdir("./events/", (err, files) => {
  const eventHandler = require("./handler/eventHandler");
  eventHandler(err, files, client);
});

client.login(process.env.DISCORD_TOKEN);
