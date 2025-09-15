const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ping",
  description: "Pong! Check if bot is online or not.",

  callback: async (client, interaction) => {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();
    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle("🏓 Pong!")
      .addFields(
        { name: "Client Latency", value: `${ping}ms`, inline: true },
        {
          name: "WebSocket Latency",
          value: `${client.ws.ping}ms`,
          inline: true,
        }
      )
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.editReply({ embeds: [embed] });
  },
};
