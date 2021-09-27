"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
class Command {
    static registerInterval() {
        let count = 0;
        this._intervalId = setInterval(() => {
            index_1.client.user?.setPresence({
                activities: [
                    {
                        name: this._descriptions[count],
                        type: 'PLAYING',
                    },
                ],
                status: 'online',
            });
            count++;
            if (count >= this._descriptions.length) {
                count = 0;
            }
        }, 5000);
        console.log('--------');
        console.log('Interval:\nregistered interval');
        console.log('--------\n');
    }
    static destoryInterval() {
        if (!this._intervalId) {
            return;
        }
        clearInterval(this._intervalId);
        console.log('--------');
        console.log('Interval:\ncleared interval');
        console.log('--------\n');
    }
    static async showHelp(message) {
        let str = '?create [タイトル] [日程?]\nエイリアス: ?c\nミーティングを作成します。タイトルは必須で、日程はオプションです。日程が指定されていない場合は現在時刻になります。\n例: ?c ボイスチャット 今日の8時\n\n';
        str +=
            '?participant [id]\nエイリアス: ?p\nidのミーティングの参加者を表示します。\n\n';
        str +=
            '?activetimer [id]\nエイリアス: ?at\nidのミーティングのタイマーをONに設定します。ミーティングの時間になったら通知をします。\n\n';
        str +=
            '?canceltimer [id]\nエイリアス: ?ct\ndのミーティングのタイマーをOFFに設定します。\n\n';
        str +=
            '?createactivetimer [タイトル] [日程?]\nエイリアス: ?cat\nミーティングを作成し、タイマーをONに設定します。\n\n';
        await message.reply({
            embeds: [
                {
                    color: 11342935,
                    fields: [{ name: 'Help', value: str }],
                },
            ],
        });
    }
}
exports.default = Command;
Command._descriptions = [
    '?c [タイトル] [日程?] — ミーティングを作成',
    '?p [id] — idのミーティングの参加者を表示',
    '?at [id] — idのミーティングのタイマーをONに設定',
    '?ct [id] — idのミーティングのタイマーをOFFに設定',
    '?cat [タイトル] [日程?] — ミーティングを作成し、タイマーをONに設定',
    '?help - helpを表示',
];
Command._intervalId = undefined;
