import Discord from 'discord.js';

import { client, Database } from '../index';

type MeetingData = {
  meeting_id: number;
  guild_id: string;
  text_channel_id: string;
  meeting_title: string;
  organizer_name: string;
  schedule: string;
  members_id: number;
};

export default class Ticket {
  static async join(meetingId: string, user: Discord.User, isJoin: boolean) {
    const result = await Database.select(
      ['*'],
      'meetings',
      'WHERE meeting_id = ' + meetingId
    );
    const meetingData: MeetingData = result[0];
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
      ['members_id', 'username'],
      [meetingData.members_id, Database.normalizeText(user.toString())]
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
    const resultMembersId = await Database.select(
      ['members_id'],
      'meetings',
      'WHERE meeting_id = ' + meetingId
    );
    const membersId = resultMembersId[0].members_id;
    const resultUsernames = await Database.select(
      ['username'],
      'members',
      'WHERE members_id = ' + membersId
    );
    let isValid = false;
    for (let resultUsername of resultUsernames) {
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
