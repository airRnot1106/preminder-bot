//static
export { default as Database } from './static/database';
export { default as Ticket } from './static/ticket';
export { default as List } from './static/list';
export { default as Timer } from './static/Timer';
export { default as Command } from './static/command';
export { default as Updater } from './static/updater';

//instance
export { default as Meeting } from './instance/meeting';

//variable
export { client } from './client';

//type
export type MeetingData = {
  meeting_id: number;
  guild_id: string;
  text_channel_id: string;
  meeting_title: string;
  organizer_name: string;
  schedule: string;
  member_id: number;
  alert_id: number;
};

export type MembersData = {
  member_id: number;
  username: string;
  is_join: boolean;
};

export type AlertData = {
  alert_id: number;
  should_alert: boolean;
  is_alerted: boolean;
};

export type Res = {
  request_id: string;
  doc_time: string;
  datetime_list: string[];
};
