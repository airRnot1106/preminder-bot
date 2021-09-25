"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pg_1 = __importDefault(require("pg"));
class Database {
    static async connect() {
        await this._client.connect();
        console.log('Successfully connected to the database');
    }
    static async insert(tableName, columnNmaes, values, option) {
        const query = `INSERT INTO ${tableName} (${columnNmaes.join(',')}) VALUES (${values.join(',')})${option ? ' ' + option : ''}`;
        console.log('--------');
        console.log('Query:\n', query);
        console.log('--------\n');
        const result = await this._client.query(query);
        return result.rows;
    }
    static async select(columnNames, tableName, option) {
        const query = `SELECT ${columnNames.join(',')} FROM ${tableName}${option ? ' ' + option : ''}`;
        console.log('--------');
        console.log('Query:\n', query);
        console.log('--------\n');
        const result = await this._client.query(query);
        return result.rows;
    }
    static async update(tableName, columnNames, values, option) {
        let sets = [];
        for (let i = 0; i < columnNames.length; i++) {
            sets.push(`${columnNames[i]}=${values[i]}`);
        }
        const query = `UPDATE ${tableName} SET ${sets.join(',')}${option ? ' ' + option : ''}`;
        console.log('--------');
        console.log('Query:\n', query);
        console.log('--------\n');
        const result = await this._client.query(query);
        return result.rows;
    }
    static normalizeText(str) {
        return "'" + str + "'";
    }
}
exports.default = Database;
Database._client = new pg_1.default.Client({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: parseInt(process.env.PORT, 10),
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});
