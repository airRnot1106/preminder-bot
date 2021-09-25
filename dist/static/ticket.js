"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
class Ticket {
    static async join(meetingId, user, isJoin) {
        const resultMeeting = await index_1.Database.select(['*'], 'meetings', 'WHERE meeting_id = ' + meetingId);
        const meetingData = resultMeeting[0];
        const textChannel = index_1.client.channels.cache.get(meetingData.text_channel_id);
        if (isJoin) {
            await textChannel.send(`${meetingData.organizer_name}:\n${user.toString()}が**${meetingData.meeting_title}**に参加します！`);
        }
        else {
            await textChannel.send(`${meetingData.organizer_name}:\n${user.toString()}は**${meetingData.meeting_title}**に参加できません……`);
        }
        await index_1.Database.insert('members', ['member_id', 'username', 'is_join'], [meetingData.member_id, index_1.Database.normalizeText(user.toString()), isJoin]);
        console.log('--------');
        console.log(`ID: ${meetingData.meeting_id}\nTitle: ${meetingData.meeting_title}\nSchedule: ${meetingData.schedule}\n> ${isJoin ? 'Joined' : 'Refused'} ${user.username}(${user.toString()})`);
        console.log('--------\n');
    }
    static async isReplied(meetingId, user) {
        const resultMeeting = await index_1.Database.select(['*'], 'meetings', 'WHERE meeting_id = ' + meetingId);
        const membersId = resultMeeting[0].member_id;
        const resultMembers = await index_1.Database.select(['*'], 'members', 'WHERE member_id = ' + membersId);
        let isValid = false;
        for (let resultUsername of resultMembers) {
            if (resultUsername.username === user.toString()) {
                isValid = true;
            }
        }
        if (isValid) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.default = Ticket;
