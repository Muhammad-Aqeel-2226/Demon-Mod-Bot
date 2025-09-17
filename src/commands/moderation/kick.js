const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get("user").value;
    const reason =
      interaction.options.get("reason")?.value || "No reason Provided.";

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Kick Failed")
        .setDescription("User does not exist in this server.")
        .setTimestamp()
        .setFooter({
          text: `Kick requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Kick Failed")
        .setDescription(
          `You can't kick ${targetUser} The Demon Lord. He is the Owner of the server.`
        )
        .setTimestamp()
        .setFooter({
          text: `Kick requested by ${interaction.user.tag}`,
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
        .setTitle("❌ Kick Failed")
        .setDescription(
          `You can't kick ${targetUser} because they have the Same/Higher Role than you.`
        )
        .setTimestamp()
        .setFooter({
          text: `Kick requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Kick Failed")
        .setDescription(
          `You can't kick ${targetUser} because they have the Same/Higher Role as me.`
        )
        .setTimestamp()
        .setFooter({
          text: `Kick requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    // Kick the user

    try {
      await targetUser.kick({ reason });

      const successEmbed = new EmbedBuilder()
        .setColor(0x57f287) // green
        .setTitle(`✅ User ${targetUser} is Kicked`)
        .addFields(
          { name: "User", value: `${targetUser}`, inline: true },
          { name: "Reason", value: reason, inline: true }
        )
        .setTimestamp()
        .setFooter({
          text: `Kicked by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [successEmbed] });
      return;
    } catch (error) {
      console.error(`There was an error while running kick command: ${error}`);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Kick Failed")
        .setDescription(
          `I couldn't ${targetUser}. I don't have the necessary permissions.\n Please check my role and permission settings.`
        )
        .setTimestamp()
        .setFooter({
          text: `Kick requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },

  deleted: false,
  name: "kick",
  description: "kicks user from this server.",
  options: [
    {
      name: "user",
      description: "Select a user.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "Reason for kickning this user.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
};
