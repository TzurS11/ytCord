const { getSong } = require("genius-lyrics-api");

const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActivityType,
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const youtube = require("youtube-search-api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDMPermission(false)
    .setDescription("Get lyrics of a song. Genius API")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Song Name")
        .setRequired(true)
        .setMaxLength(100)
    ),

  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });
      const songName = interaction.options.getString("name");

      let lyricsEmbed = new EmbedBuilder();
      lyricsEmbed.setColor("#ffff7d");
      lyricsEmbed.setFooter({
        text: "Powered by Genius API.",
        iconURL:
          "https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,f_auto,q_auto:eco,dpr_1/v1435674560/mjmgr50tv69vt5pmzeib.png",
      });

      getSong({
        apiKey: process.env.GENIUS_TOKEN,
        title: songName,
        artist: " ",
        optimizeQuery: true,
      }).then((lyrics) => {
        if (lyrics == null) {
          return interaction.followUp({
            content:
              "Lyrics are being fetched from the Genius API.\nThe user input is being used to search lyrics.\nTry to search more specifically next time.",
          });
        }
        lyricsEmbed.setTitle("Lyrics for: " + lyrics.title);
        lyricsEmbed.setURL(lyrics.url);
        lyricsEmbed.setThumbnail(lyrics.albumArt);
        try {
          lyricsEmbed.setDescription(lyrics.lyrics);
          return interaction.followUp({
            embeds: [lyricsEmbed],
          });
        } catch (e) {
          return interaction.followUp({
            content: `There was an error getting lyrics for the song.\nError: The lyrics are way too long for a discord message. (${lyrics.lyrics.length} > 4096)`,
          });
        }
      });
    } catch (e) {
      return interaction.followUp({
        content: "There was an error getting lyrics for the song.",
      });
    }
  },
};
