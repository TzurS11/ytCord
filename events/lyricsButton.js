const { getSong } = require("genius-lyrics-api");

const songSet = require("../songSet");

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

//To lazy to figure out how to make a button handler. this will do because fuck this bullshit.

module.exports = {
  event: "interactionCreate",
  once: false,
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    try {
      await interaction.deferReply({ ephemeral: true });

      if (interaction.customId.startsWith("lyrics")) {
        let songId = interaction.customId.split(" ")[1];
        let lyricsEmbed = new EmbedBuilder();
        let songInfo = songSet.Get(songId);
        if (songInfo != false && interaction.user.id != songInfo[2]) {
          return interaction.followUp(
            "You are not the owner of the message that you are trying to interact with."
          );
        }
        if (songInfo == false) {
          let errorRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`lyrics ${songId}`)
              .setLabel("Lyrics")
              .setStyle(ButtonStyle.Success)
              .setDisabled(true)
          );
          interaction.message.edit({ components: [errorRow] });
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
        // lyricsEmbed.setTitle("Lyrics for: " + songInfo[1]);

        getSong({
          apiKey: process.env.GENIUS_TOKEN,
          title: songInfo[0],
          artist: " ",
          optimizeQuery: true,
        }).then((lyrics) => {
          if (lyrics == null) {
            return getSong({
              apiKey: process.env.GENIUS_TOKEN,
              title: songInfo[1],
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
