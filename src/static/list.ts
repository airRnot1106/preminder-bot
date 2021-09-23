import Discord from 'discord.js';

import { client, Database } from '../index';
import { MeetingData, MembersData } from '../index';

export default class List {
  static async showParticipant(meetingId: string) {
    const resultMeeting: MeetingData[] = await Database.select(
      ['*'],
      'meetings',
      'WHERE meeting_id = ' + meetingId
    );
    const meetingData = resultMeeting[0];
    const resultMembers: MembersData[] = await Database.select(
      ['*'],
      'members',
      'WHERE members_id = ' + meetingData.members_id
    );
    let str = `ID: ${meetingData.meeting_id}\n主催者: ${meetingData.organizer_name}\n日程: ${meetingData.schedule}\nタイトル: ${meetingData.meeting_title}\n-参加者-\n`;
    for (let resultMember of resultMembers) {
      if (!resultMember.is_join) {
        continue;
      }
      str += `・${resultMember.username}\n`;
    }
    const textChannel = client.channels.cache.get(
      meetingData.text_channel_id
    )! as Discord.TextBasedChannels;
    textChannel.send({
      embeds: [
        {
          color: 4303284,
          fields: [{ name: 'Participants', value: str }],
        },
      ],
    });
  }
}
