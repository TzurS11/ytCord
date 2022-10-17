const { getSong } = require("genius-lyrics-api");

const songSet = require("../songSet");

const { EmbedBuilder } = require("discord.js");

//To lazy to figure out how to make a button handler. this will do because fuck this bullshit.

module.exports = {
  event: "interactionCreate",
  once: false,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    try {
      await interaction.deferReply({ ephemeral: true });
      const client = interaction.client;

      if (interaction.customId.startsWith("lyrics")) {
        let songId = interaction.customId.split(" ")[1];
        let lyricsEmbed = new EmbedBuilder();
        let songName = songSet.Get(songId);
        if (songName == false) {
          return interaction.followUp(
            "There was an error getting the lyrics for the song."
          );
        }
        lyricsEmbed.setFooter({
          text: "Powered by Genius API.",
          iconURL:
            "https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,f_auto,q_auto:eco,dpr_1/v1435674560/mjmgr50tv69vt5pmzeib.png",
        });
        lyricsEmbed.setColor("#ffff7d");
        // lyricsEmbed.setTitle("Lyrics for: " + songName[1]);

        getSong({
          apiKey: process.env.GENIUS_TOKEN,
          title: songName[0],
          artist: " ",
          optimizeQuery: true,
        }).then((lyrics) => {
          if (lyrics == null) {
            return getSong({
              apiKey: process.env.GENIUS_TOKEN,
              title: songName[1],
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
      }
    } catch (e) {
      return interaction.followUp({
        content: "There was an error getting lyrics for the song.",
      });
    }
  },
};
