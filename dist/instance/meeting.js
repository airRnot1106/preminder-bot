"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const discord_js_1 = __importDefault(require("discord.js"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const dayjs_1 = __importDefault(require("dayjs"));
const index_1 = require("../index");
class Meeting {
    constructor(body, message) {
        this._body = body;
        this._message = message;
        this._isParsed = false;
    }
    get meetingData() {
        return this._meetingData;
    }
    async parseSchedule() {
        const splitArray = this._body.split(' ');
        if (splitArray.length <= 1) {
            this._schedule = dayjs_1.default().format('YYYY-MM-DDTHH:mm:ss');
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
        await node_fetch_1.default('https://labs.goo.ne.jp/api/chrono', {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: { 'Content-Type': 'application/json' },
        })
            .then((res) => {
            if (res.ok) {
                return res.json();
            }
            else {
                console.log(res);
                throw new Error();
            }
        })
            .then((json) => {
            const list = json.datetime_list;
            const length = list.length;
            this._schedule = length
                ? dayjs_1.default(list[length - 1][1]).format('YYYY-MM-DDTHH:mm:ss')
                : dayjs_1.default().format('YYYY-MM-DDTHH:mm:ss');
            if (length) {
                this._body = tmpBody;
            }
            this._isParsed = true;
        });
    }
    async store() {
        if (!this._isParsed) {
            return;
        }
        const meetingData = {
            guildId: this._message.guildId,
            textChannelId: this._message.channelId,
            meetingTitle: index_1.Database.normalizeText(this._body),
            organizer_name: index_1.Database.normalizeText(this._message.author.toString()),
            schedule: index_1.Database.normalizeText(this._schedule),
            meetingId: undefined,
        };
        console.log('--------');
        console.log('Created a meeting:\n', meetingData);
        console.log('--------\n');
        const result = await index_1.Database.insert('meetings', [
            'guild_id',
            'text_channel_id',
            'meeting_title',
            'organizer_name',
            'schedule',
        ], [
            meetingData.guildId,
            meetingData.textChannelId,
            meetingData.meetingTitle,
            meetingData.organizer_name,
            meetingData.schedule,
        ], 'RETURNING meeting_id, alert_id');
        meetingData.meetingId = result[0].meeting_id;
        this._meetingData = meetingData;
        console.log(this._meetingData);
        const alertId = result[0].alert_id;
        await index_1.Database.insert('alerts', ['alert_id', 'should_alert', 'is_alerted'], [alertId, false, false]);
    }
    async sendButton() {
        if (!this._isParsed || !this._meetingData) {
            return;
        }
        const button01 = new discord_js_1.default.MessageButton()
            .setCustomId(`join-${this._meetingData.meetingId}`)
            .setStyle('PRIMARY')
            .setLabel('参加');
        const button02 = new discord_js_1.default.MessageButton()
            .setCustomId(`notJoin-${this._meetingData.meetingId}`)
            .setStyle('PRIMARY')
            .setLabel('不参加');
        await this._message.channel.send({
            content: `ID: ${this._meetingData.meetingId}\n**${this._schedule}**から\n${this._body}`,
            components: [
                new discord_js_1.default.MessageActionRow().addComponents(button01),
                new discord_js_1.default.MessageActionRow().addComponents(button02),
            ],
        });
    }
}
exports.default = Meeting;
