const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get("user").value;
    const duration = interaction.options.get("duration").value;
    const reason =
      interaction.options.get("reason")?.value || "No reason Provided.";

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Timeout Failed")
        .setDescription("User does not exist in this server.")
        .setTimestamp()
        .setFooter({
          text: `Timeout requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Timeout Failed")
        .setDescription(
          `You can't timeout ${targetUser} The Demon Lord. He is the Owner of the server.`
        )
        .setTimestamp()
        .setFooter({
          text: `Timeout requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (targetUser.user.bot) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Timeout Failed")
        .setDescription(
          "I can't timeout a bot. Because there is no reason to timeout a bot."
        )
        .setTimestamp()
        .setFooter({
          text: `Timeout requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const msDuration = ms(duration);
    if (isNaN(msDuration)) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Timeout Failed")
        .setDescription(
          "Please provide a valid timeout duration (5s, 1m, 1h, 1d etc)."
        )
        .setTimestamp()
        .setFooter({
          text: `Timeout requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (msDuration < 5000 || msDuration > 2.4624e9) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Timeout Failed")
        .setDescription(
          "Timeout duration must be between 5 seconds to 28 days."
        )
        .setTimestamp()
        .setFooter({
          text: `Timeout requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user.
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest Role of the user running. this command
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the Bot.

    if (targetUserRolePosition >= requestUserRolePosition) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Timeout Failed")
        .setDescription(
          `You can't timeout ${targetUser} because they have the Same/Higher Role than you.`
        )
        .setTimestamp()
        .setFooter({
          text: `Timeout requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Timeout Failed")
        .setDescription(
          `You can't timeout ${targetUser} because they have the Same/Higher Role as me.`
        )
        .setTimestamp()
        .setFooter({
          text: `Timeout requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    // Timeout user
    try {
      const { default: prettyMs } = await import("pretty-ms");

      if (targetUser.isCommunicationDisabled()) {
        // Apply timeout
        await targetUser.timeout(msDuration, reason);
        const successEmbed = new EmbedBuilder()
          .setColor(0x57f287) // green
          .setTitle(`✅ User ${targetUser}'s timeout Updated`)
          .setDescription(
            `${targetUser}'s timeout has been updated to ${prettyMs(
              msDuration,
              { verbose: true }
            )}`
          )
          .addFields(
            { name: "User", value: `${targetUser}`, inline: true },
            { name: "Reason", value: reason, inline: true }
          )
          .setTimestamp()
          .setFooter({
            text: `Timeout by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        await interaction.editReply({ embeds: [successEmbed] });
        return;
      }

      // Apply timeout
      await targetUser.timeout(msDuration, reason);

      const successEmbed = new EmbedBuilder()
        .setColor(0x57f287) // green
        .setTitle(`✅ User ${targetUser} is timed out`)
        .setDescription(
          `${targetUser}'s timed out for ${prettyMs(msDuration, {
            verbose: true,
          })}`
        )
        .addFields(
          { name: "User", value: `${targetUser}`, inline: true },
          { name: "Reason", value: reason, inline: true }
        )
        .setTimestamp()
        .setFooter({
          text: `Timeout by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(
        `There was an error while running Timeout command: ${error}`
      );

      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Timeout Failed")
        .setDescription(
          `I couldn't Timeout ${targetUser}. I don't have the necessary permissions.\n Please check my role and permission settings.`
        )
        .setTimestamp()
        .setFooter({
          text: `Timeout requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },

  deleted: false,
  name: "timeout",
  description: "Timeout a user.",
  options: [
    {
      name: "user",
      description: "Select a user.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "duration",
      description: "Duration of timeout (30m, 1h, 1d, 1w).",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for giving timeout to this user.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],
};
