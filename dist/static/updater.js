"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const discord_js_1 = __importDefault(require("discord.js"));
const dayjs_1 = __importDefault(require("dayjs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const index_1 = require("../index");
class Updater {
    static async updateTitle(body, message) {
        const [meetingId, ...title] = body.split(' ');
        if (!meetingId) {
            await message.reply('IDが正しくありません！');
            return;
        }
        const resultMeeting = await index_1.Database.select(['*'], 'meetings', 'WHERE meeting_id = ' + meetingId);
        const meetingData = resultMeeting[0];
        if (!meetingData) {
            await message.reply('IDが正しくありません！');
            return;
        }
        index_1.Database.update('meetings', ['meeting_title'], [index_1.Database.normalizeText(title.join(' '))]);
        const button01 = new discord_js_1.default.MessageButton()
            .setCustomId(`join-${meetingId}`)
            .setStyle('PRIMARY')
            .setLabel('参加');
        const button02 = new discord_js_1.default.MessageButton()
            .setCustomId(`notJoin-${meetingId}`)
            .setStyle('PRIMARY')
            .setLabel('不参加');
        await message.channel.send({
            content: `ID: ${meetingId}\n${meetingData.meeting_title}が${title.join(' ')}に変更されました`,
            components: [
                new discord_js_1.default.MessageActionRow().addComponents(button01),
                new discord_js_1.default.MessageActionRow().addComponents(button02),
            ],
        });
    }
    static async updateSchedule(body, message) {
        const [meetingId, ...schedule] = body.split(' ');
        if (!meetingId) {
            await message.reply('IDが正しくありません！');
            return;
        }
        const resultMeeting = await index_1.Database.select(['*'], 'meetings', 'WHERE meeting_id = ' + meetingId);
        const meetingData = resultMeeting[0];
        if (!meetingData) {
            await message.reply('IDが正しくありません！');
            return;
        }
        const jsonData = {
            app_id: process.env.TIME_BASED_REGULARIZATION_API_ID,
            sentence: schedule.join(' '),
        };
        const newSchedule = await node_fetch_1.default('https://labs.goo.ne.jp/api/chrono', {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: { 'Content-Type': 'application/json' },
        })
            .then((res) => {
            if (res.ok) {
                return res.json();
            }
            else {
                console.log(res);
                throw new Error();
            }
        })
            .then((json) => {
            const list = json.datetime_list;
            const length = list.length;
            return length
                ? dayjs_1.default(list[length - 1][1]).format('YYYY-MM-DDTHH:mm:ss')
                : dayjs_1.default().format('YYYY-MM-DDTHH:mm:ss');
        });
        index_1.Database.update('meetings', ['schedule'], [index_1.Database.normalizeText(newSchedule)]);
        const button01 = new discord_js_1.default.MessageButton()
            .setCustomId(`join-${meetingId}`)
            .setStyle('PRIMARY')
            .setLabel('参加');
        const button02 = new discord_js_1.default.MessageButton()
            .setCustomId(`notJoin-${meetingId}`)
            .setStyle('PRIMARY')
            .setLabel('不参加');
        await message.channel.send({
            content: `ID: ${meetingId}\n${meetingData.schedule}が${newSchedule}に変更されました`,
            components: [
                new discord_js_1.default.MessageActionRow().addComponents(button01),
                new discord_js_1.default.MessageActionRow().addComponents(button02),
            ],
        });
    }
}
exports.default = Updater;
