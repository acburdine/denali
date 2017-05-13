"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const accepts = require("accepts");
const typeis = require("type-is");
const url = require("url");
const uuid = require("uuid");
/**
 * The Request class represents an incoming HTTP request (specifically, Node's IncomingMessage).
 * It's designed with an express-compatible interface to allow interop with existing express
 * middleware.
 *
 * @package runtime
 * @since 0.1.0
 */
class Request {
    constructor(incomingMessage) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvcnVudGltZS9yZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBRWdCO0FBQ2hCLG1DQUFtQztBQUNuQyxrQ0FBa0M7QUFDbEMsMkJBQTJCO0FBRTNCLDZCQUE2QjtBQWE3Qjs7Ozs7OztHQU9HO0FBQ0g7SUFpRUUsWUFBWSxlQUFxQztRQWhDakQ7Ozs7V0FJRztRQUNILFlBQU8sR0FBRyxHQUFHLENBQUM7UUE0QlosSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztRQUN4QyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1FBQ25DLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUF2QkQ7Ozs7T0FJRztJQUNILElBQUksSUFBSTtRQUNOLE1BQU0sQ0FBTyxJQUFJLENBQUMsZ0JBQWlCLENBQUMsSUFBSSxDQUFDO0lBQzNDLENBQUM7SUFDRCxJQUFJLElBQUksQ0FBQyxLQUFLO1FBQ04sSUFBSSxDQUFDLGdCQUFpQixDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7SUFDNUMsQ0FBQztJQWVEOzs7O09BSUc7SUFDSCxJQUFJLE1BQU07UUFDUixNQUFNLENBQVMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUM1RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQUksUUFBUTtRQUNWLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUIsTUFBTSxDQUFD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RCwwQkFnWEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBkcm9wUmlnaHRcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIGFjY2VwdHMgZnJvbSAnYWNjZXB0cyc7XG5pbXBvcnQgKiBhcyB0eXBlaXMgZnJvbSAndHlwZS1pcyc7XG5pbXBvcnQgKiBhcyB1cmwgZnJvbSAndXJsJztcbmltcG9ydCAqIGFzIGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgKiBhcyB1dWlkIGZyb20gJ3V1aWQnO1xuaW1wb3J0IHsgU29ja2V0IH0gZnJvbSAnbmV0JztcbmltcG9ydCB7IFJlYWRhYmxlLCBXcml0YWJsZSB9IGZyb20gJ3N0cmVhbSc7XG5pbXBvcnQgUm91dGUgZnJvbSAnLi9yb3V0ZSc7XG5cbi8qKlxuICogQXZhaWxhYmxlIEhUVFAgbWV0aG9kcyAobG93ZXJjYXNlZClcbiAqXG4gKiBAcGFja2FnZSBydW50aW1lXG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuZXhwb3J0IHR5cGUgTWV0aG9kID0gJ2dldCcgfCAncG9zdCcgfCAncHV0JyB8ICdwYXRjaCcgfCAnZGVsZXRlJyB8ICdoZWFkJyB8ICdvcHRpb25zJztcblxuLyoqXG4gKiBUaGUgUmVxdWVzdCBjbGFzcyByZXByZXNlbnRzIGFuIGluY29taW5nIEhUVFAgcmVxdWVzdCAoc3BlY2lmaWNhbGx5LCBOb2RlJ3MgSW5jb21pbmdNZXNzYWdlKS5cbiAqIEl0J3MgZGVzaWduZWQgd2l0aCBhbiBleHByZXNzLWNvbXBhdGlibGUgaW50ZXJmYWNlIHRvIGFsbG93IGludGVyb3Agd2l0aCBleGlzdGluZyBleHByZXNzXG4gKiBtaWRkbGV3YXJlLlxuICpcbiAqIEBwYWNrYWdlIHJ1bnRpbWVcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXF1ZXN0IHtcblxuICAvKipcbiAgICogQSBVVUlEIGdlbmVyYXRlZCB1bnFpdWUgdG8gdGhpcyByZXF1ZXN0LiBVc2VmdWwgZm9yIHRyYWNpbmcgYSByZXF1ZXN0IHRocm91Z2ggdGhlIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGlkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBwYXJzZWQgVVJMIG9mIHRoZSBJbmNvbWluZ01lc3NhZ2VcbiAgICovXG4gIHByaXZhdGUgcGFyc2VkVXJsOiB1cmwuVXJsO1xuXG4gIC8qKlxuICAgKiBUaGUgb3JpZ2luYWwgSW5jb21pbmdNZXNzYWdlIGZyb20gdGhlIEhUVFAgbGlicmFyeS5cbiAgICovXG4gIHByaXZhdGUgX2luY29taW5nTWVzc2FnZTogaHR0cC5JbmNvbWluZ01lc3NhZ2U7XG5cbiAgLyoqXG4gICAqIFRoZSByb3V0ZSBwYXJzZXIgcm91dGUgdGhhdCB3YXMgbWF0Y2hlZFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHJvdXRlOiBSb3V0ZTtcblxuICAvKipcbiAgICogVGhlIHJlcXVlc3RzIHBhcmFtcyBleHRyYWN0ZWQgZnJvbSB0aGUgcm91dGUgcGFyc2VyIChpLmUuIGp1c3QgdGhlIFVSTCBzZWdlbWVudCBwYXJhbXMpXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcGFyYW1zOiBhbnk7XG5cbiAgLyoqXG4gICAqIGJhc2VVcmwgb2YgdGhlIGFwcCwgbmVlZGVkIHRvIHNpbXVsYXRlIEV4cHJlc3MgcmVxdWVzdCBhcGlcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBiYXNlVXJsID0gJy8nO1xuXG4gIC8qKlxuICAgKiBVcmwgb2YgdGhlIHJlcXVlc3QgLT4gY2FuIGJlIG1vZGlmaWVkXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgdXJsOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBpbmNvbWluZyByZXF1ZXN0IGJvZHksIGJ1ZmZlcmVkIGFuZCBwYXJzZWQgYnkgdGhlIHNlcmlhbGl6ZXIgKGlmIGFwcGxpY2FibGUpXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IGJvZHkoKTogYW55IHtcbiAgICByZXR1cm4gKDxhbnk+dGhpcy5faW5jb21pbmdNZXNzYWdlKS5ib2R5O1xuICB9XG4gIHNldCBib2R5KHZhbHVlKSB7XG4gICAgKDxhbnk+dGhpcy5faW5jb21pbmdNZXNzYWdlKS5ib2R5ID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIG9yaWdpbmFsIGFjdGlvbiB0aGF0IHdhcyBpbnZva2VkIGZvciB0aGlzIHJlcXVlc3QuIFVzZWQgd2hlbiBhbiBlcnJvciBvY2N1cnNcbiAgICogc28gdGhlIGVycm9yIGFjdGlvbiBjYW4gc2VlIHRoZSBvcmlnaW5hbCBhY3Rpb24gdGhhdCB3YXMgaW52b2tlZC5cbiAgICovXG4gIF9vcmlnaW5hbEFjdGlvbjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGluY29taW5nTWVzc2FnZTogaHR0cC5JbmNvbWluZ01lc3NhZ2UpIHtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2UgPSBpbmNvbWluZ01lc3NhZ2U7XG4gICAgdGhpcy5wYXJzZWRVcmwgPSB1cmwucGFyc2UoaW5jb21pbmdNZXNzYWdlLnVybCwgdHJ1ZSk7XG4gICAgdGhpcy51cmwgPSB0aGlzLnBhcnNlZFVybC5wYXRobmFtZTtcbiAgICB0aGlzLmlkID0gdXVpZC52NCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBIVFRQIG1ldGhvZCBvZiB0aGUgcmVxdWVzdCwgbG93ZXJjYXNlZFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldCBtZXRob2QoKTogTWV0aG9kIHtcbiAgICByZXR1cm4gPE1ldGhvZD50aGlzLl9pbmNvbWluZ01lc3NhZ2UubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGhvc3QgbmFtZSBzcGVjaWZpZWQgaW4gdGhlIHJlcXVlc3QgKG5vdCBpbmNsdWRpbmcgcG9ydCBudW1iZXIpXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IGhvc3RuYW1lKCk6IHN0cmluZyB7XG4gICAgbGV0IGhvc3QgPSB0aGlzLmdldCgnaG9zdCcpO1xuICAgIHJldHVybiAoaG9zdCB8fCAnJykuc3BsaXQoJzonKVswXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgSVAgYWRkcmVzcyBvZiB0aGUgaW5jb21pbmcgcmVxdWVzdCdzIGNvbm5lY3Rpb25cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBnZXQgaXAoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnNvY2tldC5yZW1vdGVBZGRyZXNzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBvcmlnaW5hbCBwYXRoLCB3aXRob3V0IGFueSBtb2RpZmljYXRpb25zIGJ5IG1pZGRsZXdhcmVcbiAgICogb3IgdGhlIHJvdXRlci5cbiAgICpcbiAgICogVE9ETzogd2hlbiBkZW5hbGkgc3VwcG9ydHMgbW91bnRpbmcgb24gYSBzdWJwYXRoLCB0aGlzIHNob3VsZFxuICAgKiAgICAgICBiZSB1cGRhdGVkIHRvIHJlZmxlY3QgdGhlIGZ1bGwgcGF0aCwgYW5kIHRoZSBwYXRoIHZhcmlhYmxlXG4gICAqICAgICAgIGluIHRoaXMgY2xhc3Mgd2lsbCBiZSB0aGUgcGF0aCAqYWZ0ZXIqIHRoZSBzdWJwYXRoXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IG9yaWdpbmFsVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VkVXJsLnBhdGhuYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBwYXRoIGV4dHJhY3RlZCBmcm9tIHRoZSBVUkwgb2YgdGhlIGluY29taW5nIHJlcXVlc3QuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IHBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZWRVcmwucGF0aG5hbWU7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHByb3RvY29sIGV4dHJhY3RlZCBmcm9tIHRoZSBVUkwgb2YgdGhlIGluY29taW5nIHJlcXVlc3RcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBnZXQgcHJvdG9jb2woKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZWRVcmwucHJvdG9jb2wudG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcXVlcnkgcGFyYW1zIHN1cHBsaWVkIHdpdGggdGhlIHJlcXVlc3QgVVJMLCBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBnZXQgcXVlcnkoKTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VkVXJsLnF1ZXJ5O1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb3Igbm90IHRoaXMgcmVxdWVzdCB3YXMgbWFkZSBvdmVyIGh0dHBzXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IHNlY3VyZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wcm90b2NvbCA9PT0gJ2h0dHBzOic7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciBvciBub3QgdGhpcyByZXF1ZXN0IHdhcyBtYWRlIGJ5IGEgY2xpZW50IGxpYnJhcnlcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBnZXQgeGhyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldCgneC1yZXF1ZXN0ZWQtd2l0aCcpID09PSAnWE1MSHR0cFJlcXVlc3QnO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBoZWFkZXJzIG9mIHRoZSBpbmNvbWluZyByZXF1ZXN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IGhlYWRlcnMoKTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5oZWFkZXJzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIHN1YmRvbWFpbnMgb2YgdGhlIGluY29taW5nIHJlcXVlc3Q6XG4gICAqICAgICAvLyBHRVQgZm9vLmJhci5leGFtcGxlLmNvbVxuICAgKiAgICAgcmVxdWVzdC5zdWJkb21haW5zICAvLyBbICdmb28nLCAnYmFyJyBdXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IHN1YmRvbWFpbnMoKTogc3RyaW5nW10ge1xuICAgIC8vIERyb3AgdGhlIHRsZCBhbmQgcm9vdCBkb21haW4gbmFtZVxuICAgIHJldHVybiBkcm9wUmlnaHQodGhpcy5ob3N0bmFtZS5zcGxpdCgnLicpLCAyKTtcbiAgfVxuXG4gIC8qXG4gICAqIEFkZGl0aW9uYWwgcHVibGljIHByb3BlcnRpZXMgb2YgdGhlIEluY29taW5nTWVzc2FnZSBvYmplY3RcbiAgICovXG5cbiAgZ2V0IGh0dHBWZXJzaW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5odHRwVmVyc2lvbjtcbiAgfVxuXG4gIGdldCByYXdIZWFkZXJzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnJhd0hlYWRlcnM7XG4gIH1cblxuICBnZXQgcmF3VHJhaWxlcnMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UucmF3VHJhaWxlcnM7XG4gIH1cblxuICBnZXQgc29ja2V0KCk6IFNvY2tldCB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5zb2NrZXQ7XG4gIH1cblxuICBnZXQgc3RhdHVzQ29kZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2Uuc3RhdHVzQ29kZTtcbiAgfVxuXG4gIGdldCBzdGF0dXNNZXNzYWdlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5zdGF0dXNNZXNzYWdlO1xuICB9XG5cbiAgZ2V0IHRyYWlsZXJzKCk6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0ge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UudHJhaWxlcnM7XG4gIH1cblxuICBnZXQgY29ubmVjdGlvbigpOiBTb2NrZXQge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UuY29ubmVjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiZXN0IG1hdGNoIGZvciBjb250ZW50IHR5cGVzLCBvciBmYWxzZSBpZiBubyBtYXRjaCBpcyBwb3NzaWJsZS4gU2VlIHRoZSBkb2NzIGZvclxuICAgKiB0aGUgYGFjY2VwdHNgIG1vZHVsZSBvbiBucG0gZm9yIG1vcmUgZGV0YWlscy5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBhY2NlcHRzKHNlcnZlckFjY2VwdGVkVHlwZXM6IHN0cmluZ1tdKTogc3RyaW5nIHwgYm9vbGVhbiB7XG4gICAgcmV0dXJuIGFjY2VwdHModGhpcy5faW5jb21pbmdNZXNzYWdlKS50eXBlKHNlcnZlckFjY2VwdGVkVHlwZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHZhbHVlIG9mIGEgaGVhZGVyLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldChoZWFkZXI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5oZWFkZXJzW2hlYWRlci50b0xvd2VyQ2FzZSgpXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHJlcXVlc3QgbWF0Y2hlcyB0aGUgc3VwcGxpZWQgY29udGVudCB0eXBlcy4gU2VlIHR5cGUtaXMgbW9kdWxlIGZvciBkZXRhaWxzLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGlzKC4uLnR5cGVzOiBzdHJpbmdbXSk6IHN0cmluZyB8IGJvb2xlYW4ge1xuICAgIHJldHVybiA8c3RyaW5nfGJvb2xlYW4+dHlwZWlzKHRoaXMuX2luY29taW5nTWVzc2FnZSwgdHlwZXMpO1xuICB9XG5cbiAgLypcbiAgICogQmVsb3cgYXJlIG1ldGhvZHMgZnJvbSB0aGUgSW5jb21pbmdNZXNzYWdlIGNsYXNzLCB3aGljaCBpbmNsdWRlcyB0aGUgcHVibGljIG1ldGhvZHNcbiAgICogb2YgdGhlIFJlYWRhYmxlICYgRXZlbnRFbWl0dGVyIGludGVyZmFjZXMgYXMgd2VsbFxuICAgKi9cblxuICAvKlxuICAgKiBFdmVudEVtaXR0ZXIgbWV0aG9kc1xuICAgKi9cblxuICBhZGRMaXN0ZW5lcihldmVudE5hbWU6IGFueSwgbGlzdGVuZXI6IEZ1bmN0aW9uKTogUmVxdWVzdCB7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlLmFkZExpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZW1pdChldmVudE5hbWU6IGFueSwgLi4uYXJnczogYW55W10pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLmVtaXQoZXZlbnROYW1lLCAuLi5hcmdzKTtcbiAgfVxuXG4gIGV2ZW50TmFtZXMoKTogYW55W10ge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UuZXZlbnROYW1lcygpO1xuICB9XG5cbiAgZ2V0TWF4TGlzdGVuZXJzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5nZXRNYXhMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIGxpc3RlbmVyQ291bnQoZXZlbnROYW1lOiBhbnkpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UubGlzdGVuZXJDb3VudChldmVudE5hbWUpO1xuICB9XG5cbiAgbGlzdGVuZXJzKGV2ZW50TmFtZTogYW55KTogRnVuY3Rpb25bXSB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5saXN0ZW5lcnMoZXZlbnROYW1lKTtcbiAgfVxuXG4gIG9uKGV2ZW50TmFtZTogYW55LCBsaXN0ZW5lcjogRnVuY3Rpb24pOiBSZXF1ZXN0IHtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2Uub24oZXZlbnROYW1lLCBsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBvbmNlKGV2ZW50TmFtZTogYW55LCBsaXN0ZW5lcjogRnVuY3Rpb24pOiBSZXF1ZXN0IHtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2Uub25jZShldmVudE5hbWUsIGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByZXBlbmRMaXN0ZW5lcihldmVudE5hbWU6IGFueSwgbGlzdGVuZXI6IEZ1bmN0aW9uKTogUmVxdWVzdCB7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlLnByZXBlbmRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByZXBlbmRPbmNlTGlzdGVuZXIoZXZlbnROYW1lOiBhbnksIGxpc3RlbmVyOiBGdW5jdGlvbik6IFJlcXVlc3Qge1xuICAgIHRoaXMuX2luY29taW5nTWVzc2FnZS5wcmVwZW5kT25jZUxpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50TmFtZT86IGFueSk6IFJlcXVlc3Qge1xuICAgIHRoaXMuX2luY29taW5nTWVzc2FnZS5yZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnROYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbW92ZUxpc3RlbmVyKGV2ZW50TmFtZTogYW55LCBsaXN0ZW5lcjogRnVuY3Rpb24pOiBSZXF1ZXN0IHtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2UucmVtb3ZlTGlzdGVuZXIoZXZlbnROYW1lLCBsaXN0ZW5lcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRNYXhMaXN0ZW5lcnMobjogbnVtYmVyKTogUmVxdWVzdCB7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlLnNldE1heExpc3RlbmVycyhuKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qXG4gICAqIFJlYWRhYmxlIG1ldGhvZHNcbiAgICovXG5cbiAgaXNQYXVzZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5pc1BhdXNlZCgpO1xuICB9XG5cbiAgcGF1c2UoKTogUmVxdWVzdCB7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlLnBhdXNlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwaXBlKGRlc3RpbmF0aW9uOiBXcml0YWJsZSwgb3B0aW9ucz86IE9iamVjdCk6IFdyaXRhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnBpcGUoZGVzdGluYXRpb24sIG9wdGlvbnMpO1xuICB9XG5cbiAgcmVhZChzaXplPzogbnVtYmVyKTogc3RyaW5nIHwgQnVmZmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS5yZWFkKHNpemUpO1xuICB9XG5cbiAgcmVzdW1lKCk6IFJlcXVlc3Qge1xuICAgIHRoaXMuX2luY29taW5nTWVzc2FnZS5yZXN1bWUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldEVuY29kaW5nKGVuY29kaW5nOiBzdHJpbmcpOiBSZXF1ZXN0IHtcbiAgICB0aGlzLl9pbmNvbWluZ01lc3NhZ2Uuc2V0RW5jb2RpbmcoZW5jb2RpbmcpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdW5waXBlKGRlc3RpbmF0aW9uPzogV3JpdGFibGUpIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnVucGlwZShkZXN0aW5hdGlvbik7XG4gIH1cblxuICB1bnNoaWZ0KGNodW5rOiBCdWZmZXIgfCBzdHJpbmcgfCBhbnkpIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnVuc2hpZnQoY2h1bmspO1xuICB9XG5cbiAgd3JhcChzdHJlYW06IFJlYWRhYmxlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2luY29taW5nTWVzc2FnZS53cmFwKHN0cmVhbSk7XG4gIH1cblxuICAvKlxuICAgKiBJbmNvbWluZ01lc3NhZ2UgbWV0aG9kc1xuICAgKi9cblxuICBkZXN0cm95KGVycm9yOiBFcnJvcikge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UuZGVzdHJveShlcnJvcik7XG4gIH1cblxuICBzZXRUaW1lb3V0KG1zZWNzOiBudW1iZXIsIGNhbGxiYWNrOiBGdW5jdGlvbik6IFJlcXVlc3Qge1xuICAgIHRoaXMuX2luY29taW5nTWVzc2FnZS5zZXRUaW1lb3V0KG1zZWNzLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbiJdfQ==