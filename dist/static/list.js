"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
class List {
    static async showParticipant(meetingId, message) {
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
        const guildId = message.guildId;
        if (!(meetingData.guild_id === guildId)) {
            await message.reply('IDが正しくありません！');
            return;
        }
        const resultMembers = await index_1.Database.select(['*'], 'members', 'WHERE member_id = ' + meetingData.member_id);
        let str = `ID: ${meetingData.meeting_id}\n主催者: ${meetingData.organizer_name}\n日程: ${meetingData.schedule}\nタイトル: ${meetingData.meeting_title}\n-参加者-\n`;
        for (let resultMember of resultMembers) {
            if (!resultMember.is_join) {
                continue;
            }
            str += `・${resultMember.username}\n`;
        }
        const textChannel = index_1.client.channels.cache.get(meetingData.text_channel_id);
        textChannel.send({
            embeds: [
                {
                    color: 3066993,
                    fields: [{ name: 'Participants', value: str }],
                },
            ],
        });
    }
}
exports.default = List;
