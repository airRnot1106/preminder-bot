import Discord from 'discord.js';
import dayjs from 'dayjs';

import { client, Database } from '../index';
import { MeetingData, AlertData } from '../index';

export default class Timer {
  static async active(meetingId: string, message: Discord.Message) {
    await this.toggleTimer(true, meetingId, message);
    await message.reply(`ID: ${meetingId}のタイマーをONにしました`);
  }
  static async inactive(meetingId: string, message: Discord.Message) {
    await this.toggleTimer(false, meetingId, message);
    await message.reply(`ID: ${meetingId}のタイマーをOFFにしました`);
  }
  private static async toggleTimer(
    state: boolean,
    meetingId: string,
    message: Discord.Message
  ) {
    if (!meetingId) {
      await message.reply('IDが正しくありません！');
      return;
    }
    const resultMeeting: MeetingData[] = await Database.select(
      ['*'],
      'meetings',
      'WHERE meeting_id = ' + meetingId
    );
    const meetingData = resultMeeting[0];
    if (!meetingData) {
      await message.reply('IDが正しくありません！');
      return;
    }
    await Database.update(
      'alerts',
      ['should_alert'],
      [state],
      'WHERE alert_id = ' + meetingData.alert_id
    );
  }
  static async checkSchedule() {
    const resultAlerts: AlertData[] = await Database.select(
      ['*'],
      'alerts',
      'WHERE should_alert = ' + true + ' AND is_alerted = ' + false
    );
    const alertIds = resultAlerts.map((alert) => alert.alert_id);
    if (!alertIds.length) {
      return;
    }
    const resultMeetings: MeetingData[] = await Database.select(
      ['*'],
      'meetings',
      'WHERE alert_id = ' + alertIds.join(' OR alert_id = ')
    );
    const schedules = resultMeetings.map((meeting) => meeting.schedule);
    const now = dayjs();
    for (let i = 0; i < schedules.length; i++) {
      const msec = dayjs(schedules[i]).diff(now);
      console.log(msec);
      if (msec <= 0) {
        await this.alert(resultMeetings[i]);
      }
    }
  }
  static async alert(meetingData: MeetingData) {
    const textChannel = client.channels.cache.get(
      meetingData.text_channel_id
    )! as Discord.TextBasedChannels;
    const str = `ID: ${meetingData.meeting_id}\n主催者: ${meetingData.organizer_name}\n日程: ${meetingData.schedule}\nタイトル: ${meetingData.meeting_title}\n\n**時間になりました！**`;
    await textChannel.send({
      embeds: [
        {
          color: 10038562,
          fields: [{ name: ':alarm_clock:Timer:alarm_clock:', value: str }],
        },
      ],
    });
    await Database.update(
      'alerts',
      ['is_alerted'],
      [true],
      'WHERE alert_id = ' + meetingData.alert_id
    );
  }
}
