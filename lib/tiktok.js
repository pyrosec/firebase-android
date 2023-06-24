"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseClient = exports.randomDevice = exports.DEVICE_LIST = exports.randomFid = exports.FID_LENGTH = exports.FID_REMOVE_PREFIX_MASK = exports.FID_4BIT_PREFIX = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const manifest_json_1 = __importDefault(require("./manifest.json"));
const uuid_1 = require("uuid");
const base64url_1 = __importDefault(require("base64url"));
const fingerprints_json_1 = __importDefault(require("./fingerprints.json"));
const node_gzip_1 = require("node-gzip");
exports.FID_4BIT_PREFIX = parseInt('70', 16);
exports.FID_REMOVE_PREFIX_MASK = parseInt('0f', 16);
exports.FID_LENGTH = 22;
const randomFid = () => {
    const bytes = Buffer.from((0, uuid_1.v1)().replace(/\-/g, ''), 'hex');
    bytes[0] &= exports.FID_REMOVE_PREFIX_MASK;
    bytes[0] |= exports.FID_4BIT_PREFIX;
    return (0, base64url_1.default)(bytes).substr(0, exports.FID_LENGTH);
};
exports.randomFid = randomFid;
exports.DEVICE_LIST = fingerprints_json_1.default.map((v) => ({
    name: v.name,
    fingerprints: v.fingerprints,
    device: v.device,
    brand: v.brand,
    model: v.name.split('(')[0].trim(),
    build: v.fingerprints[0].split(':')[1].split('/')[1]
})).filter((v) => v.build.match(/\w+\.\d+\.\d+/));
const randomDevice = () => exports.DEVICE_LIST[Math.floor(exports.DEVICE_LIST.length * Math.random())];
exports.randomDevice = randomDevice;
class FirebaseClient {
    constructor({ session, googleAppId, googleApiKey, packageName, androidCert, firebaseClient, device }) {
        this.session = session || null;
        this.device = device || (0, exports.randomDevice)();
        this.firebaseClient = firebaseClient;
        this.androidCert = androidCert;
        this.packageName = packageName;
        this.googleAppId = googleAppId;
        this.googleApiKey = googleApiKey;
    }
    getUserAgent() {
        return 'Dalvik/2.1.0 (Linux; U; Android 11; ' + this.device.model + ' Build/' + this.device.build + ')';
    }
    async initSession() {
        const zipped = Buffer.from(await (0, node_gzip_1.gzip)(JSON.stringify({
            appId: manifest_json_1.default.googleAppId,
            authVersion: "FIS_v2",
            fid: this.session && this.session.fid || (0, exports.randomFid)(),
            sdkVersion: "a:17.0.1"
        })));
        const response = await (0, node_fetch_1.default)('https://firebaseinstallations.googleapis.com/v1/projects/' + this.projectId + '/installations', {
            method: 'POST',
            body: zipped,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Content-Encoding': 'gzip',
                'Cache-Control': 'no-cache',
                'X-Android-Package': this.packageName,
                'X-Android-Cert': this.androidCert,
                'x-goog-api-key': this.googleApiKey,
                'x-firebase-client': manifest_json_1.default.firebaseClient,
                'User-Agent': this.getUserAgent(),
                'Host': 'firebaseinstallations.googleapis.com',
                Connection: 'Keep-Alive',
                'Accept-Encoding': 'gzip',
                'Content-Length': String(zipped.length)
            },
            compress: true
        });
        return await response.json();
    }
}
exports.FirebaseClient = FirebaseClient;
//# sourceMappingURL=tiktok.js.map