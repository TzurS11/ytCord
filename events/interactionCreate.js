const { MessageEmbed } = require("discord.js");

module.exports = {
  event: "interactionCreate",
  execute: async (interaction, client) => {
    if (!interaction.isCommand()) return;

    const command = client.interactions.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
