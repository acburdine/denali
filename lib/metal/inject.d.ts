export interface Injection {
    lookup: string;
}
export declare const IS_INJECTION: symbol;
export declare function isInjection(value: any): value is Injection;
export default function inject<T = any>(lookup: string): T;
