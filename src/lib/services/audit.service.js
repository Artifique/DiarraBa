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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = void 0;
// filepath: src/lib/services/audit.service.ts
var prisma_1 = __importDefault(require("@/lib/prisma"));
exports.auditService = {
    getAll: function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                return [2 /*return*/, prisma_1.default.audit.findMany({ take: limit })];
            });
        });
    },
    getById: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prisma_1.default.audit.findUnique({ where: { id: id } })];
            });
        });
    },
    getByManager: function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, limit) {
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                return [2 /*return*/, prisma_1.default.audit.findMany({
                        where: { userId: userId },
                        take: limit,
                        orderBy: { date_creation: "desc" },
                    })];
            });
        });
    },
    getByEntite: function (entity_type, entity_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prisma_1.default.audit.findMany({
                        where: { entity_type: entity_type, entity_id: entity_id },
                        orderBy: { date_creation: "desc" },
                    })];
            });
        });
    },
    getByAction: function (action_1) {
        return __awaiter(this, arguments, void 0, function (action, limit) {
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                return [2 /*return*/, prisma_1.default.audit.findMany({
                        where: { action: action },
                        take: limit,
                        orderBy: { date_creation: "desc" },
                    })];
            });
        });
    },
    getRecentActivity: function () {
        return __awaiter(this, arguments, void 0, function (days) {
            var dateThreshold;
            if (days === void 0) { days = 7; }
            return __generator(this, function (_a) {
                dateThreshold = new Date();
                dateThreshold.setDate(dateThreshold.getDate() - days);
                return [2 /*return*/, prisma_1.default.audit.findMany({
                        where: {
                            date_creation: {
                                gte: dateThreshold,
                            },
                        },
                        orderBy: { date_creation: "desc" },
                    })];
            });
        });
    },
    log: function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prisma_1.default.audit.create({
                        data: {
                            userId: data.userId,
                            action: data.action,
                            entity_type: data.entity_type,
                            entity_id: data.entity_id,
                            old_value: data.old_value,
                            new_value: data.new_value,
                            ip_address: data.ip_address,
                            user_agent: data.user_agent,
                        },
                    })];
            });
        });
    },
};
