import dotenv from 'dotenv';
dotenv.config();

import Discord from 'discord.js';
import { Database, Meeting, Ticket, List } from './index';

const options = {
  intents: Discord.Intents.FLAGS.GUILDS | Discord.Intents.FLAGS.GUILD_MESSAGES,
};

export const client = new Discord.Client(options);

client.on('ready', () => {
  console.log('preminder is ready!');
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!') && message.guild) {
    return;
  }
  const body = ((content: string) => {
    const index = content.indexOf(' ');
    if (index === -1) {
      return '';
    }
    return content.substring(index + 1);
  })(message.content);
  switch (message.content.split(' ')[0]) {
    case '!create':
    case '!c':
      const meeting = new Meeting(body, message);
      await meeting.parseSchedule();
      await meeting.store();
      await meeting.sendButton();
      break;
    case '!participant':
    case '!p':
      await List.showParticipant(body, message);
      break;
  }
});

client.on('interactionCreate', async (interaction) => {
  interaction as Discord.ButtonInteraction;
  if (!interaction.isButton()) {
    return;
  }
  const buttonInteraction = interaction.customId.split('-');
  const buttonInteractionFunc = buttonInteraction[0];
  const meetingId = buttonInteraction[1];
  if (await Ticket.isReplied(meetingId, interaction.user)) {
    await interaction.reply({
      content: 'すでに返信しています！',
      ephemeral: true,
    });
    return;
  }
  switch (buttonInteractionFunc) {
    case 'join':
      await Ticket.join(meetingId, interaction.user, true);
      await interaction.reply({
        content: '参加を表明しました',
        ephemeral: true,
      });
      break;
    case 'notJoin':
      await Ticket.join(meetingId, interaction.user, false);
      await interaction.reply({
        content: '参加を辞退しました',
        ephemeral: true,
      });
      break;
  }
});

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log('please set ENV: DISCORD_BOT_TOKEN');
  process.exit(1);
}

client.login(process.env.DISCORD_BOT_TOKEN);
