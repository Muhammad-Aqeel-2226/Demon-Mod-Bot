const { Client, Message, EmbedBuilder } = require("discord.js");
const Level = require("../../models/Level");
const calculateLevelXp = require("../../utils/calculateLevelXp");

const getRandomXp = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 *
 * @param {Client} client
 * @param {Message} message
 */

module.exports = async (client, message) => {
  if (!message.inGuild() || message.author.bot) return;

  const xpToGive = getRandomXp(5, 10);

  const query = {
    userId: message.author.id,
    guildId: message.guild.id,
  };

  try {
    const level = await Level.findOne(query);

    if (level) {
      level.xp += xpToGive;

      if (level.xp > calculateLevelXp(level.level)) {
        level.xp = 0;
        level.level += 1;

        const embed = new EmbedBuilder()
          .setColor(0x57f287) // Green
          .setTitle("🎉 Level Up!")
          .setDescription(
            `${message.member} just advanced to **Level ${level.level}**!`
          )
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
          .setTimestamp();

        message.channel.send({ embeds: [embed] });
      }
      await level.save().catch((e) => {
        console.log(`Error while Updating XP: ${error}`);
        return;
      });
    } else {
      // if level doesn't exist
      // create new level

      const newLevel = new Level({
        userId: message.author.id,
        guildId: message.guild.id,
        xp: xpToGive,
      });

      await newLevel.save();
    }
  } catch (error) {
    console.log(`Error while giving XP: ${error}`);
  }
};
