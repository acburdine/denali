export interface Dict<T> {
    [key: string]: T;
}
export interface Constructor<T> {
    new (...args: any[]): T;
}
export declare type POJO = Dict<any>;
