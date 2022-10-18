const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActivityType,
} = require("discord.js");

const songSet = require("../songSet");

const fs = require("fs");
const ytdl = require("ytdl-core");
const youtube = require("youtube-search-api");

function aboveTimeLimit(text, limit) {
  let seconds = 0;
  let hasHours = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ":") hasHours++;
  }
  text = text.split(":").map((x) => Number(x));
  if (hasHours == 1) {
    seconds += text[0] * 60 + text[1];
  } else {
    seconds += text[0] * 3600 + text[1] * 60 + text[2];
  }
  if (seconds > limit) {
    return true;
  }
  return false;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("song")
    .setDMPermission(false)
    .setDescription("Download a song")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Song Name/url")
        .setRequired(true)
        .setMaxLength(100)
    ),

  execute(interaction, client) {
    interaction.deferReply();
    const songName = interaction.options.getString("name");
    youtube.GetListByKeyword(songName, true, 2).then((res) => {
      if (res.items[0].type == "channel" || res.items.length == 0) {
        return interaction.followUp("Song Doesnt Exist");
      }
      let songId = res.items[0].id;
      if (aboveTimeLimit(res.items[0].length.simpleText, 480) == true) {
        return interaction.followUp("The song is above 8 minutes.");
      }
      let fileName = "songs/" + songId + ".mp3";
      ytdl("https://www.youtube.com/watch?v=" + songId, {
        format: "audioonly",
        quality: "140",
      }).pipe(
        fs.createWriteStream(fileName).on("finish", () => {
          let songEmbed = new EmbedBuilder()
            .setTitle(res.items[0].title)
            .setURL("https://www.youtube.com/watch?v=" + songId)
            .setAuthor({ name: res.items[0].channelTitle })
            .setThumbnail(
              res.items[0].thumbnail.thumbnails[
                res.items[0].thumbnail.thumbnails.length - 1
              ].url
            )
            .setDescription(`${res.items[0].length.simpleText}`);
          let songRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`lyrics ${songId}`)
              .setLabel("Lyrics")
              .setStyle(ButtonStyle.Success)
          );

          client.user.setPresence({
            activities: [
              { name: res.items[0].title, type: ActivityType.Listening },
            ],
            status: "online",
          });

          interaction
            .followUp({
              embeds: [songEmbed],
              components: [songRow],
              files: [fileName],
            })
            .then((message) => {
              songSet.Add(
                songId,
                songName,
                res.items[0].title,
                interaction.user.id,
                35000
              );
              songSet.Debug();
              fs.unlink(fileName, (e) => {});
              setTimeout(function () {
                songRow.components[0].setDisabled(true);
                // songRow.components[0].setStyle(ButtonStyle.Primary);

                message.edit({
                  //   embeds: [songEmbed],
                  components: [songRow],
                  //   files: [fileName],
                });
              }, 30 * 1000);
            });
        })
      );
    });
  },
};
