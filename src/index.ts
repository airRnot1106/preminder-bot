//static
export { default as Database } from './static/database';
export { default as Ticket } from './static/ticket';
export { default as List } from './static/list';

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
  members_id: number;
};

export type MembersData = {
  members_id: number;
  username: string;
  is_join: boolean;
};
