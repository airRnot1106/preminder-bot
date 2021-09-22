import dotenv from 'dotenv';
dotenv.config();

import Discord from 'discord.js';

const options = {
  intents: Discord.Intents.FLAGS.GUILDS | Discord.Intents.FLAGS.GUILD_MESSAGES,
};

const client = new Discord.Client(options);

client.on('ready', () => {
  console.log('preminder is ready!');
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!!') && message.guild) {
    return;
  }
});

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log('please set ENV: DISCORD_BOT_TOKEN');
  process.exit(1);
}

client.login(process.env.DISCORD_BOT_TOKEN);
