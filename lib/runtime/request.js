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
        return new Proxy(this, {
            get(req, property) {
                if (req._incomingMessage[property] && typeof req._incomingMessage[property] === 'function') {
                    return req._incomingMessage[property].bind(req._incomingMessage);
                }
                return req[property];
            },
            set(req, property, value) {
                req[property] = value;
                return true;
            }
        });
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
}
exports.default = Request;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvcnVudGltZS9yZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBSWdCO0FBQ2hCLG1DQUFtQztBQUNuQyxrQ0FBa0M7QUFDbEMsMkJBQTJCO0FBRTNCLDZCQUE2QjtBQUM3Qiw0Q0FBMkM7QUFXM0M7Ozs7Ozs7R0FPRztBQUNILGFBQTZCLFNBQVEsZ0JBQVk7SUFpRS9DLFlBQVksZUFBcUM7UUFDL0MsS0FBSyxFQUFFLENBQUM7UUFqQ1Y7Ozs7V0FJRztRQUNJLFlBQU8sR0FBRyxHQUFHLENBQUM7UUE2Qm5CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFDeEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUNuQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUVwQixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO1lBQ3JCLEdBQUcsQ0FBQyxHQUFZLEVBQUUsUUFBZ0I7Z0JBQ2hDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUMzRixNQUFNLENBQU8sR0FBRyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDMUUsQ0FBQztnQkFFRCxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEs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QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDOUQsQ0FBQztDQUVGO0FBL05ELDBCQStOQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGRyb3BSaWdodCxcbiAgdW5pcSxcbiAgaXNBcnJheVxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgYWNjZXB0cyBmcm9tICdhY2NlcHRzJztcbmltcG9ydCAqIGFzIHR5cGVpcyBmcm9tICd0eXBlLWlzJztcbmltcG9ydCAqIGFzIHVybCBmcm9tICd1cmwnO1xuaW1wb3J0ICogYXMgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCAqIGFzIHV1aWQgZnJvbSAndXVpZCc7XG5pbXBvcnQgRGVuYWxpT2JqZWN0IGZyb20gJy4uL21ldGFsL29iamVjdCc7XG5pbXBvcnQgUm91dGUgZnJvbSAnLi9yb3V0ZSc7XG5cbi8qKlxuICogQXZhaWxhYmxlIEhUVFAgbWV0aG9kcyAobG93ZXJjYXNlZClcbiAqXG4gKiBAcGFja2FnZSBydW50aW1lXG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuZXhwb3J0IHR5cGUgTWV0aG9kID0gJ2dldCcgfCAncG9zdCcgfCAncHV0JyB8ICdwYXRjaCcgfCAnZGVsZXRlJyB8ICdoZWFkJyB8ICdvcHRpb25zJztcblxuLyoqXG4gKiBUaGUgUmVxdWVzdCBjbGFzcyByZXByZXNlbnRzIGFuIGluY29taW5nIEhUVFAgcmVxdWVzdCAoc3BlY2lmaWNhbGx5LCBOb2RlJ3MgSW5jb21pbmdNZXNzYWdlKS5cbiAqIEl0J3MgZGVzaWduZWQgd2l0aCBhbiBleHByZXNzLWNvbXBhdGlibGUgaW50ZXJmYWNlIHRvIGFsbG93IGludGVyb3Agd2l0aCBleGlzdGluZyBleHByZXNzXG4gKiBtaWRkbGV3YXJlLlxuICpcbiAqIEBwYWNrYWdlIHJ1bnRpbWVcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXF1ZXN0IGV4dGVuZHMgRGVuYWxpT2JqZWN0IHtcblxuICAvKipcbiAgICogQSBVVUlEIGdlbmVyYXRlZCB1bnFpdWUgdG8gdGhpcyByZXF1ZXN0LiBVc2VmdWwgZm9yIHRyYWNpbmcgYSByZXF1ZXN0IHRocm91Z2ggdGhlIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBpZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgcGFyc2VkIFVSTCBvZiB0aGUgSW5jb21pbmdNZXNzYWdlXG4gICAqL1xuICBwcml2YXRlIHBhcnNlZFVybDogdXJsLlVybDtcblxuICAvKipcbiAgICogVGhlIG9yaWdpbmFsIEluY29taW5nTWVzc2FnZSBmcm9tIHRoZSBIVFRQIGxpYnJhcnkuXG4gICAqL1xuICBwcml2YXRlIF9pbmNvbWluZ01lc3NhZ2U6IGh0dHAuSW5jb21pbmdNZXNzYWdlO1xuXG4gIC8qKlxuICAgKiBUaGUgcm91dGUgcGFyc2VyIHJvdXRlIHRoYXQgd2FzIG1hdGNoZWRcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgcm91dGU6IFJvdXRlO1xuXG4gIC8qKlxuICAgKiBUaGUgcmVxdWVzdHMgcGFyYW1zIGV4dHJhY3RlZCBmcm9tIHRoZSByb3V0ZSBwYXJzZXIgKGkuZS4ganVzdCB0aGUgVVJMIHNlZ2VtZW50IHBhcmFtcylcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgcGFyYW1zOiBhbnk7XG5cbiAgLyoqXG4gICAqIGJhc2VVcmwgb2YgdGhlIGFwcCwgbmVlZGVkIHRvIHNpbXVsYXRlIEV4cHJlc3MgcmVxdWVzdCBhcGlcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgYmFzZVVybCA9ICcvJztcblxuICAvKipcbiAgICogVXJsIG9mIHRoZSByZXF1ZXN0IC0+IGNhbiBiZSBtb2RpZmllZFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyB1cmw6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGluY29taW5nIHJlcXVlc3QgYm9keSwgYnVmZmVyZWQgYW5kIHBhcnNlZCBieSB0aGUgc2VyaWFsaXplciAoaWYgYXBwbGljYWJsZSlcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgZ2V0IGJvZHkoKTogb2JqZWN0IHtcbiAgICByZXR1cm4gKDxhbnk+dGhpcy5faW5jb21pbmdNZXNzYWdlKS5ib2R5O1xuICB9XG4gIHB1YmxpYyBzZXQgYm9keSh2YWx1ZSkge1xuICAgICg8YW55PnRoaXMuX2luY29taW5nTWVzc2FnZSkuYm9keSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBvcmlnaW5hbCBhY3Rpb24gdGhhdCB3YXMgaW52b2tlZCBmb3IgdGhpcyByZXF1ZXN0LiBVc2VkIHdoZW4gYW4gZXJyb3Igb2NjdXJzXG4gICAqIHNvIHRoZSBlcnJvciBhY3Rpb24gY2FuIHNlZSB0aGUgb3JpZ2luYWwgYWN0aW9uIHRoYXQgd2FzIGludm9rZWQuXG4gICAqL1xuICBwdWJsaWMgX29yaWdpbmFsQWN0aW9uOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoaW5jb21pbmdNZXNzYWdlOiBodHRwLkluY29taW5nTWVzc2FnZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5faW5jb21pbmdNZXNzYWdlID0gaW5jb21pbmdNZXNzYWdlO1xuICAgIHRoaXMucGFyc2VkVXJsID0gdXJsLnBhcnNlKGluY29taW5nTWVzc2FnZS51cmwsIHRydWUpO1xuICAgIHRoaXMudXJsID0gdGhpcy5wYXJzZWRVcmwucGF0aG5hbWU7XG4gICAgdGhpcy5pZCA9IHV1aWQudjQoKTtcblxuICAgIHJldHVybiBuZXcgUHJveHkodGhpcywge1xuICAgICAgZ2V0KHJlcTogUmVxdWVzdCwgcHJvcGVydHk6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGlmIChyZXEuX2luY29taW5nTWVzc2FnZVtwcm9wZXJ0eV0gJiYgdHlwZW9mIHJlcS5faW5jb21pbmdNZXNzYWdlW3Byb3BlcnR5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHJldHVybiAoPGFueT5yZXEuX2luY29taW5nTWVzc2FnZVtwcm9wZXJ0eV0pLmJpbmQocmVxLl9pbmNvbWluZ01lc3NhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcVtwcm9wZXJ0eV07XG4gICAgICB9LFxuICAgICAgc2V0KHJlcTogUmVxdWVzdCwgcHJvcGVydHk6IHN0cmluZywgdmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICByZXFbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBIVFRQIG1ldGhvZCBvZiB0aGUgcmVxdWVzdCwgbG93ZXJjYXNlZFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBnZXQgbWV0aG9kKCk6IE1ldGhvZCB7XG4gICAgcmV0dXJuIDxNZXRob2Q+dGhpcy5faW5jb21pbmdNZXNzYWdlLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBob3N0IG5hbWUgc3BlY2lmaWVkIGluIHRoZSByZXF1ZXN0IChub3QgaW5jbHVkaW5nIHBvcnQgbnVtYmVyKVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBnZXQgaG9zdG5hbWUoKTogc3RyaW5nIHtcbiAgICBsZXQgaG9zdCA9IHRoaXMuZ2V0KCdob3N0Jyk7XG4gICAgcmV0dXJuIChob3N0IHx8ICcnKS5zcGxpdCgnOicpWzBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBJUCBhZGRyZXNzIG9mIHRoZSBpbmNvbWluZyByZXF1ZXN0J3MgY29ubmVjdGlvblxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBnZXQgaXAoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5faW5jb21pbmdNZXNzYWdlLnNvY2tldC5yZW1vdGVBZGRyZXNzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBvcmlnaW5hbCBwYXRoLCB3aXRob3V0IGFueSBtb2RpZmljYXRpb25zIGJ5IG1pZGRsZXdhcmVcbiAgICogb3IgdGhlIHJvdXRlci5cbiAgICpcbiAgICogVE9ETzogd2hlbiBkZW5hbGkgc3VwcG9ydHMgbW91bnRpbmcgb24gYSBzdWJwYXRoLCB0aGlzIHNob3VsZFxuICAgKiAgICAgICBiZSB1cGRhdGVkIHRvIHJlZmxlY3QgdGhlIGZ1bGwgcGF0aCwgYW5kIHRoZSBwYXRoIHZhcmlhYmxlXG4gICAqICAgICAgIGluIHRoaXMgY2xhc3Mgd2lsbCBiZSB0aGUgcGF0aCAqYWZ0ZXIqIHRoZSBzdWJwYXRoXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIGdldCBvcmlnaW5hbFVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnBhcnNlZFVybC5wYXRobmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcGF0aCBleHRyYWN0ZWQgZnJvbSB0aGUgVVJMIG9mIHRoZSBpbmNvbWluZyByZXF1ZXN0LlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBnZXQgcGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnBhcnNlZFVybC5wYXRobmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcHJvdG9jb2wgZXh0cmFjdGVkIGZyb20gdGhlIFVSTCBvZiB0aGUgaW5jb21pbmcgcmVxdWVzdFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBnZXQgcHJvdG9jb2woKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZWRVcmwucHJvdG9jb2wudG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcXVlcnkgcGFyYW1zIHN1cHBsaWVkIHdpdGggdGhlIHJlcXVlc3QgVVJMLCBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgZ2V0IHF1ZXJ5KCk6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0ge1xuICAgIHJldHVybiB0aGlzLnBhcnNlZFVybC5xdWVyeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG9yIG5vdCB0aGlzIHJlcXVlc3Qgd2FzIG1hZGUgb3ZlciBodHRwc1xuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBnZXQgc2VjdXJlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnByb3RvY29sID09PSAnaHR0cHM6JztcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG9yIG5vdCB0aGlzIHJlcXVlc3Qgd2FzIG1hZGUgYnkgYSBjbGllbnQgbGlicmFyeVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBnZXQgeGhyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldCgneC1yZXF1ZXN0ZWQtd2l0aCcpID09PSAnWE1MSHR0cFJlcXVlc3QnO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBoZWFkZXJzIG9mIHRoZSBpbmNvbWluZyByZXF1ZXN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIGdldCBoZWFkZXJzKCk6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0ge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UuaGVhZGVycztcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBzdWJkb21haW5zIG9mIHRoZSBpbmNvbWluZyByZXF1ZXN0OlxuICAgKiAgICAgLy8gR0VUIGZvby5iYXIuZXhhbXBsZS5jb21cbiAgICogICAgIHJlcXVlc3Quc3ViZG9tYWlucyAgLy8gWyAnZm9vJywgJ2JhcicgXVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBnZXQgc3ViZG9tYWlucygpOiBzdHJpbmdbXSB7XG4gICAgLy8gRHJvcCB0aGUgdGxkIGFuZCByb290IGRvbWFpbiBuYW1lXG4gICAgcmV0dXJuIGRyb3BSaWdodCh0aGlzLmhvc3RuYW1lLnNwbGl0KCcuJyksIDIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJlc3QgbWF0Y2ggZm9yIGNvbnRlbnQgdHlwZXMsIG9yIGZhbHNlIGlmIG5vIG1hdGNoIGlzIHBvc3NpYmxlLiBTZWUgdGhlIGRvY3MgZm9yXG4gICAqIHRoZSBgYWNjZXB0c2AgbW9kdWxlIG9uIG5wbSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBhY2NlcHRzKHNlcnZlckFjY2VwdGVkVHlwZXM6IHN0cmluZ1tdKTogc3RyaW5nIHwgYm9vbGVhbiB7XG4gICAgcmV0dXJuIGFjY2VwdHModGhpcy5faW5jb21pbmdNZXNzYWdlKS50eXBlKHNlcnZlckFjY2VwdGVkVHlwZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHZhbHVlIG9mIGEgaGVhZGVyLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBnZXQoaGVhZGVyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9pbmNvbWluZ01lc3NhZ2UuaGVhZGVyc1toZWFkZXIudG9Mb3dlckNhc2UoKV07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSByZXF1ZXN0IG1hdGNoZXMgdGhlIHN1cHBsaWVkIGNvbnRlbnQgdHlwZXMuIFNlZSB0eXBlLWlzIG1vZHVsZSBmb3IgZGV0YWlscy5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgaXMoLi4udHlwZXM6IHN0cmluZ1tdKTogc3RyaW5nIHwgYm9vbGVhbiB7XG4gICAgcmV0dXJuIDxzdHJpbmd8Ym9vbGVhbj50eXBlaXModGhpcy5faW5jb21pbmdNZXNzYWdlLCB0eXBlcyk7XG4gIH1cblxufVxuIl19