"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const bluebird_1 = require("bluebird");
const lodash_1 = require("lodash");
const mock_request_1 = require("./mock-request");
const mock_response_1 = require("./mock-response");
/**
 * The AppAcceptance class represents an app acceptance test. It spins up an in-memory instance of
 * the application under test, and exposes methods to submit simulated requests to the application,
 * and get the response. This helps keep acceptance tests lightweight and easily parallelizable,
 * since they don't need to bind to an actual port.
 *
 * @package test
 * @since 0.1.0
 */
class AppAcceptance {
    constructor() {
        /**
         * Default headers that are applied to each request. Useful for handling API-wide content-types,
         * sessions, etc.
         *
         * @since 0.1.0
         */
        this.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        };
        /**
         * An internal registry of container injections.
         */
        this._injections = {};
        let compiledPath = process.cwd();
        let ApplicationClass = require(path.join(compiledPath, 'app/application')).default;
        let environment = process.env.NODE_ENV || 'test';
        this.application = new ApplicationClass({
            environment,
            dir: compiledPath,
            addons: []
        });
    }
    /**
     * Start the application (note: this won't actually start the HTTP server, but performs all the
     * other startup work for you).
     *
     * @since 0.1.0
     */
    start() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.application.runInitializers();
        });
    }
    /**
     * Submit a simulated HTTP request to the application.
     *
     * @since 0.1.0
     */
    request(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let body = null;
            if (options.body) {
                body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
                options.headers = options.headers || {};
                options.headers['Transfer-Encoding'] = 'chunked';
            }
            let req = new mock_request_1.default({
                method: options.method,
                url: options.url,
                headers: lodash_1.assign({}, this.headers, options.headers)
            });
            return new Promise((resolve, reject) => {
                let res = new mock_response_1.default(() => {
                    let resBody = res._getString();
                    if (res.statusCode < 500) {
                        try {
                            resBody = res._getJSON();
                        }
                        finally {
                            resolve({ status: res.statusCode, body: resBody });
                        }
                    }
                    else {
                        resBody = resBody.replace(/\\n/g, '\n');
                        reject(new Error(`Request failed - ${req.method.toUpperCase()} ${req.url} returned a ${res.statusCode}:\n${resBody}`));
                    }
                });
                // tslint:disable-next-line:no-floating-promises
                this.application.router.handle(req, res);
                let SIMULATED_WRITE_DELAY = 10;
                setTimeout(() => {
                    if (body) {
                        req.write(body);
                    }
                    req.end();
                }, SIMULATED_WRITE_DELAY);
            });
        });
    }
    /**
     * Send a simulated GET request
     *
     * @since 0.1.0
     */
    get(url, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.request(Object.assign(options, { url, method: 'get' }));
        });
    }
    /**
     * Send a simulated HEAD request
     *
     * @since 0.1.0
     */
    head(url, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.request(Object.assign(options, { url, method: 'head' }));
        });
    }
    /**
     * Send a simulated DELETE request
     *
     * @since 0.1.0
     */
    delete(url, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.request(Object.assign(options, { url, method: 'delete' }));
        });
    }
    /**
     * Send a simulated POST request
     *
     * @since 0.1.0
     */
    post(url, body, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.request(Object.assign(options, { url, body, method: 'post' }));
        });
    }
    /**
     * Send a simulated PUT request
     *
     * @since 0.1.0
     */
    put(url, body, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.request(Object.assign(options, { url, body, method: 'put' }));
        });
    }
    /**
     * Send a simulated PATCH request
     *
     * @since 0.1.0
     */
    patch(url, body, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.request(Object.assign(options, { url, body, method: 'patch' }));
        });
    }
    /**
     * Get the current value of a default header
     *
     * @since 0.1.0
     */
    getHeader(name) {
        return this.headers[name];
    }
    /**
     * Set a default header value
     *
     * @since 0.1.0
     */
    setHeader(name, value) {
        this.headers[name] = value;
    }
    /**
     * Remove a default header value
     *
     * @since 0.1.0
     */
    removeHeader(name) {
        delete this.headers[name];
    }
    /**
     * Lookup an entry in the test application container
     *
     * @since 0.1.0
     */
    lookup(name) {
        return this.application.container.lookup(name);
    }
    /**
     * Overwrite an entry in the test application container. Use `restore()` to restore the original
     * container entry later.
     *
     * @since 0.1.0
     */
    inject(name, value, options) {
        let container = this.application.container;
        this._injections[name] = container.lookup(name);
        container.register(name, value, options || { singleton: false, instantiate: false });
        container.clearCache(name);
    }
    /**
     * Restore the original container entry for an entry that was previously overwritten by `inject()`
     *
     * @since 0.1.0
     */
    restore(name) {
        this.application.container.register(name, this._injections[name]);
        delete this._injections[name];
    }
    /**
     * Shut down the test application, cleaning up any resources in use
     *
     * @since 0.1.0
     */
    shutdown() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.application.shutdown();
        });
    }
}
exports.AppAcceptance = AppAcceptance;
/**
 * A helper method for setting up an app acceptance test. Adds beforeEach/afterEach hooks to the
 * current ava test suite which will setup and teardown the acceptance test. They also setup a test
 * transaction and roll it back once the test is finished (for the ORM adapters that support it), so
 * your test data won't pollute the database.
 *
 * @package test
 * @since 0.1.0
 */
