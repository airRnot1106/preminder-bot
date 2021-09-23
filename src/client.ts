import dotenv from 'dotenv';
dotenv.config();

import Discord from 'discord.js';
import { Database, Meeting } from './index';

const options = {
  intents: Discord.Intents.FLAGS.GUILDS | Discord.Intents.FLAGS.GUILD_MESSAGES,
};

const client = new Discord.Client(options);

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
      const meeting = new Meeting(message, body);
      await meeting.parseSchedule();
      await meeting.store();
      await meeting.sendButton();
      break;
  }
});

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log('please set ENV: DISCORD_BOT_TOKEN');
  process.exit(1);
}

client.login(process.env.DISCORD_BOT_TOKEN);
