"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KAFKA_URL = exports.ENVIRONMENT = exports.PORT = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.PORT = parseInt(process.env.PORT) || 8002;
exports.ENVIRONMENT = process.env.NODE_ENV;
exports.KAFKA_URL = process.env.KAFKA;
