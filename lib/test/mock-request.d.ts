/// <reference types="node" />
import { Transform } from 'stream';
/**
 * A mock request used to simluate an HTTP request to the application during tests. You shouldn't
 * need to instantiate these directly - instead, use an AppAcceptance test.
 *
 * @package test
 */
export default class MockRequest extends Transform {
    method: string;
    url: string;
    headers: {
        [key: string]: string;
    };
    rawHeaders: string[];
    _writableState: any;
    _readableState: any;
    socket: {
        remoteAddress: string;
    };
    constructor(options?: {
        method?: string;
        url?: string;
        headers?: {
            [key: string]: string;
        };
    });
    _transform(chunk: string | Buffer | {}, encoding: string, next: () => void): void;
}
