import dotenv from 'dotenv';
dotenv.config();

import Discord from 'discord.js';
import dayjs from 'dayjs';
import fetch from 'node-fetch';

import { Database } from '../index';
import { MeetingData, Res } from '../index';

export default class Updater {
  static async updateTitle(body: string, message: Discord.Message) {
    const [meetingId, ...title] = body.split(' ');
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
    Database.update(
      'meetings',
      ['meeting_title'],
      [Database.normalizeText(title.join(' '))]
    );
    const button01 = new Discord.MessageButton()
      .setCustomId(`join-${meetingId}`)
      .setStyle('PRIMARY')
      .setLabel('参加');
    const button02 = new Discord.MessageButton()
      .setCustomId(`notJoin-${meetingId}`)
      .setStyle('PRIMARY')
      .setLabel('不参加');
    await message.channel.send({
      content: `ID: ${meetingId}\n${meetingData.meeting_title}が${title.join(
        ' '
      )}に変更されました`,
      components: [
        new Discord.MessageActionRow().addComponents(button01),
        new Discord.MessageActionRow().addComponents(button02),
      ],
    });
  }
  static async updateSchedule(body: string, message: Discord.Message) {
    const [meetingId, ...schedule] = body.split(' ');
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
    const jsonData = {
      app_id: process.env.TIME_BASED_REGULARIZATION_API_ID,
      sentence: schedule.join(' '),
    };
    const newSchedule = await fetch('https://labs.goo.ne.jp/api/chrono', {
      method: 'POST',
      body: JSON.stringify(jsonData),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          console.log(res);
          throw new Error();
        }
      })
      .then((json: Res) => {
        const list = json.datetime_list;
        const length = list.length;
        return length
          ? dayjs(list[length - 1][1]).format('YYYY-MM-DDTHH:mm:ss')
          : dayjs().format('YYYY-MM-DDTHH:mm:ss');
      });
    Database.update(
      'meetings',
      ['schedule'],
      [Database.normalizeText(newSchedule)]
    );
    const button01 = new Discord.MessageButton()
      .setCustomId(`join-${meetingId}`)
      .setStyle('PRIMARY')
      .setLabel('参加');
    const button02 = new Discord.MessageButton()
      .setCustomId(`notJoin-${meetingId}`)
      .setStyle('PRIMARY')
      .setLabel('不参加');
    await message.channel.send({
      content: `ID: ${meetingId}\n${meetingData.schedule}が${newSchedule}に変更されました`,
      components: [
        new Discord.MessageActionRow().addComponents(button01),
        new Discord.MessageActionRow().addComponents(button02),
      ],
    });
  }
}
