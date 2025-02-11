export enum InfluxVersion {
    V2 = 0,
    V1 = 1
}
export interface IInstance {
    readonly version : InfluxVersion;
    readonly id : string;
    readonly name : string;
    readonly hostNport : string;
    readonly token : string;
    readonly org : string;
    readonly user : string;
    readonly pass : string;
    isActive : boolean;
    // Until there is a way to "migrate" this data, it may not
    // exist in the data store
    readonly disableTLS : boolean | undefined;
}
