import dotenv from 'dotenv';
dotenv.config();

import Pg from 'pg';

export default class Database {
  private static _client = (() => {
    const client = new Pg.Client({
      user: process.env.user,
      host: process.env.host,
      database: process.env.database,
      password: process.env.password,
      port: parseInt(process.env.port!, 10),
    });
    client.connect();
    console.log('Successfully connected to the database');
    return client;
  })();
  static get client() {
    return this._client;
  }
}
