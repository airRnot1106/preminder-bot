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
    this._body = (() => {
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
      organizer_name: Database.normalizeText(this._message.author.username),
      schedule: Database.normalizeText(this._schedule!),
    };
    console.log(meetingData);
    await Database.insert(
      'meetings',
      ['guild_id', 'text_channel_id', 'organizer_name', 'schedule'],
      [
        meetingData.guildId,
        meetingData.textChannelId,
        meetingData.organizer_name,
        meetingData.schedule,
      ]
    );
  }
  async sendButton() {
    if (!this._isParsed) {
      return;
    }
    const button01 = new Discord.MessageButton()
      .setCustomId('join')
      .setStyle('PRIMARY')
      .setLabel('参加');
    const button02 = new Discord.MessageButton()
      .setCustomId('notJoin')
      .setStyle('PRIMARY')
      .setLabel('不参加');
    await this._message.channel.send({
      content: `*${this._schedule ? this._schedule : '今'}*から\n${this._body}`,
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
