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
  static async insert(
    tableName: string,
    columnNmaes: string[],
    values: any[],
    option?: string
  ) {
    const query = `INSERT INTO ${tableName} (${columnNmaes.join(
      ','
    )}) VALUES (${values.join(',')})${option ? ' ' + option : ''}`;
    console.log('--------');
    console.log('Query:\n', query);
    console.log('--------\n');
    const result = await this._client.query(query);
    return result.rows;
  }
  static async select(
    columnNames: string[],
    tableName: string,
    option?: string
  ) {
    const query = `SELECT ${columnNames.join(',')} FROM ${tableName}${
      option ? ' ' + option : ''
    }`;
    console.log('--------');
    console.log('Query:\n', query);
    console.log('--------\n');
    const result = await this._client.query(query);
    return result.rows;
  }
  static normalizeText(str: string) {
    return "'" + str + "'";
  }
}
