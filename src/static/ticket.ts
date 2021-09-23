import Discord from 'discord.js';

import { client, Database } from '../index';
import { MeetingData, MembersData } from '../index';

export default class Ticket {
  static async join(meetingId: string, user: Discord.User, isJoin: boolean) {
    const resultMeeting = await Database.select(
      ['*'],
      'meetings',
      'WHERE meeting_id = ' + meetingId
    );
    const meetingData: MeetingData = resultMeeting[0];
    const textChannel = client.channels.cache.get(
      meetingData.text_channel_id
    )! as Discord.TextBasedChannels;
    if (isJoin) {
      await textChannel.send(
        `${meetingData.organizer_name}:\n${user.toString()}が**${
          meetingData.meeting_title
        }**に参加します！`
      );
    } else {
      await textChannel.send(
        `${meetingData.organizer_name}:\n${user.toString()}は**${
          meetingData.meeting_title
        }**に参加できません……`
      );
    }
    await Database.insert(
      'members',
      ['members_id', 'username', 'is_join'],
      [meetingData.members_id, Database.normalizeText(user.toString()), isJoin]
    );
    console.log('--------');
    console.log(
      `ID: ${meetingData.meeting_id}\nTitle: ${
        meetingData.meeting_title
      }\nSchedule: ${meetingData.schedule}\n> ${
        isJoin ? 'Joined' : 'Refused'
      } ${user.username}(${user.toString()})`
    );
    console.log('--------\n');
  }
  static async isReplied(meetingId: string, user: Discord.User) {
    const resultMeeting: MeetingData[] = await Database.select(
      ['*'],
      'meetings',
      'WHERE meeting_id = ' + meetingId
    );
    const membersId = resultMeeting[0].members_id;
    const resultMembers: MembersData[] = await Database.select(
      ['*'],
      'members',
      'WHERE members_id = ' + membersId
    );
    let isValid = false;
    for (let resultUsername of resultMembers) {
      if (resultUsername.username === user.toString()) {
        isValid = true;
      }
    }
    if (isValid) {
      return true;
    } else {
      return false;
    }
  }
}
