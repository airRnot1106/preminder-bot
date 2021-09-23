import dotenv from 'dotenv';
dotenv.config();

import Discord from 'discord.js';
import fetch from 'node-fetch';
import dayjs from 'dayjs';

import { Database } from '../index';

type Res = {
  request_id: string;
  doc_time: string;
  datetime_list: string[];
};

export default class Meeting {
  private _message: Discord.Message;
  private _body: string;
  private _schedule: string | null | undefined;
  private _isParsed: boolean;
  private _meetingId: number | undefined;
  constructor(message: Discord.Message, body: string) {
    this._message = message;
    this._body = body;
    this._isParsed = false;
  }
  async parseSchedule() {
    const splitArray = this._body.split(' ');
    if (splitArray.length <= 1) {
      this._schedule = dayjs().format('YYYY-MM-DDTHH:mm:ss');
      this._isParsed = true;
      return;
    }
    const tmpBody = (() => {
      const index = this._body.lastIndexOf(' ');
      if (index === -1) {
        return this._body;
      }
      return this._body.substring(0, index);
    })();
    const jsonData = {
      app_id: process.env.TIME_BASED_REGULARIZATION_API_ID,
      sentence: splitArray[splitArray.length - 1],
    };
    await fetch('https://labs.goo.ne.jp/api/chrono', {
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
        this._schedule = length
          ? dayjs(list[length - 1][1]).format('YYYY-MM-DDTHH:mm:ss')
          : dayjs().format('YYYY-MM-DDTHH:mm:ss');
        if (length) {
          this._body = tmpBody;
        }
        this._isParsed = true;
      });
    console.log(this._schedule);
  }
  async store() {
    if (!this._isParsed) {
      return;
    }
    const meetingData = {
      guildId: this._message.guildId!,
      textChannelId: this._message.channelId,
      meetingTitle: Database.normalizeText(this._body),
      organizer_name: Database.normalizeText(this._message.author.toString()),
      schedule: Database.normalizeText(this._schedule!),
    };
    console.log('--------');
    console.log('Created a meeting:\n', meetingData);
    console.log('--------\n');
    const result: { meeting_id: number }[] = await Database.insert(
      'meetings',
      [
        'guild_id',
        'text_channel_id',
        'meeting_title',
        'organizer_name',
        'schedule',
      ],
      [
        meetingData.guildId,
        meetingData.textChannelId,
        meetingData.meetingTitle,
        meetingData.organizer_name,
        meetingData.schedule,
      ],
      'RETURNING meeting_id'
    );
    this._meetingId = result[0].meeting_id;
  }
  async sendButton() {
    if (!this._isParsed) {
      return;
    }
    const button01 = new Discord.MessageButton()
      .setCustomId(`join-${this._meetingId}`)
      .setStyle('PRIMARY')
      .setLabel('参加');
    const button02 = new Discord.MessageButton()
      .setCustomId(`notJoin-${this._meetingId}`)
      .setStyle('PRIMARY')
      .setLabel('不参加');
    await this._message.channel.send({
      content: `ID: ${this._meetingId}\n**${this._schedule}**から\n${this._body}`,
      components: [
        new Discord.MessageActionRow().addComponents(button01),
        new Discord.MessageActionRow().addComponents(button02),
      ],
    });
  }
  async insert() {
    const columnNames = [];
  }
}
