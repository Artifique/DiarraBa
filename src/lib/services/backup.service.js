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
exports.backupService = void 0;
// src/lib/services/backup.service.ts
var prisma_1 = __importDefault(require("@/lib/prisma"));
var audit_service_1 = require("./audit.service");
var crypto_1 = __importDefault(require("crypto"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
function base64url(source) {
    return source.toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}
function signJwt(email, privateKey) {
    var header = { alg: "RS256", typ: "JWT" };
    var now = Math.floor(Date.now() / 1000);
    var payload = {
        iss: email,
        scope: "https://www.googleapis.com/auth/drive",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now
    };
    var encodedHeader = base64url(Buffer.from(JSON.stringify(header)));
    var encodedPayload = base64url(Buffer.from(JSON.stringify(payload)));
    var token = "".concat(encodedHeader, ".").concat(encodedPayload);
    var sign = crypto_1.default.createSign("RSA-SHA256");
    sign.update(token);
    var signature = sign.sign(privateKey);
    var encodedSignature = base64url(signature);
    return "".concat(token, ".").concat(encodedSignature);
}
function getAccessToken(email, privateKey) {
    return __awaiter(this, void 0, void 0, function () {
        var jwt, response, errorText, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jwt = signJwt(email, privateKey);
                    return [4 /*yield*/, fetch("https://oauth2.googleapis.com/token", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                            body: new URLSearchParams({
                                grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                                assertion: jwt,
                            }),
                        })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.text()];
                case 2:
                    errorText = _a.sent();
                    throw new Error("Failed to get Google Access Token: ".concat(response.statusText, " - ").concat(errorText));
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    return [2 /*return*/, data.access_token];
            }
        });
    });
}
exports.backupService = {
    getCredentials: function () {
        return __awaiter(this, void 0, void 0, function () {
            var jsonPath, fileContent, creds, email, privateKey, folderId;
            var _a;
            return __generator(this, function (_b) {
                // 1. Essayer de lire le fichier JSON local
                try {
                    jsonPath = path_1.default.join(process.cwd(), "diarraba-backup-b9c3b96dcc69.json");
                    if (fs_1.default.existsSync(jsonPath)) {
                        fileContent = fs_1.default.readFileSync(jsonPath, "utf8");
                        creds = JSON.parse(fileContent);
                        if (creds.client_email && creds.private_key) {
                            return [2 /*return*/, {
                                    email: creds.client_email,
                                    privateKey: creds.private_key,
                                    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || ""
                                }];
                        }
                    }
                }
                catch (e) {
                    console.warn("Could not read credentials from local JSON file, falling back to environment variables:", e);
                }
                email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
                privateKey = (_a = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n");
                folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "";
                if (!email || !privateKey) {
                    throw new Error("Google Service Account credentials are not configured. Please check diarraba-backup-b9c3b96dcc69.json or environment variables.");
                }
                return [2 /*return*/, { email: email, privateKey: privateKey, folderId: folderId }];
            });
        });
    },
    executeBackup: function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, _a, email, privateKey, folderId, backupData, backupJsonString, backupSize, accessToken, now, dateStr, filename, metadata, boundary, delimiter, closeDelimiter, body, uploadResponse, errorText, uploadResult, fileId, listUrl, listResponse, listData, files, filesToDelete, _i, filesToDelete_1, file, pruningError_1, duration;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        startTime = Date.now();
                        return [4 /*yield*/, this.getCredentials()];
                    case 1:
                        _a = _d.sent(), email = _a.email, privateKey = _a.privateKey, folderId = _a.folderId;
                        _b = {
                            version: "1.0",
                            timestamp: new Date().toISOString()
                        };
                        _c = {};
                        return [4 /*yield*/, prisma_1.default.user.findMany()];
                    case 2:
                        _c.users = _d.sent();
                        return [4 /*yield*/, prisma_1.default.personne.findMany()];
                    case 3:
                        _c.personnes = _d.sent();
                        return [4 /*yield*/, prisma_1.default.categorie.findMany()];
                    case 4:
                        _c.categories = _d.sent();
                        return [4 /*yield*/, prisma_1.default.produit.findMany()];
                    case 5:
                        _c.produits = _d.sent();
                        return [4 /*yield*/, prisma_1.default.reservation.findMany()];
                    case 6:
                        _c.reservations = _d.sent();
                        return [4 /*yield*/, prisma_1.default.ligneReservation.findMany()];
                    case 7:
                        _c.lignesReservation = _d.sent();
                        return [4 /*yield*/, prisma_1.default.paiement.findMany()];
                    case 8:
                        _c.paiements = _d.sent();
                        return [4 /*yield*/, prisma_1.default.eclosion.findMany()];
                    case 9:
                        _c.eclosions = _d.sent();
                        return [4 /*yield*/, prisma_1.default.facture.findMany()];
                    case 10:
                        _c.factures = _d.sent();
                        return [4 /*yield*/, prisma_1.default.notification.findMany()];
                    case 11:
                        _c.notifications = _d.sent();
                        return [4 /*yield*/, prisma_1.default.setting.findMany()];
                    case 12:
                        _c.settings = _d.sent();
                        return [4 /*yield*/, prisma_1.default.audit.findMany({ take: 2000, orderBy: { date_creation: "desc" } })];
                    case 13:
                        backupData = (_b.data = (_c.audits = _d.sent(),
                            _c),
                            _b);
                        backupJsonString = JSON.stringify(backupData, null, 2);
                        backupSize = Buffer.byteLength(backupJsonString, "utf8");
                        return [4 /*yield*/, getAccessToken(email, privateKey)];
                    case 14:
                        accessToken = _d.sent();
                        now = new Date();
                        dateStr = now.toISOString().replace(/T/, "_").replace(/:/g, "-").split(".")[0];
                        filename = "diarraba_backup_".concat(dateStr, ".json");
                        metadata = {
                            name: filename,
                            mimeType: "application/json",
                            parents: folderId ? [folderId] : undefined
                        };
                        boundary = "diarraba_backup_boundary";
                        delimiter = "\r\n--".concat(boundary, "\r\n");
                        closeDelimiter = "\r\n--".concat(boundary, "--");
                        body = delimiter +
                            "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
                            JSON.stringify(metadata) +
                            delimiter +
                            "Content-Type: application/json\r\n\r\n" +
                            backupJsonString +
                            closeDelimiter;
                        return [4 /*yield*/, fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
                                method: "POST",
                                headers: {
                                    "Authorization": "Bearer ".concat(accessToken),
                                    "Content-Type": "multipart/related; boundary=".concat(boundary),
                                    "Content-Length": Buffer.byteLength(body, "utf8").toString()
                                },
                                body: body
                            })];
                    case 15:
                        uploadResponse = _d.sent();
                        if (!!uploadResponse.ok) return [3 /*break*/, 17];
                        return [4 /*yield*/, uploadResponse.text()];
                    case 16:
                        errorText = _d.sent();
                        throw new Error("Google Drive upload failed: ".concat(uploadResponse.statusText, " - ").concat(errorText));
                    case 17: return [4 /*yield*/, uploadResponse.json()];
                    case 18:
                        uploadResult = _d.sent();
                        fileId = uploadResult.id;
                        if (!folderId) return [3 /*break*/, 27];
                        _d.label = 19;
                    case 19:
                        _d.trys.push([19, 26, , 27]);
                        listUrl = new URL("https://www.googleapis.com/drive/v3/files");
                        listUrl.searchParams.append("q", "'".concat(folderId, "' in parents and name contains 'diarraba_backup_' and trashed = false"));
                        listUrl.searchParams.append("orderBy", "createdTime desc");
                        listUrl.searchParams.append("fields", "files(id, name, createdTime)");
                        return [4 /*yield*/, fetch(listUrl.toString(), {
                                headers: { "Authorization": "Bearer ".concat(accessToken) }
                            })];
                    case 20:
                        listResponse = _d.sent();
                        if (!listResponse.ok) return [3 /*break*/, 25];
                        return [4 /*yield*/, listResponse.json()];
                    case 21:
                        listData = _d.sent();
                        files = listData.files || [];
                        if (!(files.length > 30)) return [3 /*break*/, 25];
                        filesToDelete = files.slice(30);
                        _i = 0, filesToDelete_1 = filesToDelete;
                        _d.label = 22;
                    case 22:
                        if (!(_i < filesToDelete_1.length)) return [3 /*break*/, 25];
                        file = filesToDelete_1[_i];
                        console.log("Pruning old backup file: ".concat(file.name, " (").concat(file.id, ")"));
                        return [4 /*yield*/, fetch("https://www.googleapis.com/drive/v3/files/".concat(file.id), {
                                method: "DELETE",
                                headers: { "Authorization": "Bearer ".concat(accessToken) }
                            })];
                    case 23:
                        _d.sent();
                        _d.label = 24;
                    case 24:
                        _i++;
                        return [3 /*break*/, 22];
                    case 25: return [3 /*break*/, 27];
                    case 26:
                        pruningError_1 = _d.sent();
                        console.error("Error during backup pruning:", pruningError_1);
                        return [3 /*break*/, 27];
                    case 27:
                        duration = Date.now() - startTime;
                        return [4 /*yield*/, audit_service_1.auditService.log({
                                userId: userId,
                                action: "BACKUP",
                                entity_type: "Database",
                                entity_id: fileId,
                                new_value: {
                                    filename: filename,
                                    sizeBytes: backupSize,
                                    durationMs: duration,
                                    folderId: folderId
                                }
                            })];
                    case 28:
                        _d.sent();
                        return [2 /*return*/, {
                                success: true,
                                filename: filename,
                                fileId: fileId,
                                size: backupSize
                            }];
                }
            });
        });
    }
};
