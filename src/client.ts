import dotenv from 'dotenv';
dotenv.config();

import Discord from 'discord.js';
import { Command, Meeting, Ticket, List, Timer } from './index';

const options = {
  intents: Discord.Intents.FLAGS.GUILDS | Discord.Intents.FLAGS.GUILD_MESSAGES,
};

export const client = new Discord.Client(options);

client.on('ready', () => {
  console.log('preminder is ready!');
  Command.registerInterval();
  setInterval(() => {
    Timer.checkSchedule();
  }, 3000);
});

client.on('messageCreate', async (message) => {
  const prefix = '?';
  if (!message.content.startsWith(prefix) && message.guild) {
    return;
  }
  const [command, ...args] = message.content.slice(prefix.length).split(' ');
  const body = args.join(' ');
  console.log('--------');
  console.log(`Command: ${command}\nArgs: ${body}`);
  console.log('--------\n');
  console.log(body);
  switch (command) {
    case 'create':
    case 'c':
      if (!body) {
        await message.reply(
          'タイトルを設定してください！(!c [タイトル] [日程?])'
        );
        return;
      }
      if (body.length > 1600) {
        await message.reply('タイトルは1600文字以下にしてください！');
        return;
      }
      await (async () => {
        const meeting = new Meeting(body, message);
        await meeting.parseSchedule();
        await meeting.store();
        await meeting.sendButton();
      })();
      break;
    case 'participant':
    case 'p':
      await List.showParticipant(body, message);
      break;
    case 'activetimer':
    case 'at':
      await Timer.active(body, message);
      break;
    case 'canceltimer':
    case 'ct':
      await Timer.inactive(body, message);
      break;
    case 'cat':
      if (!body) {
        await message.reply(
          'タイトルを設定してください！(!cat [タイトル] [日程?])'
        );
        return;
      }
      if (body.length > 1600) {
        await message.reply('タイトルは1600文字以下にしてください！');
        return;
      }
      await (async () => {
        const meeting = new Meeting(body, message);
        await meeting.parseSchedule();
        await meeting.store();
        await meeting.sendButton();
        await Timer.active(meeting.meetingData!.meetingId!.toString(), message);
      })();
      break;
    case 'help':
      await Command.showHelp(message);
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
