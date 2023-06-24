import fetch from "node-fetch";
import { v1 } from "uuid";
import base64url from "base64url";
import fingerprints from "android-fingerprints";

export const FID_4BIT_PREFIX = parseInt("70", 16);
export const FID_REMOVE_PREFIX_MASK = parseInt("0f", 16);
export const FID_LENGTH = 22;

export const randomFid = () => {
  const bytes = Buffer.from(v1().replace(/\-/g, ""), "hex");
  bytes[0] &= FID_REMOVE_PREFIX_MASK;
  bytes[0] |= FID_4BIT_PREFIX;
  return base64url(bytes).substr(0, FID_LENGTH);
};

export const DEVICE_LIST = fingerprints
  .map((v) => ({
    name: v.name,
    fingerprints: v.fingerprints,
    device: v.device,
    brand: v.brand,
    model: v.name.split("(")[0].trim(),
    build: v.fingerprints[0].split(":")[1].split("/")[1],
  }))
  .filter((v) => v.build.match(/\w+\.\d+\.\d+/));

export const randomDevice = () =>
  DEVICE_LIST[Math.floor(DEVICE_LIST.length * Math.random())];

export class FirebaseClient {
  public session: any;
  public device: typeof DEVICE_LIST[0];
  public googleAppId: string;
  public googleApiKey: string;
  public packageName: string;
  public androidCert: string;
  public firebaseClient: string;
  public projectId: string;
  constructor({
    session,
    googleAppId,
    googleApiKey,
    projectId,
    packageName,
    androidCert,
    firebaseClient,
    device,
  }) {
    this.session = session || null;
    this.device = device || randomDevice();
    this.firebaseClient = firebaseClient;
    this.projectId = projectId;
    this.androidCert = androidCert;
    this.packageName = packageName;
    this.googleAppId = googleAppId;
    this.googleApiKey = googleApiKey;
  }
  getUserAgent() {
    return (
      "Dalvik/2.1.0 (Linux; U; Android 11; " +
      this.device.model +
      " Build/" +
      this.device.build +
      ")"
    );
  }
  ln(v) {
    console.log(v);
    return v;
  }
  async initSession() {
    const response = await fetch(
      this.ln(
        "https://firebaseinstallations.googleapis.com/v1/projects/" +
          this.projectId +
          "/installations"
      ),
      this.ln({
        method: "POST",
        body: JSON.stringify({
          appId: this.googleAppId,
          authVersion: "FIS_v2",
          fid: (this.session && this.session.fid) || randomFid(),
          sdkVersion: "a:17.0.1",
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Content-Encoding": "gzip",
          "Cache-Control": "no-cache",
          "X-Android-Package": this.packageName,
          "X-Android-Cert": this.androidCert,
          "x-goog-api-key": this.googleApiKey,
          "x-firebase-client": this.firebaseClient,
          "User-Agent": this.getUserAgent(),
          Host: "firebaseinstallations.googleapis.com",
          Connection: "Keep-Alive",
          "Accept-Encoding": "gzip",
        },
        compress: true,
      })
    );
    return await response.json();
  }
}
