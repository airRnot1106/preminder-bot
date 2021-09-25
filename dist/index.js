"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.Meeting = exports.Timer = exports.List = exports.Ticket = exports.Database = void 0;
//static
var database_1 = require("./static/database");
Object.defineProperty(exports, "Database", { enumerable: true, get: function () { return __importDefault(database_1).default; } });
var ticket_1 = require("./static/ticket");
Object.defineProperty(exports, "Ticket", { enumerable: true, get: function () { return __importDefault(ticket_1).default; } });
var list_1 = require("./static/list");
Object.defineProperty(exports, "List", { enumerable: true, get: function () { return __importDefault(list_1).default; } });
var Timer_1 = require("./static/Timer");
Object.defineProperty(exports, "Timer", { enumerable: true, get: function () { return __importDefault(Timer_1).default; } });
//instance
var meeting_1 = require("./instance/meeting");
Object.defineProperty(exports, "Meeting", { enumerable: true, get: function () { return __importDefault(meeting_1).default; } });
//variable
var client_1 = require("./client");
Object.defineProperty(exports, "client", { enumerable: true, get: function () { return client_1.client; } });
