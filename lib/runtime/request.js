"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const accepts = require("accepts");
const typeis = require("type-is");
const url = require("url");
const uuid = require("uuid");
const object_1 = require("../metal/object");
/**
 * The Request class represents an incoming HTTP request (specifically, Node's IncomingMessage).
 * It's designed with an express-compatible interface to allow interop with existing express
 * middleware.
 *
 * @package runtime
 * @since 0.1.0
 */
class Request extends object_1.default {
    constructor(incomingMessage) {
        super();
        /**
         * baseUrl of the app, needed to simulate Express request api
         *
         * @since 0.1.0
         */
        this.baseUrl = '/';
        this._incomingMessage = incomingMessage;
        this.parsedUrl = url.parse(incomingMessage.url, true);
        this.url = this.parsedUrl.pathname;
        this.id = uuid.v4();
    }
    /**
     * The incoming request body, buffered and parsed by the serializer (if applicable)
     *
     * @since 0.1.0
     */
    get body() {
        return this._incomingMessage.body;
    }
    set body(value) {
        this._incomingMessage.body = value;
    }
    /**
     * The HTTP method of the request, lowercased
     *
     * @since 0.1.0
     */
    get method() {
        return this._incomingMessage.method.toLowerCase();
    }
    /**
     * The host name specified in the request (not including port number)
     *
     * @since 0.1.0
     */
    get hostname() {
        let host = this.get('host');
        return (host || '').split(':')[0];
    }
    /**
     * The IP address of the incoming request's connection
     *
     * @since 0.1.0
     */
    get ip() {
        return this._incomingMessage.socket.remoteAddress;
    }
    /**
     * The original path, without any modifications by middleware
     * or the router.
     *
     * TODO: when denali supports mounting on a subpath, this should
     *       be updated to reflect the full path, and the path variable
     *       in this class will be the path *after* the subpath
     *
     * @since 0.1.0
     */
    get originalUrl() {
        return this.parsedUrl.pathname;
    }
    /**
     * The path extracted from the URL of the incoming request.
     *
     * @since 0.1.0
     */
    get path() {
        return this.parsedUrl.pathname;
    }
    /**
     * The protocol extracted from the URL of the incoming request
     *
     * @since 0.1.0
     */
    get protocol() {
        return this.parsedUrl.protocol.toLowerCase();
    }
    /**
     * The query params supplied with the request URL, parsed into an object
     *
     * @since 0.1.0
     */
    get query() {
        return this.parsedUrl.query;
    }
    /**
     * Whether or not this request was made over https
     *
     * @since 0.1.0
     */
    get secure() {
        return this.protocol === 'https:';
    }
    /**
     * Whether or not this request was made by a client library
     *
     * @since 0.1.0
     */
    get xhr() {
        return this.get('x-requested-with') === 'XMLHttpRequest';
    }
    /**
     * The headers of the incoming request
     *
     * @since 0.1.0
     */
    get headers() {
        return this._incomingMessage.headers;
    }
    /**
     * An array of subdomains of the incoming request:
     *     // GET foo.bar.example.com
     *     request.subdomains  // [ 'foo', 'bar' ]
     *
     * @since 0.1.0
     */
    get subdomains() {
        // Drop the tld and root domain name
        return lodash_1.dropRight(this.hostname.split('.'), 2);
    }
    /*
     * Additional public properties of the IncomingMessage object
     */
    get httpVersion() {
        return this._incomingMessage.httpVersion;
    }
    get rawHeaders() {
        return this._incomingMessage.rawHeaders;
    }
    get rawTrailers() {
        return this._incomingMessage.rawTrailers;
    }
    get socket() {
        return this._incomingMessage.socket;
    }
    get statusCode() {
        return this._incomingMessage.statusCode;
    }
    get statusMessage() {
        return this._incomingMessage.statusMessage;
    }
    get trailers() {
        return this._incomingMessage.trailers;
    }
    get connection() {
        return this._incomingMessage.connection;
    }
    /**
     * Returns the best match for content types, or false if no match is possible. See the docs for
     * the `accepts` module on npm for more details.
     *
     * @since 0.1.0
     */
    accepts(serverAcceptedTypes) {
        return accepts(this._incomingMessage).type(serverAcceptedTypes);
    }
    /**
     * Gets the value of a header.
     *
     * @since 0.1.0
     */
    get(header) {
        return this._incomingMessage.headers[header.toLowerCase()];
    }
    /**
     * Checks if the request matches the supplied content types. See type-is module for details.
     *
     * @since 0.1.0
     */
    is(...types) {
        return typeis(this._incomingMessage, types);
    }
    /*
     * Below are methods from the IncomingMessage class, which includes the public methods
     * of the Readable & EventEmitter interfaces as well
     */
    /*
     * EventEmitter methods
     */
    addListener(eventName, listener) {
        this._incomingMessage.addListener(eventName, listener);
        return this;
    }
    emit(eventName, ...args) {
        return this._incomingMessage.emit(eventName, ...args);
    }
    eventNames() {
        return this._incomingMessage.eventNames();
    }
    getMaxListeners() {
        return this._incomingMessage.getMaxListeners();
    }
    listenerCount(eventName) {
        return this._incomingMessage.listenerCount(eventName);
    }
    listeners(eventName) {
        return this._incomingMessage.listeners(eventName);
    }
    on(eventName, listener) {
        this._incomingMessage.on(eventName, listener);
        return this;
    }
    once(eventName, listener) {
        this._incomingMessage.once(eventName, listener);
        return this;
    }
    prependListener(eventName, listener) {
        this._incomingMessage.prependListener(eventName, listener);
        return this;
    }
    prependOnceListener(eventName, listener) {
        this._incomingMessage.prependOnceListener(eventName, listener);
        return this;
    }
    removeAllListeners(eventName) {
        this._incomingMessage.removeAllListeners(eventName);
        return this;
    }
    removeListener(eventName, listener) {
        this._incomingMessage.removeListener(eventName, listener);
        return this;
    }
    setMaxListeners(n) {
        this._incomingMessage.setMaxListeners(n);
        return this;
    }
    /*
     * Readable methods
     */
    isPaused() {
        return this._incomingMessage.isPaused();
    }
    pause() {
        this._incomingMessage.pause();
        return this;
    }
    pipe(destination, options) {
        return this._incomingMessage.pipe(destination, options);
    }
    read(size) {
        return this._incomingMessage.read(size);
    }
    resume() {
        this._incomingMessage.resume();
        return this;
    }
    setEncoding(encoding) {
        this._incomingMessage.setEncoding(encoding);
        return this;
    }
    unpipe(destination) {
        return this._incomingMessage.unpipe(destination);
    }
    unshift(chunk) {
        return this._incomingMessage.unshift(chunk);
    }
    wrap(stream) {
        return this._incomingMessage.wrap(stream);
    }
    /*
     * IncomingMessage methods
     */
    destroy(error) {
        return this._incomingMessage.destroy(error);
    }
    setTimeout(msecs, callback) {
        this._incomingMessage.setTimeout(msecs, callback);
        return this;
    }
}
exports.default = Request;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWJ1cmRpbmUvUHJvamVjdHMvZGVuYWxpL21haW4vIiwic291cmNlcyI6WyJsaWIvcnVudGltZS9yZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBRWdCO0FBQ2hCLG1DQUFtQztBQUNuQyxrQ0FBa0M7QUFDbEMsMkJBQTJCO0FBRTNCLDZCQUE2QjtBQUc3Qiw0Q0FBMkM7QUFXM0M7Ozs7Ozs7R0FPRztBQUNILGFBQTZCLFNBQVEsZ0JBQVk7SUFpRS9DLFlBQVksZUFBcUM7UUFDL0MsS0FBSyxFQUFFLENBQUM7UUFqQ1Y7Ozs7V0FJRztRQUNILFlBQU8sR0FBRyxHQUFHLENBQUM7UUE2QlosSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztRQUN4QyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1FBQ25DLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUF4QkQ7Ozs7T0FJRztJQUNILElBQUksSUFBSTtRQUNOLE1BQU0sQ0FBTyxJQUFJLENBQUMsZ0JBQWlCLENBQUMsSUFBSSxDQUFDO0lBQzNDLENBQUM7SUFDRCxJQUFJLElBQUksQ0FBQyxLQUFLO1FBQ04sSUFBSSxDQUFDLGdCQUFpQixDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7SUFDNUMsQ0FBQztJQWdCRDs7OztPQUlHO0lBQ0gsSUFBSSxNQUFNO1FBQ1IsTUFBTSxDQUFTLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDNUQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxJQUFJLFFBQVE7UUFDVixJQUFJLElBQUksR0FBRyxJ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QUFDO1FBQ2xELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0Y7QUFqWEQsMEJBaVhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgZHJvcFJpZ2h0XG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBhY2NlcHRzIGZyb20gJ2FjY2VwdHMnO1xuaW1wb3J0ICogYXMgdHlwZWlzIGZyb20gJ3R5cGUtaXMnO1xuaW1wb3J0ICogYXMgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgKiBhcyBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0ICogYXMgdXVpZCBmcm9tICd1dWlkJztcbmltcG9ydCB7IFNvY2tldCB9IGZyb20gJ25ldCc7XG5pbXBvcnQgeyBSZWFkYWJsZSwgV3JpdGFibGUgfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IERlbmFsaU9iamVjdCBmcm9tICcuLi9tZXRhbC9vYmplY3QnO1xuaW1wb3J0IFJvdXRlIGZyb20gJy4vcm91dGUnO1xuXG4vKipcbiAqIEF2YWlsYWJsZSBIVFRQIG1ldGhvZHMgKGxvd2VyY2FzZWQpXG4gKlxuICogQHBhY2thZ2UgcnVudGltZVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCB0eXBlIE1ldGhvZCA9ICdnZXQnIHwgJ3Bvc3QnIHwgJ3B1dCcgfCAncGF0Y2gnIHwgJ2RlbGV0ZScgfCAnaGVhZCcgfCAnb3B0aW9ucyc7XG5cbi8qKlxuICogVGhlIFJlcXVlc3QgY2xhc3MgcmVwcmVzZW50cyBhbiBpbmNvbWluZyBIVFRQIHJlcXVlc3QgKHNwZWNpZmljYWxseSwgTm9kZSdzIEluY29taW5nTWVzc2FnZSkuXG4gKiBJdCdzIGRlc2lnbmVkIHdpdGggYW4gZXhwcmVzcy1jb21wYXRpYmxlIGludGVyZmFjZSB0byBhbGxvdyBpbnRlcm9wIHdpdGggZXhpc3RpbmcgZXhwcmVzc1xuICogbWlkZGxld2FyZS5cbiAqXG4gKiBAcGFja2FnZSBydW50aW1lXG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVxdWVzdCBleHRlbmRzIERlbmFsaU9iamVjdCB7XG5cbiAgLyoqXG4gICAqIEEgVVVJRCBnZW5lcmF0ZWQgdW5xaXVlIHRvIHRoaXMgcmVxdWVzdC4gVXNlZnVsIGZvciB0cmFjaW5nIGEgcmVxdWVzdCB0aHJvdWdoIHRoZSBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBpZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgcGFyc2VkIFVSTCBvZiB0aGUgSW5jb21pbmdNZXNzYWdlXG4gICAqL1xuICBwcml2YXRlIHBhcnNlZFVybDogdXJsLlVybDtcblxuICAvKipcbiAgICogVGhlIG9yaWdpbmFsIEluY29taW5nTWVzc2FnZSBmcm9tIHRoZSBIVFRQIGxpYnJhcnkuXG4gICAqL1xuICBwcml2YXRlIF9pbmNvbWluZ01lc3NhZ2U6IGh0dHAuSW5jb21pbmdNZXNzYWdlO1xuXG4gIC8qKlxuICAgKiBUaGUgcm91dGUgcGFyc2VyIHJvdXRlIHRoYXQgd2FzIG1hdGNoZWRcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICByb3V0ZTogUm91dGU7XG5cbiAgLyoqXG4gICAqIFRoZSByZXF1ZXN0cyBwYXJhbXMgZXh0cmFjdGVkIGZyb20gdGhlIHJvdXRlIHBhcnNlciAoaS5lLiBqdXN0IHRoZSBVUkwgc2VnZW1lbnQgcGFyYW1zKVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHBhcmFtczogYW55O1xuXG4gIC8qKlxuICAgKiBiYXNlVXJsIG9mIHRoZSBhcHAsIG5lZWRlZCB0byBzaW11bGF0ZSBFeHByZXNzIHJlcXVlc3QgYXBpXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYmFzZVVybCA9ICcvJztcblxuICAvKipcbiAgICogVXJsIG9mIHRoZSByZXF1ZXN0IC0+IGNhbiBiZSBtb2RpZmllZFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHVybDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgaW5jb21pbmcgcmVxdWVzdCBib2R5LCBidWZmZXJlZCBhbmQgcGFyc2VkIGJ5IHRoZSBzZXJpYWxpemVyIChpZiBhcHBsaWNhYmxlKVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldCBib2R5KCk6IGFueSB7XG4gICAgcmV0dXJuICg8YW55PnRoaXMuX2luY29taW5nTWVzc2FnZSkuYm9keTtcbiAgfVxuICBzZXQgYm9keSh2YWx1ZSkge1xuICAgICg8YW55PnRoaXMuX2luY29taW5nTWVzc2FnZSkuYm9keSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBvcmlnaW5hbCBhY3Rpb24gdGhhdCB3YXMgaW52b2tlZCBmb3IgdGhpcyByZXF1ZXN0LiBVc2VkIHdoZW4gYW4gZXJyb3Igb2NjdXJzXG4gICAqIHNvIHRoZSBlcnJvciBhY3Rpb24gY2FuIHNlZSB0aGUgb3JpZ2luYWwgYWN0aW9uIHRoYXQgd2FzIGludm9rZWQuXG4gICAqL1xuICBfb3JpZ2luYWxBY3Rpb246IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihpbmNvbWluZ01lc3NhZ2U6IGh0dHAuSW5jb21pbmdNZXNzYWdlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2UgPSBpbmNvbWluZ01lc3NhZ2U7XG4gICAgdGhpcy5wYXJzZWRVcmwgPSB1cmwucGFyc2UoaW5jb21pbmdNZXNzYWdlLnVybCwgdHJ1ZSk7XG4gICAgdGhpcy51cmwgPSB0aGlzLnBhcnNlZFVybC5wYXRobmFtZTtcbiAgICB0aGlzLmlkID0gdXVpZC52NCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBIVFRQIG1ldGhvZCBvZiB0aGUgcmVxdWVzdCwgbG93ZXJjYXNlZFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldCBtZXRob2QoKTogTWV0aG9kIHtcbiAgICByZXR1cm4gPE1ldGhvZD50aGlzLl9pbmNvbWluZ01lc3NhZ2UubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGhvc3QgbmFtZSBzcGVjaWZpZWQgaW4gdGhlIHJlcXVlc3QgKG5vdCBpbmNsdWRpbmcgcG9ydCBudW1iZXIpXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IGhvc3RuYW1lKCk6IHN0cmluZyB7XG4gICAgbGV0IGhvc3QgPSB0aGlzLmdldCgnaG9zdCcpO1xuICAgIHJldHVybiAoaG9zdCB8fCAnJykuc3BsaXQoJzonKVswXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgSVAgYWRkcmVzcyBvZiB0aGUgaW5jb21pbmcgcmVxdWVzdCdzIGNvbm5lY3Rpb25cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBnZXQgaXAoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnNvY2tldC5yZW1vdGVBZGRyZXNzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBvcmlnaW5hbCBwYXRoLCB3aXRob3V0IGFueSBtb2RpZmljYXRpb25zIGJ5IG1pZGRsZXdhcmVcbiAgICogb3IgdGhlIHJvdXRlci5cbiAgICpcbiAgICogVE9ETzogd2hlbiBkZW5hbGkgc3VwcG9ydHMgbW91bnRpbmcgb24gYSBzdWJwYXRoLCB0aGlzIHNob3VsZFxuICAgKiAgICAgICBiZSB1cGRhdGVkIHRvIHJlZmxlY3QgdGhlIGZ1bGwgcGF0aCwgYW5kIHRoZSBwYXRoIHZhcmlhYmxlXG4gICAqICAgICAgIGluIHRoaXMgY2xhc3Mgd2lsbCBiZSB0aGUgcGF0aCAqYWZ0ZXIqIHRoZSBzdWJwYXRoXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IG9yaWdpbmFsVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VkVXJsLnBhdGhuYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBwYXRoIGV4dHJhY3RlZCBmcm9tIHRoZSBVUkwgb2YgdGhlIGluY29taW5nIHJlcXVlc3QuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IHBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZWRVcmwucGF0aG5hbWU7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHByb3RvY29sIGV4dHJhY3RlZCBmcm9tIHRoZSBVUkwgb2YgdGhlIGluY29taW5nIHJlcXVlc3RcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBnZXQgcHJvdG9jb2woKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZWRVcmwucHJvdG9jb2wudG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcXVlcnkgcGFyYW1zIHN1cHBsaWVkIHdpdGggdGhlIHJlcXVlc3QgVVJMLCBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBnZXQgcXVlcnkoKTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VkVXJsLnF1ZXJ5O1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb3Igbm90IHRoaXMgcmVxdWVzdCB3YXMgbWFkZSBvdmVyIGh0dHBzXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IHNlY3VyZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wcm90b2NvbCA9PT0gJ2h0dHBzOic7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciBvciBub3QgdGhpcyByZXF1ZXN0IHdhcyBtYWRlIGJ5IGEgY2xpZW50IGxpYnJhcnlcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBnZXQgeGhyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldCgneC1yZXF1ZXN0ZWQtd2l0aCcpID09PSAnWE1MSHR0cFJlcXVlc3QnO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBoZWFkZXJzIG9mIHRoZSBpbmNvbWluZyByZXF1ZXN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IGhlYWRlcnMoKTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5oZWFkZXJzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIHN1YmRvbWFpbnMgb2YgdGhlIGluY29taW5nIHJlcXVlc3Q6XG4gICAqICAgICAvLyBHRVQgZm9vLmJhci5leGFtcGxlLmNvbVxuICAgKiAgICAgcmVxdWVzdC5zdWJkb21haW5zICAvLyBbICdmb28nLCAnYmFyJyBdXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IHN1YmRvbWFpbnMoKTogc3RyaW5nW10ge1xuICAgIC8vIERyb3AgdGhlIHRsZCBhbmQgcm9vdCBkb21haW4gbmFtZVxuICAgIHJldHVybiBkcm9wUmlnaHQodGhpcy5ob3N0bmFtZS5zcGxpdCgnLicpLCAyKTtcbiAgfVxuXG4gIC8qXG4gICAqIEFkZGl0aW9uYWwgcHVibGljIHByb3BlcnRpZXMgb2YgdGhlIEluY29taW5nTWVzc2FnZSBvYmplY3RcbiAgICovXG5cbiAgZ2V0IGh0dHBWZXJzaW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5odHRwVmVyc2lvbjtcbiAgfVxuXG4gIGdldCByYXdIZWFkZXJzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnJhd0hlYWRlcnM7XG4gIH1cblxuICBnZXQgcmF3VHJhaWxlcnMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UucmF3VHJhaWxlcnM7XG4gIH1cblxuICBnZXQgc29ja2V0KCk6IFNvY2tldCB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5zb2NrZXQ7XG4gIH1cblxuICBnZXQgc3RhdHVzQ29kZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2Uuc3RhdHVzQ29kZTtcbiAgfVxuXG4gIGdldCBzdGF0dXNNZXNzYWdlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5zdGF0dXNNZXNzYWdlO1xuICB9XG5cbiAgZ2V0IHRyYWlsZXJzKCk6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0ge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UudHJhaWxlcnM7XG4gIH1cblxuICBnZXQgY29ubmVjdGlvbigpOiBTb2NrZXQge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UuY29ubmVjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiZXN0IG1hdGNoIGZvciBjb250ZW50IHR5cGVzLCBvciBmYWxzZSBpZiBubyBtYXRjaCBpcyBwb3NzaWJsZS4gU2VlIHRoZSBkb2NzIGZvclxuICAgKiB0aGUgYGFjY2VwdHNgIG1vZHVsZSBvbiBucG0gZm9yIG1vcmUgZGV0YWlscy5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBhY2NlcHRzKHNlcnZlckFjY2VwdGVkVHlwZXM6IHN0cmluZ1tdKTogc3RyaW5nIHwgYm9vbGVhbiB7XG4gICAgcmV0dXJuIGFjY2VwdHModGhpcy5faW5jb21pbmdNZXNzYWdlKS50eXBlKHNlcnZlckFjY2VwdGVkVHlwZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHZhbHVlIG9mIGEgaGVhZGVyLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldChoZWFkZXI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5oZWFkZXJzW2hlYWRlci50b0xvd2VyQ2FzZSgpXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHJlcXVlc3QgbWF0Y2hlcyB0aGUgc3VwcGxpZWQgY29udGVudCB0eXBlcy4gU2VlIHR5cGUtaXMgbW9kdWxlIGZvciBkZXRhaWxzLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGlzKC4uLnR5cGVzOiBzdHJpbmdbXSk6IHN0cmluZyB8IGJvb2xlYW4ge1xuICAgIHJldHVybiA8c3RyaW5nfGJvb2xlYW4+dHlwZWlzKHRoaXMuX2luY29taW5nTWVzc2FnZSwgdHlwZXMpO1xuICB9XG5cbiAgLypcbiAgICogQmVsb3cgYXJlIG1ldGhvZHMgZnJvbSB0aGUgSW5jb21pbmdNZXNzYWdlIGNsYXNzLCB3aGljaCBpbmNsdWRlcyB0aGUgcHVibGljIG1ldGhvZHNcbiAgICogb2YgdGhlIFJlYWRhYmxlICYgRXZlbnRFbWl0dGVyIGludGVyZmFjZXMgYXMgd2VsbFxuICAgKi9cblxuICAvKlxuICAgKiBFdmVudEVtaXR0ZXIgbWV0aG9kc1xuICAgKi9cblxuICBhZGRMaXN0ZW5lcihldmVudE5hbWU6IGFueSwgbGlzdGVuZXI6IEZ1bmN0aW9uKTogUmVxdWVzdCB7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlLmFkZExpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZW1pdChldmVudE5hbWU6IGFueSwgLi4uYXJnczogYW55W10pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLmVtaXQoZXZlbnROYW1lLCAuLi5hcmdzKTtcbiAgfVxuXG4gIGV2ZW50TmFtZXMoKTogYW55W10ge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UuZXZlbnROYW1lcygpO1xuICB9XG5cbiAgZ2V0TWF4TGlzdGVuZXJzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5nZXRNYXhMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIGxpc3RlbmVyQ291bnQoZXZlbnROYW1lOiBhbnkpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UubGlzdGVuZXJDb3VudChldmVudE5hbWUpO1xuICB9XG5cbiAgbGlzdGVuZXJzKGV2ZW50TmFtZTogYW55KTogRnVuY3Rpb25bXSB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5saXN0ZW5lcnMoZXZlbnROYW1lKTtcbiAgfVxuXG4gIG9uKGV2ZW50TmFtZTogYW55LCBsaXN0ZW5lcjogRnVuY3Rpb24pOiBSZXF1ZXN0IHtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2Uub24oZXZlbnROYW1lLCBsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBvbmNlKGV2ZW50TmFtZTogYW55LCBsaXN0ZW5lcjogRnVuY3Rpb24pOiBSZXF1ZXN0IHtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2Uub25jZShldmVudE5hbWUsIGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByZXBlbmRMaXN0ZW5lcihldmVudE5hbWU6IGFueSwgbGlzdGVuZXI6IEZ1bmN0aW9uKTogUmVxdWVzdCB7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlLnByZXBlbmRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByZXBlbmRPbmNlTGlzdGVuZXIoZXZlbnROYW1lOiBhbnksIGxpc3RlbmVyOiBGdW5jdGlvbik6IFJlcXVlc3Qge1xuICAgIHRoaXMuX2luY29taW5nTWVzc2FnZS5wcmVwZW5kT25jZUxpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50TmFtZT86IGFueSk6IFJlcXVlc3Qge1xuICAgIHRoaXMuX2luY29taW5nTWVzc2FnZS5yZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnROYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbW92ZUxpc3RlbmVyKGV2ZW50TmFtZTogYW55LCBsaXN0ZW5lcjogRnVuY3Rpb24pOiBSZXF1ZXN0IHtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2UucmVtb3ZlTGlzdGVuZXIoZXZlbnROYW1lLCBsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRNYXhMaXN0ZW5lcnMobjogbnVtYmVyKTogUmVxdWVzdCB7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlLnNldE1heExpc3RlbmVycyhuKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qXG4gICAqIFJlYWRhYmxlIG1ldGhvZHNcbiAgICovXG5cbiAgaXNQYXVzZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5pc1BhdXNlZCgpO1xuICB9XG5cbiAgcGF1c2UoKTogUmVxdWVzdCB7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlLnBhdXNlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwaXBlKGRlc3RpbmF0aW9uOiBXcml0YWJsZSwgb3B0aW9ucz86IE9iamVjdCk6IFdyaXRhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnBpcGUoZGVzdGluYXRpb24sIG9wdGlvbnMpO1xuICB9XG5cbiAgcmVhZChzaXplPzogbnVtYmVyKTogc3RyaW5nIHwgQnVmZmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5yZWFkKHNpemUpO1xuICB9XG5cbiAgcmVzdW1lKCk6IFJlcXVlc3Qge1xuICAgIHRoaXMuX2luY29taW5nTWVzc2FnZS5yZXN1bWUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEVuY29kaW5nKGVuY29kaW5nOiBzdHJpbmcpOiBSZXF1ZXN0IHtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2Uuc2V0RW5jb2RpbmcoZW5jb2RpbmcpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdW5waXBlKGRlc3RpbmF0aW9uPzogV3JpdGFibGUpIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnVucGlwZShkZXN0aW5hdGlvbik7XG4gIH1cblxuICB1bnNoaWZ0KGNodW5rOiBCdWZmZXIgfCBzdHJpbmcgfCBhbnkpIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnVuc2hpZnQoY2h1bmspO1xuICB9XG5cbiAgd3JhcChzdHJlYW06IFJlYWRhYmxlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS53cmFwKHN0cmVhbSk7XG4gIH1cblxuICAvKlxuICAgKiBJbmNvbWluZ01lc3NhZ2UgbWV0aG9kc1xuICAgKi9cblxuICBkZXN0cm95KGVycm9yOiBFcnJvcikge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UuZGVzdHJveShlcnJvcik7XG4gIH1cblxuICBzZXRUaW1lb3V0KG1zZWNzOiBudW1iZXIsIGNhbGxiYWNrOiBGdW5jdGlvbik6IFJlcXVlc3Qge1xuICAgIHRoaXMuX2luY29taW5nTWVzc2FnZS5zZXRUaW1lb3V0KG1zZWNzLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbiJdfQ==