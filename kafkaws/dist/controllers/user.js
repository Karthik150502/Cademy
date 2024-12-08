"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const _1 = require(".");
class User {
    constructor(ws, userId) {
        this.ws = ws;
        this.id = userId;
        this.wsHandler = new _1.WsHandler(this, ws);
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.wsHandler.destroy();
        });
    }
}
exports.User = User;
