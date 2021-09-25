"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const index_1 = require("../index");
class Timer {
    static async active(meetingId, message) {
        await this.toggleTimer(true, meetingId, message);
        await message.reply(`ID: ${meetingId}のタイマーをONにしました`);
    }
    static async inactive(meetingId, message) {
        await this.toggleTimer(false, meetingId, message);
        await message.reply(`ID: ${meetingId}のタイマーをOFFにしました`);
    }
    static async toggleTimer(state, meetingId, message) {
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
        await index_1.Database.update('alerts', ['should_alert'], [state], 'WHERE alert_id = ' + meetingData.alert_id);
    }
    static async checkSchedule() {
        const resultAlerts = await index_1.Database.select(['*'], 'alerts', 'WHERE should_alert = ' + true + ' AND is_alerted = ' + false);
        const alertIds = resultAlerts.map((alert) => alert.alert_id);
        if (!alertIds.length) {
            return;
        }
        const resultMeetings = await index_1.Database.select(['*'], 'meetings', 'WHERE alert_id = ' + alertIds.join(' OR alert_id = '));
        const schedules = resultMeetings.map((meeting) => meeting.schedule);
        const now = dayjs_1.default();
        for (let i = 0; i < schedules.length; i++) {
            const msec = dayjs_1.default(schedules[i]).diff(now);
            console.log(msec);
            if (msec <= 0) {
                await this.alert(resultMeetings[i]);
            }
        }
    }
    static async alert(meetingData) {
        const textChannel = index_1.client.channels.cache.get(meetingData.text_channel_id);
        const str = `ID: ${meetingData.meeting_id}\n主催者: ${meetingData.organizer_name}\n日程: ${meetingData.schedule}\nタイトル: ${meetingData.meeting_title}\n\n**時間になりました！**`;
        await textChannel.send({
            embeds: [
                {
                    color: 10038562,
                    fields: [{ name: ':alarm_clock:Timer:alarm_clock:', value: str }],
                },
            ],
        });
        await index_1.Database.update('alerts', ['is_alerted'], [true], 'WHERE alert_id = ' + meetingData.alert_id);
    }
}
exports.default = Timer;
