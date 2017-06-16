"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const http_1 = require("http");
const lodash_1 = require("lodash");
/**
 * A mock response used to simluate the server response to mock requests during tests. You shouldn't
 * need to instantiate these directly - instead, use an AppAcceptance test.
 *
 * @package test
 */
class MockResponse extends stream_1.Transform {
    constructor(finish) {
        super();
        // Mock internals of ServerResponse
        // tslint:disable:completed-docs member-access
        this.statusCode = 200;
        this.statusMessage = http_1.STATUS_CODES[200];
        this._headers = {};
        this._buffers = [];
        if (typeof finish === 'function') {
            this.on('finish', finish);
        }
    }
    _transform(chunk, encoding, next) {
        this.push(chunk);
        this._buffers.push(chunk);
        next();
    }
    setHeader(name, value) {
        this._headers[name.toLowerCase()] = value;
    }
    getHeader(name) {
        return this._headers[name.toLowerCase()];
    }
    removeHeader(name) {
        delete this._headers[name.toLowerCase()];
    }
    _implicitHeader() {
        this.writeHead(this.statusCode);
    }
    writeHead(statusCode, reason, headers) {
        if (typeof reason !== 'string') {
            headers = reason;
            reason = null;
        }
        this.statusCode = statusCode;
        this.statusMessage = reason || http_1.STATUS_CODES[statusCode] || 'unknown';
        if (headers) {
            lodash_1.forEach(headers, (value, name) => {
                this.setHeader(name, value);
            });
        }
    }
    _getString() {
        return Buffer.concat(this._buffers).toString();
    }
    _getJSON() {
        return JSON.parse(this._getString());
    }
    writeContinue() {
        throw new Error('MockResponse.writeContinue() is not implemented');
    }
    setTimeout() {
        throw new Error('MockResponse.setTimeout() is not implemented');
    }
    addTrailers() {
        throw new Error('MockResponse.addTrailers() is not implemented');
    }
    get headersSent() {
        throw new Error('MockResponse.headersSent is not implemented');
    }
    get sendDate() {
        throw new Error('MockResponse.sendDate is not implemented');
    }
}
exports.default = MockResponse;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jay1yZXNwb25zZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWJ1cmRpbmUvUHJvamVjdHMvZGVuYWxpL21haW4vIiwic291cmNlcyI6WyJsaWIvdGVzdC9tb2NrLXJlc3BvbnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQW1DO0FBQ25DLCtCQUFvQztBQUNwQyxtQ0FBaUM7QUFFakM7Ozs7O0dBS0c7QUFDSCxrQkFBa0MsU0FBUSxrQkFBUztJQVNqRCxZQUFZLE1BQW1CO1FBQzdCLEtBQUssRUFBRSxDQUFDO1FBUlYsbUNBQW1DO1FBQ25DLDhDQUE4QztRQUM5QyxlQUFVLEdBQUcsR0FBRyxDQUFDO1FBQ2pCLGtCQUFhLEdBQUcsbUJBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQyxhQUFRLEdBQThCLEVBQUUsQ0FBQztRQUN6QyxhQUFRLEdBQWEsRUFBRSxDQUFDO1FBSXRCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDNUIsQ0FBQztJQUNILENBQUM7SUFFRCxVQUFVLENBQUMsS0FBYSxFQUFFLFFBQWdCLEVBQUUsSUFBZ0I7UUFDMUQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQixJQUFJLEVBQUUsQ0FBQztJQUNULENBQUM7SUFFRCxTQUFTLENBQUMsSUFBWSxFQUFFLEtBQWE7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDNUMsQ0FBQztJQUVELFNBQVMsQ0FBQyxJQUFZO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxZQUFZLENBQUMsSUFBWTtRQUN2QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELGVBQWU7UUFDYixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsU0FBUyxDQUFDLFVBQWtCLEVBQUUsTUFBZSxFQUFFLE9BQW1DO1FBQ2hGLEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDL0IsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUNqQixNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sSUFBSSxtQkFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFNBQVMsQ0FBQztRQUNyRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1osZ0JBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSTtnQkFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVELFVBQVU7UUFDUixNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDakQsQ0FBQztJQUVELFFBQVE7UUFDTixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsYUFBYTtRQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQsVUFBVTtRQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQsV0FBVztRQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDVixNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7SUFDOUQsQ0FBQztDQUVGO0FBaEZELCtCQWdGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJ3N0cmVhbSc7XG5pbXBvcnQgeyBTVEFUVVNfQ09ERVMgfSBmcm9tICdodHRwJztcbmltcG9ydCB7IGZvckVhY2ggfSBmcm9tICdsb2Rhc2gnO1xuXG4vKipcbiAqIEEgbW9jayByZXNwb25zZSB1c2VkIHRvIHNpbWx1YXRlIHRoZSBzZXJ2ZXIgcmVzcG9uc2UgdG8gbW9jayByZXF1ZXN0cyBkdXJpbmcgdGVzdHMuIFlvdSBzaG91bGRuJ3RcbiAqIG5lZWQgdG8gaW5zdGFudGlhdGUgdGhlc2UgZGlyZWN0bHkgLSBpbnN0ZWFkLCB1c2UgYW4gQXBwQWNjZXB0YW5jZSB0ZXN0LlxuICpcbiAqIEBwYWNrYWdlIHRlc3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9ja1Jlc3BvbnNlIGV4dGVuZHMgVHJhbnNmb3JtIHtcblxuICAvLyBNb2NrIGludGVybmFscyBvZiBTZXJ2ZXJSZXNwb25zZVxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyBtZW1iZXItYWNjZXNzXG4gIHN0YXR1c0NvZGUgPSAyMDA7XG4gIHN0YXR1c01lc3NhZ2UgPSBTVEFUVVNfQ09ERVNbMjAwXTtcbiAgX2hlYWRlcnM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcbiAgX2J1ZmZlcnM6IEJ1ZmZlcltdID0gW107XG5cbiAgY29uc3RydWN0b3IoZmluaXNoPzogKCkgPT4gdm9pZCkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKHR5cGVvZiBmaW5pc2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMub24oJ2ZpbmlzaCcsIGZpbmlzaCk7XG4gICAgfVxuICB9XG5cbiAgX3RyYW5zZm9ybShjaHVuazogQnVmZmVyLCBlbmNvZGluZzogc3RyaW5nLCBuZXh0OiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoKGNodW5rKTtcbiAgICB0aGlzLl9idWZmZXJzLnB1c2goY2h1bmspO1xuICAgIG5leHQoKTtcbiAgfVxuXG4gIHNldEhlYWRlcihuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9oZWFkZXJzW25hbWUudG9Mb3dlckNhc2UoKV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGdldEhlYWRlcihuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9oZWFkZXJzW25hbWUudG9Mb3dlckNhc2UoKV07XG4gIH1cblxuICByZW1vdmVIZWFkZXIobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgZGVsZXRlIHRoaXMuX2hlYWRlcnNbbmFtZS50b0xvd2VyQ2FzZSgpXTtcbiAgfVxuXG4gIF9pbXBsaWNpdEhlYWRlcigpOiB2b2lkIHtcbiAgICB0aGlzLndyaXRlSGVhZCh0aGlzLnN0YXR1c0NvZGUpO1xuICB9XG5cbiAgd3JpdGVIZWFkKHN0YXR1c0NvZGU6IG51bWJlciwgcmVhc29uPzogc3RyaW5nLCBoZWFkZXJzPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSk6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgcmVhc29uICE9PSAnc3RyaW5nJykge1xuICAgICAgaGVhZGVycyA9IHJlYXNvbjtcbiAgICAgIHJlYXNvbiA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuc3RhdHVzQ29kZSA9IHN0YXR1c0NvZGU7XG4gICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gcmVhc29uIHx8IFNUQVRVU19DT0RFU1tzdGF0dXNDb2RlXSB8fCAndW5rbm93bic7XG4gICAgaWYgKGhlYWRlcnMpIHtcbiAgICAgIGZvckVhY2goaGVhZGVycywgKHZhbHVlLCBuYW1lKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0SGVhZGVyKG5hbWUsIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRTdHJpbmcoKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQodGhpcy5fYnVmZmVycykudG9TdHJpbmcoKTtcbiAgfVxuXG4gIF9nZXRKU09OKCkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHRoaXMuX2dldFN0cmluZygpKTtcbiAgfVxuXG4gIHdyaXRlQ29udGludWUoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNb2NrUmVzcG9uc2Uud3JpdGVDb250aW51ZSgpIGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgc2V0VGltZW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01vY2tSZXNwb25zZS5zZXRUaW1lb3V0KCkgaXMgbm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBhZGRUcmFpbGVycygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01vY2tSZXNwb25zZS5hZGRUcmFpbGVycygpIGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0IGhlYWRlcnNTZW50KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTW9ja1Jlc3BvbnNlLmhlYWRlcnNTZW50IGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgZ2V0IHNlbmREYXRlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTW9ja1Jlc3BvbnNlLnNlbmREYXRlIGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbn1cbiJdfQ==