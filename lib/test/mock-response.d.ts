/// <reference types="node" />
import { Transform } from 'stream';
/**
 * A mock response used to simluate the server response to mock requests during tests. You shouldn't
 * need to instantiate these directly - instead, use an AppAcceptance test.
 *
 * @package test
 */
export default class MockResponse extends Transform {
    statusCode: number;
    statusMessage: string;
    _headers: {
        [key: string]: string;
    };
    _buffers: Buffer[];
    constructor(finish?: () => void);
    _transform(chunk: Buffer, encoding: string, next: () => void): void;
    setHeader(name: string, value: string): void;
    getHeader(name: string): string;
    removeHeader(name: string): void;
    _implicitHeader(): void;
    writeHead(statusCode: number, reason?: string, headers?: {
        [key: string]: string;
    }): void;
    _getString(): string;
    _getJSON(): any;
    writeContinue(): void;
    setTimeout(): void;
    addTrailers(): void;
    readonly headersSent: void;
    readonly sendDate: void;
}