function appAcceptanceTest(ava) {
    ava.beforeEach((t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        let app = t.context.app = new AppAcceptance();
        yield app.start();
        let adapters = app.application.container.lookupAll('orm-adapter');
        let transactionInitializers = [];
        lodash_1.forEach(adapters, (Adapter) => {
            if (typeof Adapter.startTestTransaction === 'function') {
                transactionInitializers.push(Adapter.startTestTransaction());
            }
        });
        yield bluebird_1.all(transactionInitializers);
    }));
    ava.afterEach.always((t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        let app = t.context.app;
        let transactionRollbacks = [];
        let adapters = app.application.container.lookupAll('orm-adapter');
        lodash_1.forEach(adapters, (Adapter) => {
            if (typeof Adapter.rollbackTestTransaction === 'function') {
                transactionRollbacks.push(Adapter.rollbackTestTransaction());
            }
        });
        yield bluebird_1.all(transactionRollbacks);
        yield app.shutdown();
    }));
}
exports.default = appAcceptanceTest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWFjY2VwdGFuY2UuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL3Rlc3QvYXBwLWFjY2VwdGFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQTZCO0FBQzdCLHVDQUErQjtBQUMvQixtQ0FHZ0I7QUFDaEIsaURBQXlDO0FBQ3pDLG1EQUEyQztBQUkzQzs7Ozs7Ozs7R0FRRztBQUNIO0lBdUJFO1FBaEJBOzs7OztXQUtHO1FBQ0gsWUFBTyxHQUErQjtZQUNwQyxNQUFNLEVBQUUsa0JBQWtCO1lBQzFCLGNBQWMsRUFBRSxrQkFBa0I7U0FDbkMsQ0FBQztRQUVGOztXQUVHO1FBQ08sZ0JBQVcsR0FBZ0MsRUFBRSxDQUFDO1FBR3RELElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNqQyxJQUFJLGdCQUFnQixHQUF1QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUN2RyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUM7UUFDakQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLGdCQUFnQixDQUFDO1lBQ3RDLFdBQVc7WUFDWCxHQUFHLEVBQUUsWUFBWTtZQUNqQixNQUFNLEVBQVksRUFBRTtTQUNyQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDRyxLQUFLOztZQUNULE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUMzQyxDQUFDO0tBQUE7SUFFRDs7OztPQUlHO0lBQ0csT0FBTyxDQUFDLE9BQXlGOztZQUNyRyxJQUFJLElBQUksR0FBUSxJQUFJLENBQUM7WUFDckIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxD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LElBQUksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sY0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDaEMsTUFBTSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdkIsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVMLENBQUM7QUE1QkQsb0NBNEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGFsbCB9IGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCB7XG4gIGFzc2lnbixcbiAgZm9yRWFjaFxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IE1vY2tSZXF1ZXN0IGZyb20gJy4vbW9jay1yZXF1ZXN0JztcbmltcG9ydCBNb2NrUmVzcG9uc2UgZnJvbSAnLi9tb2NrLXJlc3BvbnNlJztcbmltcG9ydCBBcHBsaWNhdGlvbiBmcm9tICcuLi9ydW50aW1lL2FwcGxpY2F0aW9uJztcbmltcG9ydCB7IENvbnRhaW5lck9wdGlvbnMgfSBmcm9tICcuLi9tZXRhbC9jb250YWluZXInO1xuXG4vKipcbiAqIFRoZSBBcHBBY2NlcHRhbmNlIGNsYXNzIHJlcHJlc2VudHMgYW4gYXBwIGFjY2VwdGFuY2UgdGVzdC4gSXQgc3BpbnMgdXAgYW4gaW4tbWVtb3J5IGluc3RhbmNlIG9mXG4gKiB0aGUgYXBwbGljYXRpb24gdW5kZXIgdGVzdCwgYW5kIGV4cG9zZXMgbWV0aG9kcyB0byBzdWJtaXQgc2ltdWxhdGVkIHJlcXVlc3RzIHRvIHRoZSBhcHBsaWNhdGlvbixcbiAqIGFuZCBnZXQgdGhlIHJlc3BvbnNlLiBUaGlzIGhlbHBzIGtlZXAgYWNjZXB0YW5jZSB0ZXN0cyBsaWdodHdlaWdodCBhbmQgZWFzaWx5IHBhcmFsbGVsaXphYmxlLFxuICogc2luY2UgdGhleSBkb24ndCBuZWVkIHRvIGJpbmQgdG8gYW4gYWN0dWFsIHBvcnQuXG4gKlxuICogQHBhY2thZ2UgdGVzdFxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBjbGFzcyBBcHBBY2NlcHRhbmNlIHtcblxuICAvKipcbiAgICogVGhlIGFwcGxpY2F0aW9uIGluc3RhbmNlIHVuZGVyIHRlc3RcbiAgICovXG4gIGFwcGxpY2F0aW9uOiBBcHBsaWNhdGlvbjtcblxuICAvKipcbiAgICogRGVmYXVsdCBoZWFkZXJzIHRoYXQgYXJlIGFwcGxpZWQgdG8gZWFjaCByZXF1ZXN0LiBVc2VmdWwgZm9yIGhhbmRsaW5nIEFQSS13aWRlIGNvbnRlbnQtdHlwZXMsXG4gICAqIHNlc3Npb25zLCBldGMuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgaGVhZGVyczogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0gPSB7XG4gICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICB9O1xuXG4gIC8qKlxuICAgKiBBbiBpbnRlcm5hbCByZWdpc3RyeSBvZiBjb250YWluZXIgaW5qZWN0aW9ucy5cbiAgICovXG4gIHByb3RlY3RlZCBfaW5qZWN0aW9uczogeyBbZnVsbE5hbWU6IHN0cmluZ106IGFueSB9ID0ge307XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgbGV0IGNvbXBpbGVkUGF0aCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgbGV0IEFwcGxpY2F0aW9uQ2xhc3M6IHR5cGVvZiBBcHBsaWNhdGlvbiA9IHJlcXVpcmUocGF0aC5qb2luKGNvbXBpbGVkUGF0aCwgJ2FwcC9hcHBsaWNhdGlvbicpKS5kZWZhdWx0O1xuICAgIGxldCBlbnZpcm9ubWVudCA9IHByb2Nlc3MuZW52Lk5PREVfRU5WIHx8ICd0ZXN0JztcbiAgICB0aGlzLmFwcGxpY2F0aW9uID0gbmV3IEFwcGxpY2F0aW9uQ2xhc3Moe1xuICAgICAgZW52aXJvbm1lbnQsXG4gICAgICBkaXI6IGNvbXBpbGVkUGF0aCxcbiAgICAgIGFkZG9uczogPHN0cmluZ1tdPltdXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgdGhlIGFwcGxpY2F0aW9uIChub3RlOiB0aGlzIHdvbid0IGFjdHVhbGx5IHN0YXJ0IHRoZSBIVFRQIHNlcnZlciwgYnV0IHBlcmZvcm1zIGFsbCB0aGVcbiAgICogb3RoZXIgc3RhcnR1cCB3b3JrIGZvciB5b3UpLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGFzeW5jIHN0YXJ0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuYXBwbGljYXRpb24ucnVuSW5pdGlhbGl6ZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogU3VibWl0IGEgc2ltdWxhdGVkIEhUVFAgcmVxdWVzdCB0byB0aGUgYXBwbGljYXRpb24uXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYXN5bmMgcmVxdWVzdChvcHRpb25zOiB7IG1ldGhvZDogc3RyaW5nLCB1cmw6IHN0cmluZywgYm9keT86IGFueSwgaGVhZGVycz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gfSk6IFByb21pc2U8eyBzdGF0dXM6IG51bWJlciwgYm9keTogYW55IH0+IHtcbiAgICBsZXQgYm9keTogYW55ID0gbnVsbDtcbiAgICBpZiAob3B0aW9ucy5ib2R5KSB7XG4gICAgICBib2R5ID0gdHlwZW9mIG9wdGlvbnMuYm9keSA9PT0gJ3N0cmluZycgPyBvcHRpb25zLmJvZHkgOiBKU09OLnN0cmluZ2lmeShvcHRpb25zLmJvZHkpO1xuICAgICAgb3B0aW9ucy5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIHx8IHt9O1xuICAgICAgb3B0aW9ucy5oZWFkZXJzWydUcmFuc2Zlci1FbmNvZGluZyddID0gJ2NodW5rZWQnO1xuICAgIH1cbiAgICBsZXQgcmVxID0gbmV3IE1vY2tSZXF1ZXN0KHtcbiAgICAgIG1ldGhvZDogb3B0aW9ucy5tZXRob2QsXG4gICAgICB1cmw6IG9wdGlvbnMudXJsLFxuICAgICAgaGVhZGVyczogYXNzaWduKHt9LCB0aGlzLmhlYWRlcnMsIG9wdGlvbnMuaGVhZGVycylcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8eyBzdGF0dXM6IG51bWJlciwgYm9keTogYW55IH0+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCByZXMgPSBuZXcgTW9ja1Jlc3BvbnNlKCgpID0+IHtcbiAgICAgICAgbGV0IHJlc0JvZHkgPSByZXMuX2dldFN0cmluZygpO1xuICAgICAgICBpZiAocmVzLnN0YXR1c0NvZGUgPCA1MDApIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVzQm9keSA9IHJlcy5fZ2V0SlNPTigpO1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICByZXNvbHZlKHsgc3RhdHVzOiByZXMuc3RhdHVzQ29kZSwgYm9keTogcmVzQm9keSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzQm9keSA9IHJlc0JvZHkucmVwbGFjZSgvXFxcXG4vZywgJ1xcbicpO1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFJlcXVlc3QgZmFpbGVkIC0gJHsgcmVxLm1ldGhvZC50b1VwcGVyQ2FzZSgpIH0gJHsgcmVxLnVybCB9IHJldHVybmVkIGEgJHsgcmVzLnN0YXR1c0NvZGUgfTpcXG4keyByZXNCb2R5IH1gKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tZmxvYXRpbmctcHJvbWlzZXNcbiAgICAgIHRoaXMuYXBwbGljYXRpb24ucm91dGVyLmhhbmRsZSg8YW55PnJlcSwgPGFueT5yZXMpO1xuXG4gICAgICBsZXQgU0lNVUxBVEVEX1dSSVRFX0RFTEFZID0gMTA7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKGJvZHkpIHtcbiAgICAgICAgICByZXEud3JpdGUoYm9keSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVxLmVuZCgpO1xuICAgICAgfSwgU0lNVUxBVEVEX1dSSVRFX0RFTEFZKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGEgc2ltdWxhdGVkIEdFVCByZXF1ZXN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYXN5bmMgZ2V0KHVybDogc3RyaW5nLCBvcHRpb25zID0ge30pOiBQcm9taXNlPHsgc3RhdHVzOiBudW1iZXIsIGJvZHk6IGFueSB9PiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChPYmplY3QuYXNzaWduKG9wdGlvbnMsIHsgdXJsLCBtZXRob2Q6ICdnZXQnIH0pKTtcbiAgfVxuICAvKipcbiAgICogU2VuZCBhIHNpbXVsYXRlZCBIRUFEIHJlcXVlc3RcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBhc3luYyBoZWFkKHVybDogc3RyaW5nLCBvcHRpb25zID0ge30pOiBQcm9taXNlPHsgc3RhdHVzOiBudW1iZXIsIGJvZHk6IGFueSB9PiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChPYmplY3QuYXNzaWduKG9wdGlvbnMsIHsgdXJsLCBtZXRob2Q6ICdoZWFkJyB9KSk7XG4gIH1cbiAgLyoqXG4gICAqIFNlbmQgYSBzaW11bGF0ZWQgREVMRVRFIHJlcXVlc3RcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBhc3luYyBkZWxldGUodXJsOiBzdHJpbmcsIG9wdGlvbnMgPSB7fSk6IFByb21pc2U8eyBzdGF0dXM6IG51bWJlciwgYm9keTogYW55IH0+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KE9iamVjdC5hc3NpZ24ob3B0aW9ucywgeyB1cmwsIG1ldGhvZDogJ2RlbGV0ZScgfSkpO1xuICB9XG4gIC8qKlxuICAgKiBTZW5kIGEgc2ltdWxhdGVkIFBPU1QgcmVxdWVzdFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGFzeW5jIHBvc3QodXJsOiBzdHJpbmcsIGJvZHk6IGFueSwgb3B0aW9ucyA9IHt9KTogUHJvbWlzZTx7IHN0YXR1czogbnVtYmVyLCBib2R5OiBhbnkgfT4ge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoT2JqZWN0LmFzc2lnbihvcHRpb25zLCB7IHVybCwgYm9keSwgbWV0aG9kOiAncG9zdCcgfSkpO1xuICB9XG4gIC8qKlxuICAgKiBTZW5kIGEgc2ltdWxhdGVkIFBVVCByZXF1ZXN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYXN5bmMgcHV0KHVybDogc3RyaW5nLCBib2R5OiBhbnksIG9wdGlvbnMgPSB7fSk6IFByb21pc2U8eyBzdGF0dXM6IG51bWJlciwgYm9keTogYW55IH0+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KE9iamVjdC5hc3NpZ24ob3B0aW9ucywgeyB1cmwsIGJvZHksIG1ldGhvZDogJ3B1dCcgfSkpO1xuICB9XG4gIC8qKlxuICAgKiBTZW5kIGEgc2ltdWxhdGVkIFBBVENIIHJlcXVlc3RcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBhc3luYyBwYXRjaCh1cmw6IHN0cmluZywgYm9keTogc3RyaW5nLCBvcHRpb25zID0ge30pOiBQcm9taXNlPHsgc3RhdHVzOiBudW1iZXIsIGJvZHk6IGFueSB9PiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChPYmplY3QuYXNzaWduKG9wdGlvbnMsIHsgdXJsLCBib2R5LCBtZXRob2Q6ICdwYXRjaCcgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCB2YWx1ZSBvZiBhIGRlZmF1bHQgaGVhZGVyXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0SGVhZGVyKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaGVhZGVyc1tuYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYSBkZWZhdWx0IGhlYWRlciB2YWx1ZVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHNldEhlYWRlcihuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmhlYWRlcnNbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBkZWZhdWx0IGhlYWRlciB2YWx1ZVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHJlbW92ZUhlYWRlcihuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBkZWxldGUgdGhpcy5oZWFkZXJzW25hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIExvb2t1cCBhbiBlbnRyeSBpbiB0aGUgdGVzdCBhcHBsaWNhdGlvbiBjb250YWluZXJcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBsb29rdXAobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5hcHBsaWNhdGlvbi5jb250YWluZXIubG9va3VwKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0ZSBhbiBlbnRyeSBpbiB0aGUgdGVzdCBhcHBsaWNhdGlvbiBjb250YWluZXIuIFVzZSBgcmVzdG9yZSgpYCB0byByZXN0b3JlIHRoZSBvcmlnaW5hbFxuICAgKiBjb250YWluZXIgZW50cnkgbGF0ZXIuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgaW5qZWN0KG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSwgb3B0aW9ucz86IENvbnRhaW5lck9wdGlvbnMpOiB2b2lkIHtcbiAgICBsZXQgY29udGFpbmVyID0gdGhpcy5hcHBsaWNhdGlvbi5jb250YWluZXI7XG4gICAgdGhpcy5faW5qZWN0aW9uc1tuYW1lXSA9IGNvbnRhaW5lci5sb29rdXAobmFtZSk7XG4gICAgY29udGFpbmVyLnJlZ2lzdGVyKG5hbWUsIHZhbHVlLCBvcHRpb25zIHx8IHsgc2luZ2xldG9uOiBmYWxzZSwgaW5zdGFudGlhdGU6IGZhbHNlIH0pO1xuICAgIGNvbnRhaW5lci5jbGVhckNhY2hlKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc3RvcmUgdGhlIG9yaWdpbmFsIGNvbnRhaW5lciBlbnRyeSBmb3IgYW4gZW50cnkgdGhhdCB3YXMgcHJldmlvdXNseSBvdmVyd3JpdHRlbiBieSBgaW5qZWN0KClgXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcmVzdG9yZShuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmFwcGxpY2F0aW9uLmNvbnRhaW5lci5yZWdpc3RlcihuYW1lLCB0aGlzLl9pbmplY3Rpb25zW25hbWVdKTtcbiAgICBkZWxldGUgdGhpcy5faW5qZWN0aW9uc1tuYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaHV0IGRvd24gdGhlIHRlc3QgYXBwbGljYXRpb24sIGNsZWFuaW5nIHVwIGFueSByZXNvdXJjZXMgaW4gdXNlXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYXN5bmMgc2h1dGRvd24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5hcHBsaWNhdGlvbi5zaHV0ZG93bigpO1xuICB9XG5cbn1cblxuLyoqXG4gKiBBIGhlbHBlciBtZXRob2QgZm9yIHNldHRpbmcgdXAgYW4gYXBwIGFjY2VwdGFuY2UgdGVzdC4gQWRkcyBiZWZvcmVFYWNoL2FmdGVyRWFjaCBob29rcyB0byB0aGVcbiAqIGN1cnJlbnQgYXZhIHRlc3Qgc3VpdGUgd2hpY2ggd2lsbCBzZXR1cCBhbmQgdGVhcmRvd24gdGhlIGFjY2VwdGFuY2UgdGVzdC4gVGhleSBhbHNvIHNldHVwIGEgdGVzdFxuICogdHJhbnNhY3Rpb24gYW5kIHJvbGwgaXQgYmFjayBvbmNlIHRoZSB0ZXN0IGlzIGZpbmlzaGVkIChmb3IgdGhlIE9STSBhZGFwdGVycyB0aGF0IHN1cHBvcnQgaXQpLCBzb1xuICogeW91ciB0ZXN0IGRhdGEgd29uJ3QgcG9sbHV0ZSB0aGUgZGF0YWJhc2UuXG4gKlxuICogQHBhY2thZ2UgdGVzdFxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFwcEFjY2VwdGFuY2VUZXN0KGF2YTogYW55KSB7XG5cbiAgYXZhLmJlZm9yZUVhY2goYXN5bmMgKHQ6IGFueSkgPT4ge1xuICAgIGxldCBhcHAgPSB0LmNvbnRleHQuYXBwID0gbmV3IEFwcEFjY2VwdGFuY2UoKTtcbiAgICBhd2FpdCBhcHAuc3RhcnQoKTtcbiAgICBsZXQgYWRhcHRlcnMgPSBhcHAuYXBwbGljYXRpb24uY29udGFpbmVyLmxvb2t1cEFsbCgnb3JtLWFkYXB0ZXInKTtcbiAgICBsZXQgdHJhbnNhY3Rpb25Jbml0aWFsaXplcnM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuICAgIGZvckVhY2goYWRhcHRlcnMsIChBZGFwdGVyKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIEFkYXB0ZXIuc3RhcnRUZXN0VHJhbnNhY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdHJhbnNhY3Rpb25Jbml0aWFsaXplcnMucHVzaChBZGFwdGVyLnN0YXJ0VGVzdFRyYW5zYWN0aW9uKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGF3YWl0IGFsbCh0cmFuc2FjdGlvbkluaXRpYWxpemVycyk7XG4gIH0pO1xuXG4gIGF2YS5hZnRlckVhY2guYWx3YXlzKGFzeW5jICh0OiBhbnkpID0+IHtcbiAgICBsZXQgYXBwID0gdC5jb250ZXh0LmFwcDtcbiAgICBsZXQgdHJhbnNhY3Rpb25Sb2xsYmFja3M6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuICAgIGxldCBhZGFwdGVycyA9IGFwcC5hcHBsaWNhdGlvbi5jb250YWluZXIubG9va3VwQWxsKCdvcm0tYWRhcHRlcicpO1xuICAgIGZvckVhY2goYWRhcHRlcnMsIChBZGFwdGVyKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIEFkYXB0ZXIucm9sbGJhY2tUZXN0VHJhbnNhY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdHJhbnNhY3Rpb25Sb2xsYmFja3MucHVzaChBZGFwdGVyLnJvbGxiYWNrVGVzdFRyYW5zYWN0aW9uKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGF3YWl0IGFsbCh0cmFuc2FjdGlvblJvbGxiYWNrcyk7XG4gICAgYXdhaXQgYXBwLnNodXRkb3duKCk7XG4gIH0pO1xuXG59XG4iXX0=