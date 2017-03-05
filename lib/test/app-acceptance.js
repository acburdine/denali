"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const bluebird_1 = require("bluebird");
const lodash_1 = require("lodash");
const mock_request_1 = require("./mock-request");
const mock_response_1 = require("./mock-response");
const object_1 = require("../metal/object");
const application_1 = require("../runtime/application");
/**
 * The AppAcceptance class represents an app acceptance test. It spins up an in-memory instance of
 * the application under test, and exposes methods to submit simulated requests to the application,
 * and get the response. This helps keep acceptance tests lightweight and easily parallelizable,
 * since they don't need to bind to an actual port.
 *
 * @package test
 * @since 0.1.0
 */
class AppAcceptance extends object_1.default {
    constructor() {
        super();
        /**
         * An internal registry of container injections.
         */
        this._injections = {};
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
        let compiledPath = process.cwd();
        let ApplicationClass = require(path.join(compiledPath, 'app/application')).default;
        let environment = process.env.NODE_ENV || 'test';
        this.application = new application_1.default({
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
    inject(name, value) {
        this._injections[name] = this.application.container.lookup(name);
        this.application.container.register(name, value);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWFjY2VwdGFuY2UuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL3Rlc3QvYXBwLWFjY2VwdGFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQTZCO0FBQzdCLHVDQUErQjtBQUMvQixtQ0FHZ0I7QUFFaEIsaURBQXlDO0FBQ3pDLG1EQUEyQztBQUMzQyw0Q0FBMkM7QUFDM0Msd0RBQWlEO0FBRWpEOzs7Ozs7OztHQVFHO0FBQ0gsbUJBQTJCLFNBQVEsZ0JBQVk7SUFPN0M7UUFDRSxLQUFLLEVBQUUsQ0FBQztRQXFCVjs7V0FFRztRQUNPLGdCQUFXLEdBQWdDLEVBQUUsQ0FBQztRQUV4RDs7Ozs7V0FLRztRQUNJLFlBQU8sR0FBK0I7WUFDM0MsTUFBTSxFQUFFLGtCQUFrQjtZQUMxQixjQUFjLEVBQUUsa0JBQWtCO1NBQ25DLENBQUM7UUFsQ0EsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2pDLElBQUksZ0JBQWdCLEdBQXVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ3ZHLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQztRQUNqRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUkscUJBQVcsQ0FBQztZQUNqQyxXQUFXO1lBQ1gsR0FBRyxFQUFFLFlBQVk7WUFDakIsTUFBTSxFQUFZLEVBQUU7U0FDckIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ1UsS0FBSzs7WUFDaEIsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzNDLENBQUM7S0FBQTtJQWtCRDs7OztPQUlHO0lBQ1UsT0FBTyxDQUFDLE9BQXlGOztZQUM1RyxJ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Q0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLGNBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3ZCLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFTCxDQUFDO0FBNUJELG9DQTRCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBhbGwgfSBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQge1xuICBhc3NpZ24sXG4gIGZvckVhY2hcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IEluY29taW5nTWVzc2FnZSB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IE1vY2tSZXF1ZXN0IGZyb20gJy4vbW9jay1yZXF1ZXN0JztcbmltcG9ydCBNb2NrUmVzcG9uc2UgZnJvbSAnLi9tb2NrLXJlc3BvbnNlJztcbmltcG9ydCBEZW5hbGlPYmplY3QgZnJvbSAnLi4vbWV0YWwvb2JqZWN0JztcbmltcG9ydCBBcHBsaWNhdGlvbiBmcm9tICcuLi9ydW50aW1lL2FwcGxpY2F0aW9uJztcblxuLyoqXG4gKiBUaGUgQXBwQWNjZXB0YW5jZSBjbGFzcyByZXByZXNlbnRzIGFuIGFwcCBhY2NlcHRhbmNlIHRlc3QuIEl0IHNwaW5zIHVwIGFuIGluLW1lbW9yeSBpbnN0YW5jZSBvZlxuICogdGhlIGFwcGxpY2F0aW9uIHVuZGVyIHRlc3QsIGFuZCBleHBvc2VzIG1ldGhvZHMgdG8gc3VibWl0IHNpbXVsYXRlZCByZXF1ZXN0cyB0byB0aGUgYXBwbGljYXRpb24sXG4gKiBhbmQgZ2V0IHRoZSByZXNwb25zZS4gVGhpcyBoZWxwcyBrZWVwIGFjY2VwdGFuY2UgdGVzdHMgbGlnaHR3ZWlnaHQgYW5kIGVhc2lseSBwYXJhbGxlbGl6YWJsZSxcbiAqIHNpbmNlIHRoZXkgZG9uJ3QgbmVlZCB0byBiaW5kIHRvIGFuIGFjdHVhbCBwb3J0LlxuICpcbiAqIEBwYWNrYWdlIHRlc3RcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgY2xhc3MgQXBwQWNjZXB0YW5jZSBleHRlbmRzIERlbmFsaU9iamVjdCB7XG5cbiAgLyoqXG4gICAqIFRoZSBhcHBsaWNhdGlvbiBpbnN0YW5jZSB1bmRlciB0ZXN0XG4gICAqL1xuICBwdWJsaWMgYXBwbGljYXRpb246IEFwcGxpY2F0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgbGV0IGNvbXBpbGVkUGF0aCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgbGV0IEFwcGxpY2F0aW9uQ2xhc3M6IHR5cGVvZiBBcHBsaWNhdGlvbiA9IHJlcXVpcmUocGF0aC5qb2luKGNvbXBpbGVkUGF0aCwgJ2FwcC9hcHBsaWNhdGlvbicpKS5kZWZhdWx0O1xuICAgIGxldCBlbnZpcm9ubWVudCA9IHByb2Nlc3MuZW52Lk5PREVfRU5WIHx8ICd0ZXN0JztcbiAgICB0aGlzLmFwcGxpY2F0aW9uID0gbmV3IEFwcGxpY2F0aW9uKHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgZGlyOiBjb21waWxlZFBhdGgsXG4gICAgICBhZGRvbnM6IDxzdHJpbmdbXT5bXVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBhcHBsaWNhdGlvbiAobm90ZTogdGhpcyB3b24ndCBhY3R1YWxseSBzdGFydCB0aGUgSFRUUCBzZXJ2ZXIsIGJ1dCBwZXJmb3JtcyBhbGwgdGhlXG4gICAqIG90aGVyIHN0YXJ0dXAgd29yayBmb3IgeW91KS5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5hcHBsaWNhdGlvbi5ydW5Jbml0aWFsaXplcnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpbnRlcm5hbCByZWdpc3RyeSBvZiBjb250YWluZXIgaW5qZWN0aW9ucy5cbiAgICovXG4gIHByb3RlY3RlZCBfaW5qZWN0aW9uczogeyBbZnVsbE5hbWU6IHN0cmluZ106IGFueSB9ID0ge307XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgaGVhZGVycyB0aGF0IGFyZSBhcHBsaWVkIHRvIGVhY2ggcmVxdWVzdC4gVXNlZnVsIGZvciBoYW5kbGluZyBBUEktd2lkZSBjb250ZW50LXR5cGVzLFxuICAgKiBzZXNzaW9ucywgZXRjLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBoZWFkZXJzOiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcbiAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gIH07XG5cbiAgLyoqXG4gICAqIFN1Ym1pdCBhIHNpbXVsYXRlZCBIVFRQIHJlcXVlc3QgdG8gdGhlIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBhc3luYyByZXF1ZXN0KG9wdGlvbnM6IHsgbWV0aG9kOiBzdHJpbmcsIHVybDogc3RyaW5nLCBib2R5PzogYW55LCBoZWFkZXJzPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSB9KTogUHJvbWlzZTx7IHN0YXR1czogbnVtYmVyLCBib2R5OiBhbnkgfT4ge1xuICAgIGxldCBib2R5OiBhbnkgPSBudWxsO1xuICAgIGlmIChvcHRpb25zLmJvZHkpIHtcbiAgICAgIGJvZHkgPSB0eXBlb2Ygb3B0aW9ucy5ib2R5ID09PSAnc3RyaW5nJyA/IG9wdGlvbnMuYm9keSA6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuYm9keSk7XG4gICAgICBvcHRpb25zLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgfHwge307XG4gICAgICBvcHRpb25zLmhlYWRlcnNbJ1RyYW5zZmVyLUVuY29kaW5nJ10gPSAnY2h1bmtlZCc7XG4gICAgfVxuICAgIGxldCByZXEgPSBuZXcgTW9ja1JlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiBvcHRpb25zLm1ldGhvZCxcbiAgICAgIHVybDogb3B0aW9ucy51cmwsXG4gICAgICBoZWFkZXJzOiBhc3NpZ24oe30sIHRoaXMuaGVhZGVycywgb3B0aW9ucy5oZWFkZXJzKVxuICAgIH0pO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTx7IHN0YXR1czogbnVtYmVyLCBib2R5OiBhbnkgfT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IHJlcyA9IG5ldyBNb2NrUmVzcG9uc2UoKCkgPT4ge1xuICAgICAgICBsZXQgcmVzQm9keSA9IHJlcy5fZ2V0U3RyaW5nKCk7XG4gICAgICAgIGlmIChyZXMuc3RhdHVzQ29kZSA8IDUwMCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXNCb2R5ID0gcmVzLl9nZXRKU09OKCk7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHJlc29sdmUoeyBzdGF0dXM6IHJlcy5zdGF0dXNDb2RlLCBib2R5OiByZXNCb2R5IH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNCb2R5ID0gcmVzQm9keS5yZXBsYWNlKC9cXFxcbi9nLCAnXFxuJyk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgUmVxdWVzdCBmYWlsZWQgLSAkeyByZXEubWV0aG9kLnRvVXBwZXJDYXNlKCkgfSAkeyByZXEudXJsIH0gcmV0dXJuZWQgYSAkeyByZXMuc3RhdHVzQ29kZSB9OlxcbiR7IHJlc0JvZHkgfWApKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1mbG9hdGluZy1wcm9taXNlc1xuICAgICAgdGhpcy5hcHBsaWNhdGlvbi5yb3V0ZXIuaGFuZGxlKDxhbnk+cmVxLCA8YW55PnJlcyk7XG5cbiAgICAgIGxldCBTSU1VTEFURURfV1JJVEVfREVMQVkgPSAxMDtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAoYm9keSkge1xuICAgICAgICAgIHJlcS53cml0ZShib2R5KTtcbiAgICAgICAgfVxuICAgICAgICByZXEuZW5kKCk7XG4gICAgICB9LCBTSU1VTEFURURfV1JJVEVfREVMQVkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgYSBzaW11bGF0ZWQgR0VUIHJlcXVlc3RcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0KHVybDogc3RyaW5nLCBvcHRpb25zID0ge30pOiBQcm9taXNlPHsgc3RhdHVzOiBudW1iZXIsIGJvZHk6IGFueSB9PiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChPYmplY3QuYXNzaWduKG9wdGlvbnMsIHsgdXJsLCBtZXRob2Q6ICdnZXQnIH0pKTtcbiAgfVxuICAvKipcbiAgICogU2VuZCBhIHNpbXVsYXRlZCBIRUFEIHJlcXVlc3RcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgaGVhZCh1cmw6IHN0cmluZywgb3B0aW9ucyA9IHt9KTogUHJvbWlzZTx7IHN0YXR1czogbnVtYmVyLCBib2R5OiBhbnkgfT4ge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoT2JqZWN0LmFzc2lnbihvcHRpb25zLCB7IHVybCwgbWV0aG9kOiAnaGVhZCcgfSkpO1xuICB9XG4gIC8qKlxuICAgKiBTZW5kIGEgc2ltdWxhdGVkIERFTEVURSByZXF1ZXN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGRlbGV0ZSh1cmw6IHN0cmluZywgb3B0aW9ucyA9IHt9KTogUHJvbWlzZTx7IHN0YXR1czogbnVtYmVyLCBib2R5OiBhbnkgfT4ge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoT2JqZWN0LmFzc2lnbihvcHRpb25zLCB7IHVybCwgbWV0aG9kOiAnZGVsZXRlJyB9KSk7XG4gIH1cbiAgLyoqXG4gICAqIFNlbmQgYSBzaW11bGF0ZWQgUE9TVCByZXF1ZXN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIGFzeW5jIHBvc3QodXJsOiBzdHJpbmcsIGJvZHk6IGFueSwgb3B0aW9ucyA9IHt9KTogUHJvbWlzZTx7IHN0YXR1czogbnVtYmVyLCBib2R5OiBhbnkgfT4ge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoT2JqZWN0LmFzc2lnbihvcHRpb25zLCB7IHVybCwgYm9keSwgbWV0aG9kOiAncG9zdCcgfSkpO1xuICB9XG4gIC8qKlxuICAgKiBTZW5kIGEgc2ltdWxhdGVkIFBVVCByZXF1ZXN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIGFzeW5jIHB1dCh1cmw6IHN0cmluZywgYm9keTogYW55LCBvcHRpb25zID0ge30pOiBQcm9taXNlPHsgc3RhdHVzOiBudW1iZXIsIGJvZHk6IGFueSB9PiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChPYmplY3QuYXNzaWduKG9wdGlvbnMsIHsgdXJsLCBib2R5LCBtZXRob2Q6ICdwdXQnIH0pKTtcbiAgfVxuICAvKipcbiAgICogU2VuZCBhIHNpbXVsYXRlZCBQQVRDSCByZXF1ZXN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIGFzeW5jIHBhdGNoKHVybDogc3RyaW5nLCBib2R5OiBzdHJpbmcsIG9wdGlvbnMgPSB7fSk6IFByb21pc2U8eyBzdGF0dXM6IG51bWJlciwgYm9keTogYW55IH0+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KE9iamVjdC5hc3NpZ24ob3B0aW9ucywgeyB1cmwsIGJvZHksIG1ldGhvZDogJ3BhdGNoJyB9KSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IHZhbHVlIG9mIGEgZGVmYXVsdCBoZWFkZXJcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgZ2V0SGVhZGVyKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaGVhZGVyc1tuYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYSBkZWZhdWx0IGhlYWRlciB2YWx1ZVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBzZXRIZWFkZXIobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5oZWFkZXJzW25hbWVdID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgZGVmYXVsdCBoZWFkZXIgdmFsdWVcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlSGVhZGVyKG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGRlbGV0ZSB0aGlzLmhlYWRlcnNbbmFtZV07XG4gIH1cblxuICAvKipcbiAgICogTG9va3VwIGFuIGVudHJ5IGluIHRoZSB0ZXN0IGFwcGxpY2F0aW9uIGNvbnRhaW5lclxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBsb29rdXAobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5hcHBsaWNhdGlvbi5jb250YWluZXIubG9va3VwKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJ3cml0ZSBhbiBlbnRyeSBpbiB0aGUgdGVzdCBhcHBsaWNhdGlvbiBjb250YWluZXIuIFVzZSBgcmVzdG9yZSgpYCB0byByZXN0b3JlIHRoZSBvcmlnaW5hbFxuICAgKiBjb250YWluZXIgZW50cnkgbGF0ZXIuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIGluamVjdChuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLl9pbmplY3Rpb25zW25hbWVdID0gdGhpcy5hcHBsaWNhdGlvbi5jb250YWluZXIubG9va3VwKG5hbWUpO1xuICAgIHRoaXMuYXBwbGljYXRpb24uY29udGFpbmVyLnJlZ2lzdGVyKG5hbWUsIHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0b3JlIHRoZSBvcmlnaW5hbCBjb250YWluZXIgZW50cnkgZm9yIGFuIGVudHJ5IHRoYXQgd2FzIHByZXZpb3VzbHkgb3ZlcndyaXR0ZW4gYnkgYGluamVjdCgpYFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyByZXN0b3JlKG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuYXBwbGljYXRpb24uY29udGFpbmVyLnJlZ2lzdGVyKG5hbWUsIHRoaXMuX2luamVjdGlvbnNbbmFtZV0pO1xuICAgIGRlbGV0ZSB0aGlzLl9pbmplY3Rpb25zW25hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIFNodXQgZG93biB0aGUgdGVzdCBhcHBsaWNhdGlvbiwgY2xlYW5pbmcgdXAgYW55IHJlc291cmNlcyBpbiB1c2VcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc2h1dGRvd24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5hcHBsaWNhdGlvbi5zaHV0ZG93bigpO1xuICB9XG5cbn1cblxuLyoqXG4gKiBBIGhlbHBlciBtZXRob2QgZm9yIHNldHRpbmcgdXAgYW4gYXBwIGFjY2VwdGFuY2UgdGVzdC4gQWRkcyBiZWZvcmVFYWNoL2FmdGVyRWFjaCBob29rcyB0byB0aGVcbiAqIGN1cnJlbnQgYXZhIHRlc3Qgc3VpdGUgd2hpY2ggd2lsbCBzZXR1cCBhbmQgdGVhcmRvd24gdGhlIGFjY2VwdGFuY2UgdGVzdC4gVGhleSBhbHNvIHNldHVwIGEgdGVzdFxuICogdHJhbnNhY3Rpb24gYW5kIHJvbGwgaXQgYmFjayBvbmNlIHRoZSB0ZXN0IGlzIGZpbmlzaGVkIChmb3IgdGhlIE9STSBhZGFwdGVycyB0aGF0IHN1cHBvcnQgaXQpLCBzb1xuICogeW91ciB0ZXN0IGRhdGEgd29uJ3QgcG9sbHV0ZSB0aGUgZGF0YWJhc2UuXG4gKlxuICogQHBhY2thZ2UgdGVzdFxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFwcEFjY2VwdGFuY2VUZXN0KGF2YTogYW55KSB7XG5cbiAgYXZhLmJlZm9yZUVhY2goYXN5bmMgKHQ6IGFueSkgPT4ge1xuICAgIGxldCBhcHAgPSB0LmNvbnRleHQuYXBwID0gbmV3IEFwcEFjY2VwdGFuY2UoKTtcbiAgICBhd2FpdCBhcHAuc3RhcnQoKTtcbiAgICBsZXQgYWRhcHRlcnMgPSBhcHAuYXBwbGljYXRpb24uY29udGFpbmVyLmxvb2t1cEFsbCgnb3JtLWFkYXB0ZXInKTtcbiAgICBsZXQgdHJhbnNhY3Rpb25Jbml0aWFsaXplcnM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuICAgIGZvckVhY2goYWRhcHRlcnMsIChBZGFwdGVyKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIEFkYXB0ZXIuc3RhcnRUZXN0VHJhbnNhY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdHJhbnNhY3Rpb25Jbml0aWFsaXplcnMucHVzaChBZGFwdGVyLnN0YXJ0VGVzdFRyYW5zYWN0aW9uKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGF3YWl0IGFsbCh0cmFuc2FjdGlvbkluaXRpYWxpemVycyk7XG4gIH0pO1xuXG4gIGF2YS5hZnRlckVhY2guYWx3YXlzKGFzeW5jICh0OiBhbnkpID0+IHtcbiAgICBsZXQgYXBwID0gdC5jb250ZXh0LmFwcDtcbiAgICBsZXQgdHJhbnNhY3Rpb25Sb2xsYmFja3M6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuICAgIGxldCBhZGFwdGVycyA9IGFwcC5hcHBsaWNhdGlvbi5jb250YWluZXIubG9va3VwQWxsKCdvcm0tYWRhcHRlcicpO1xuICAgIGZvckVhY2goYWRhcHRlcnMsIChBZGFwdGVyKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIEFkYXB0ZXIucm9sbGJhY2tUZXN0VHJhbnNhY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdHJhbnNhY3Rpb25Sb2xsYmFja3MucHVzaChBZGFwdGVyLnJvbGxiYWNrVGVzdFRyYW5zYWN0aW9uKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGF3YWl0IGFsbCh0cmFuc2FjdGlvblJvbGxiYWNrcyk7XG4gICAgYXdhaXQgYXBwLnNodXRkb3duKCk7XG4gIH0pO1xuXG59XG4iXX0=