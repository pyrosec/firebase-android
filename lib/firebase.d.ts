export declare const FID_4BIT_PREFIX: number;
export declare const FID_REMOVE_PREFIX_MASK: number;
export declare const FID_LENGTH = 22;
export declare const randomFid: () => string;
export declare const DEVICE_LIST: any;
export declare const randomDevice: () => any;
export declare class FirebaseClient {
    session: any;
    device: typeof DEVICE_LIST[0];
    googleAppId: string;
    googleApiKey: string;
    packageName: string;
    androidCert: string;
    firebaseClient: string;
    projectId: string;
    constructor({ session, googleAppId, googleApiKey, projectId, packageName, androidCert, firebaseClient, device, }: {
        session: any;
        googleAppId: any;
        googleApiKey: any;
        projectId: any;
        packageName: any;
        androidCert: any;
        firebaseClient: any;
        device: any;
    });
    getUserAgent(): string;
    ln(v: any): any;
    initSession(): Promise<any>;
}
