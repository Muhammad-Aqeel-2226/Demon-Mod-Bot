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
        .setTitle("❌ Ban Failed")
        .setDescription("User does not exist in this server.")
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Ban Failed")
        .setDescription(
          "You can't ban The Demon Lord. He is the Owner of the server."
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user.
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest Role of the user running. this command
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the Bot.

    if (targetUserRolePosition >= requestUserRolePosition) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Ban Failed")
        .setDescription(
          "You can't ban that User because they have the Same/Higher Role than you."
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Ban Failed")
        .setDescription(
          "You can't ban that User because they have the Same/Higher Role as me."
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    // Ban the user

    try {
      await targetUser.ban({ reason });

      const successEmbed = new EmbedBuilder()
        .setColor(0x57f287) // green
        .setTitle("✅ User Banned")
        .addFields(
          { name: "User", value: `${targetUser}`, inline: true },
          { name: "Reason", value: reason, inline: true }
        )
        .setTimestamp()
        .setFooter({
          text: `Banned by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [successEmbed] });
      return;
    } catch (error) {
      console.error(`There was an error while running ban command: ${error}`);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245) // red
        .setTitle("❌ Ban Failed")
        .setDescription(
          "I couldn't ban that user. I don't have the necessary permissions.\nPlease check my role and permission settings."
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },

  deleted: false,
  name: "ban",
  description: "bans user from this server.",
  options: [
    {
      name: "user",
      description: "Select a user.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "Reason for banning this user.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    // {
    //   name: "duration",
    //   description: "How long this user will be banned from this server.",
    //   type: ApplicationCommandOptionType.String,
    //   required: false,
    // },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};
