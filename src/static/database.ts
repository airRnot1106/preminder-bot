import dotenv from 'dotenv';
dotenv.config();

import Pg from 'pg';

export default class Database {
  private static _client = new Pg.Client({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: parseInt(process.env.PORT!, 10),
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  static async connect() {
    await this._client.connect();
    console.log('Successfully connected to the database');
  }

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
  static async update(
    tableName: string,
    columnNames: string[],
    values: any[],
    option?: string
  ) {
    let sets = [];
    for (let i = 0; i < columnNames.length; i++) {
      sets.push(`${columnNames[i]}=${values[i]}`);
    }
    const query = `UPDATE ${tableName} SET ${sets.join(',')}${
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
