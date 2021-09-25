"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const discord_js_1 = __importDefault(require("discord.js"));
const index_1 = require("./index");
const options = {
    intents: discord_js_1.default.Intents.FLAGS.GUILDS | discord_js_1.default.Intents.FLAGS.GUILD_MESSAGES,
};
exports.client = new discord_js_1.default.Client(options);
exports.client.on('ready', () => {
    console.log('preminder is ready!');
    setInterval(async () => {
        await index_1.Timer.checkSchedule();
    }, 30000);
});
exports.client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!') && message.guild) {
        return;
    }
    const body = ((content) => {
        const index = content.indexOf(' ');
        if (index === -1) {
            return '';
        }
        return content.substring(index + 1);
    })(message.content);
    switch (message.content.split(' ')[0]) {
        case '!create':
        case '!c':
            const meeting = new index_1.Meeting(body, message);
            await meeting.parseSchedule();
            await meeting.store();
            await meeting.sendButton();
            break;
        case '!participant':
        case '!p':
            await index_1.List.showParticipant(body, message);
            break;
        case '!activetimer':
        case '!at':
            await index_1.Timer.active(body, message);
            break;
        case '!canceltimer':
        case '!ct':
            await index_1.Timer.inactive(body, message);
            break;
    }
});
exports.client.on('interactionCreate', async (interaction) => {
    interaction;
    if (!interaction.isButton()) {
        return;
    }
    const buttonInteraction = interaction.customId.split('-');
    const buttonInteractionFunc = buttonInteraction[0];
    const meetingId = buttonInteraction[1];
    if (await index_1.Ticket.isReplied(meetingId, interaction.user)) {
        await interaction.reply({
            content: 'すでに返信しています！',
            ephemeral: true,
        });
        return;
    }
    switch (buttonInteractionFunc) {
        case 'join':
            await index_1.Ticket.join(meetingId, interaction.user, true);
            await interaction.reply({
                content: '参加を表明しました',
                ephemeral: true,
            });
            break;
        case 'notJoin':
            await index_1.Ticket.join(meetingId, interaction.user, false);
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
exports.client.login(process.env.DISCORD_BOT_TOKEN);
