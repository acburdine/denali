"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const bluebird_1 = require("bluebird");
const lodash_1 = require("lodash");
const mock_request_1 = require("./mock-request");
const mock_response_1 = require("./mock-response");
const object_1 = require("../metal/object");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWFjY2VwdGFuY2UuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsibGliL3Rlc3QvYXBwLWFjY2VwdGFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQTZCO0FBQzdCLHVDQUErQjtBQUMvQixtQ0FHZ0I7QUFDaEIsaURBQXlDO0FBQ3pDLG1EQUEyQztBQUMzQyw0Q0FBMkM7QUFHM0M7Ozs7Ozs7O0dBUUc7QUFDSCxtQkFBMkIsU0FBUSxnQkFBWTtJQXVCN0M7UUFDRSxLQUFLLEVBQUUsQ0FBQztRQWpCVjs7Ozs7V0FLRztRQUNILFlBQU8sR0FBK0I7WUFDcEMsTUFBTSxFQUFFLGtCQUFrQjtZQUMxQixjQUFjLEVBQUUsa0JBQWtCO1NBQ25DLENBQUM7UUFFRjs7V0FFRztRQUNPLGdCQUFXLEdBQWdDLEVBQUUsQ0FBQztRQUl0RCxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDakMsSUFBSSxnQkFBZ0IsR0FBdUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDdkcsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDO1FBQ2pELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQztZQUN0QyxXQUFXO1lBQ1gsR0FBRyxFQUFFLFlBQVk7WUFDakIsTUFBTSxFQUFZLEVBQUU7U0FDckIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0csS0FBSzs7WUFDVCxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDM0MsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNHLE9BQU8sQ0FBQyxPQUF5Rjs7WUFDckcsSUFBSSxJQUFJLEdBQVEsSUFB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UUFDSCxNQUFNLGNBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3ZCLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFTCxDQUFDO0FBNUJELG9DQTRCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBhbGwgfSBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQge1xuICBhc3NpZ24sXG4gIGZvckVhY2hcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBNb2NrUmVxdWVzdCBmcm9tICcuL21vY2stcmVxdWVzdCc7XG5pbXBvcnQgTW9ja1Jlc3BvbnNlIGZyb20gJy4vbW9jay1yZXNwb25zZSc7XG5pbXBvcnQgRGVuYWxpT2JqZWN0IGZyb20gJy4uL21ldGFsL29iamVjdCc7XG5pbXBvcnQgQXBwbGljYXRpb24gZnJvbSAnLi4vcnVudGltZS9hcHBsaWNhdGlvbic7XG5cbi8qKlxuICogVGhlIEFwcEFjY2VwdGFuY2UgY2xhc3MgcmVwcmVzZW50cyBhbiBhcHAgYWNjZXB0YW5jZSB0ZXN0LiBJdCBzcGlucyB1cCBhbiBpbi1tZW1vcnkgaW5zdGFuY2Ugb2ZcbiAqIHRoZSBhcHBsaWNhdGlvbiB1bmRlciB0ZXN0LCBhbmQgZXhwb3NlcyBtZXRob2RzIHRvIHN1Ym1pdCBzaW11bGF0ZWQgcmVxdWVzdHMgdG8gdGhlIGFwcGxpY2F0aW9uLFxuICogYW5kIGdldCB0aGUgcmVzcG9uc2UuIFRoaXMgaGVscHMga2VlcCBhY2NlcHRhbmNlIHRlc3RzIGxpZ2h0d2VpZ2h0IGFuZCBlYXNpbHkgcGFyYWxsZWxpemFibGUsXG4gKiBzaW5jZSB0aGV5IGRvbid0IG5lZWQgdG8gYmluZCB0byBhbiBhY3R1YWwgcG9ydC5cbiAqXG4gKiBAcGFja2FnZSB0ZXN0XG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuZXhwb3J0IGNsYXNzIEFwcEFjY2VwdGFuY2UgZXh0ZW5kcyBEZW5hbGlPYmplY3Qge1xuXG4gIC8qKlxuICAgKiBUaGUgYXBwbGljYXRpb24gaW5zdGFuY2UgdW5kZXIgdGVzdFxuICAgKi9cbiAgYXBwbGljYXRpb246IEFwcGxpY2F0aW9uO1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IGhlYWRlcnMgdGhhdCBhcmUgYXBwbGllZCB0byBlYWNoIHJlcXVlc3QuIFVzZWZ1bCBmb3IgaGFuZGxpbmcgQVBJLXdpZGUgY29udGVudC10eXBlcyxcbiAgICogc2Vzc2lvbnMsIGV0Yy5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBoZWFkZXJzOiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcbiAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gIH07XG5cbiAgLyoqXG4gICAqIEFuIGludGVybmFsIHJlZ2lzdHJ5IG9mIGNvbnRhaW5lciBpbmplY3Rpb25zLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9pbmplY3Rpb25zOiB7IFtmdWxsTmFtZTogc3RyaW5nXTogYW55IH0gPSB7fTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIGxldCBjb21waWxlZFBhdGggPSBwcm9jZXNzLmN3ZCgpO1xuICAgIGxldCBBcHBsaWNhdGlvbkNsYXNzOiB0eXBlb2YgQXBwbGljYXRpb24gPSByZXF1aXJlKHBhdGguam9pbihjb21waWxlZFBhdGgsICdhcHAvYXBwbGljYXRpb24nKSkuZGVmYXVsdDtcbiAgICBsZXQgZW52aXJvbm1lbnQgPSBwcm9jZXNzLmVudi5OT0RFX0VOViB8fCAndGVzdCc7XG4gICAgdGhpcy5hcHBsaWNhdGlvbiA9IG5ldyBBcHBsaWNhdGlvbkNsYXNzKHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgZGlyOiBjb21waWxlZFBhdGgsXG4gICAgICBhZGRvbnM6IDxzdHJpbmdbXT5bXVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBhcHBsaWNhdGlvbiAobm90ZTogdGhpcyB3b24ndCBhY3R1YWxseSBzdGFydCB0aGUgSFRUUCBzZXJ2ZXIsIGJ1dCBwZXJmb3JtcyBhbGwgdGhlXG4gICAqIG90aGVyIHN0YXJ0dXAgd29yayBmb3IgeW91KS5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBhc3luYyBzdGFydCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmFwcGxpY2F0aW9uLnJ1bkluaXRpYWxpemVycygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1Ym1pdCBhIHNpbXVsYXRlZCBIVFRQIHJlcXVlc3QgdG8gdGhlIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGFzeW5jIHJlcXVlc3Qob3B0aW9uczogeyBtZXRob2Q6IHN0cmluZywgdXJsOiBzdHJpbmcsIGJvZHk/OiBhbnksIGhlYWRlcnM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9IH0pOiBQcm9taXNlPHsgc3RhdHVzOiBudW1iZXIsIGJvZHk6IGFueSB9PiB7XG4gICAgbGV0IGJvZHk6IGFueSA9IG51bGw7XG4gICAgaWYgKG9wdGlvbnMuYm9keSkge1xuICAgICAgYm9keSA9IHR5cGVvZiBvcHRpb25zLmJvZHkgPT09ICdzdHJpbmcnID8gb3B0aW9ucy5ib2R5IDogSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5ib2R5KTtcbiAgICAgIG9wdGlvbnMuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyB8fCB7fTtcbiAgICAgIG9wdGlvbnMuaGVhZGVyc1snVHJhbnNmZXItRW5jb2RpbmcnXSA9ICdjaHVua2VkJztcbiAgICB9XG4gICAgbGV0IHJlcSA9IG5ldyBNb2NrUmVxdWVzdCh7XG4gICAgICBtZXRob2Q6IG9wdGlvbnMubWV0aG9kLFxuICAgICAgdXJsOiBvcHRpb25zLnVybCxcbiAgICAgIGhlYWRlcnM6IGFzc2lnbih7fSwgdGhpcy5oZWFkZXJzLCBvcHRpb25zLmhlYWRlcnMpXG4gICAgfSk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHsgc3RhdHVzOiBudW1iZXIsIGJvZHk6IGFueSB9PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgcmVzID0gbmV3IE1vY2tSZXNwb25zZSgoKSA9PiB7XG4gICAgICAgIGxldCByZXNCb2R5ID0gcmVzLl9nZXRTdHJpbmcoKTtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXNDb2RlIDwgNTAwKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlc0JvZHkgPSByZXMuX2dldEpTT04oKTtcbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgcmVzb2x2ZSh7IHN0YXR1czogcmVzLnN0YXR1c0NvZGUsIGJvZHk6IHJlc0JvZHkgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc0JvZHkgPSByZXNCb2R5LnJlcGxhY2UoL1xcXFxuL2csICdcXG4nKTtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBSZXF1ZXN0IGZhaWxlZCAtICR7IHJlcS5tZXRob2QudG9VcHBlckNhc2UoKSB9ICR7IHJlcS51cmwgfSByZXR1cm5lZCBhICR7IHJlcy5zdGF0dXNDb2RlIH06XFxuJHsgcmVzQm9keSB9YCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWZsb2F0aW5nLXByb21pc2VzXG4gICAgICB0aGlzLmFwcGxpY2F0aW9uLnJvdXRlci5oYW5kbGUoPGFueT5yZXEsIDxhbnk+cmVzKTtcblxuICAgICAgbGV0IFNJTVVMQVRFRF9XUklURV9ERUxBWSA9IDEwO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmIChib2R5KSB7XG4gICAgICAgICAgcmVxLndyaXRlKGJvZHkpO1xuICAgICAgICB9XG4gICAgICAgIHJlcS5lbmQoKTtcbiAgICAgIH0sIFNJTVVMQVRFRF9XUklURV9ERUxBWSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBhIHNpbXVsYXRlZCBHRVQgcmVxdWVzdFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGFzeW5jIGdldCh1cmw6IHN0cmluZywgb3B0aW9ucyA9IHt9KTogUHJvbWlzZTx7IHN0YXR1czogbnVtYmVyLCBib2R5OiBhbnkgfT4ge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoT2JqZWN0LmFzc2lnbihvcHRpb25zLCB7IHVybCwgbWV0aG9kOiAnZ2V0JyB9KSk7XG4gIH1cbiAgLyoqXG4gICAqIFNlbmQgYSBzaW11bGF0ZWQgSEVBRCByZXF1ZXN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYXN5bmMgaGVhZCh1cmw6IHN0cmluZywgb3B0aW9ucyA9IHt9KTogUHJvbWlzZTx7IHN0YXR1czogbnVtYmVyLCBib2R5OiBhbnkgfT4ge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoT2JqZWN0LmFzc2lnbihvcHRpb25zLCB7IHVybCwgbWV0aG9kOiAnaGVhZCcgfSkpO1xuICB9XG4gIC8qKlxuICAgKiBTZW5kIGEgc2ltdWxhdGVkIERFTEVURSByZXF1ZXN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYXN5bmMgZGVsZXRlKHVybDogc3RyaW5nLCBvcHRpb25zID0ge30pOiBQcm9taXNlPHsgc3RhdHVzOiBudW1iZXIsIGJvZHk6IGFueSB9PiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChPYmplY3QuYXNzaWduKG9wdGlvbnMsIHsgdXJsLCBtZXRob2Q6ICdkZWxldGUnIH0pKTtcbiAgfVxuICAvKipcbiAgICogU2VuZCBhIHNpbXVsYXRlZCBQT1NUIHJlcXVlc3RcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBhc3luYyBwb3N0KHVybDogc3RyaW5nLCBib2R5OiBhbnksIG9wdGlvbnMgPSB7fSk6IFByb21pc2U8eyBzdGF0dXM6IG51bWJlciwgYm9keTogYW55IH0+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KE9iamVjdC5hc3NpZ24ob3B0aW9ucywgeyB1cmwsIGJvZHksIG1ldGhvZDogJ3Bvc3QnIH0pKTtcbiAgfVxuICAvKipcbiAgICogU2VuZCBhIHNpbXVsYXRlZCBQVVQgcmVxdWVzdFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGFzeW5jIHB1dCh1cmw6IHN0cmluZywgYm9keTogYW55LCBvcHRpb25zID0ge30pOiBQcm9taXNlPHsgc3RhdHVzOiBudW1iZXIsIGJvZHk6IGFueSB9PiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChPYmplY3QuYXNzaWduKG9wdGlvbnMsIHsgdXJsLCBib2R5LCBtZXRob2Q6ICdwdXQnIH0pKTtcbiAgfVxuICAvKipcbiAgICogU2VuZCBhIHNpbXVsYXRlZCBQQVRDSCByZXF1ZXN0XG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYXN5bmMgcGF0Y2godXJsOiBzdHJpbmcsIGJvZHk6IHN0cmluZywgb3B0aW9ucyA9IHt9KTogUHJvbWlzZTx7IHN0YXR1czogbnVtYmVyLCBib2R5OiBhbnkgfT4ge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoT2JqZWN0LmFzc2lnbihvcHRpb25zLCB7IHVybCwgYm9keSwgbWV0aG9kOiAncGF0Y2gnIH0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgdmFsdWUgb2YgYSBkZWZhdWx0IGhlYWRlclxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGdldEhlYWRlcihuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmhlYWRlcnNbbmFtZV07XG4gIH1cblxuICAvKipcbiAgICogU2V0IGEgZGVmYXVsdCBoZWFkZXIgdmFsdWVcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBzZXRIZWFkZXIobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5oZWFkZXJzW25hbWVdID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgZGVmYXVsdCBoZWFkZXIgdmFsdWVcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICByZW1vdmVIZWFkZXIobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgZGVsZXRlIHRoaXMuaGVhZGVyc1tuYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rdXAgYW4gZW50cnkgaW4gdGhlIHRlc3QgYXBwbGljYXRpb24gY29udGFpbmVyXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgbG9va3VwKG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuYXBwbGljYXRpb24uY29udGFpbmVyLmxvb2t1cChuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVyd3JpdGUgYW4gZW50cnkgaW4gdGhlIHRlc3QgYXBwbGljYXRpb24gY29udGFpbmVyLiBVc2UgYHJlc3RvcmUoKWAgdG8gcmVzdG9yZSB0aGUgb3JpZ2luYWxcbiAgICogY29udGFpbmVyIGVudHJ5IGxhdGVyLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGluamVjdChuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLl9pbmplY3Rpb25zW25hbWVdID0gdGhpcy5hcHBsaWNhdGlvbi5jb250YWluZXIubG9va3VwKG5hbWUpO1xuICAgIHRoaXMuYXBwbGljYXRpb24uY29udGFpbmVyLnJlZ2lzdGVyKG5hbWUsIHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0b3JlIHRoZSBvcmlnaW5hbCBjb250YWluZXIgZW50cnkgZm9yIGFuIGVudHJ5IHRoYXQgd2FzIHByZXZpb3VzbHkgb3ZlcndyaXR0ZW4gYnkgYGluamVjdCgpYFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHJlc3RvcmUobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5hcHBsaWNhdGlvbi5jb250YWluZXIucmVnaXN0ZXIobmFtZSwgdGhpcy5faW5qZWN0aW9uc1tuYW1lXSk7XG4gICAgZGVsZXRlIHRoaXMuX2luamVjdGlvbnNbbmFtZV07XG4gIH1cblxuICAvKipcbiAgICogU2h1dCBkb3duIHRoZSB0ZXN0IGFwcGxpY2F0aW9uLCBjbGVhbmluZyB1cCBhbnkgcmVzb3VyY2VzIGluIHVzZVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGFzeW5jIHNodXRkb3duKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuYXBwbGljYXRpb24uc2h1dGRvd24oKTtcbiAgfVxuXG59XG5cbi8qKlxuICogQSBoZWxwZXIgbWV0aG9kIGZvciBzZXR0aW5nIHVwIGFuIGFwcCBhY2NlcHRhbmNlIHRlc3QuIEFkZHMgYmVmb3JlRWFjaC9hZnRlckVhY2ggaG9va3MgdG8gdGhlXG4gKiBjdXJyZW50IGF2YSB0ZXN0IHN1aXRlIHdoaWNoIHdpbGwgc2V0dXAgYW5kIHRlYXJkb3duIHRoZSBhY2NlcHRhbmNlIHRlc3QuIFRoZXkgYWxzbyBzZXR1cCBhIHRlc3RcbiAqIHRyYW5zYWN0aW9uIGFuZCByb2xsIGl0IGJhY2sgb25jZSB0aGUgdGVzdCBpcyBmaW5pc2hlZCAoZm9yIHRoZSBPUk0gYWRhcHRlcnMgdGhhdCBzdXBwb3J0IGl0KSwgc29cbiAqIHlvdXIgdGVzdCBkYXRhIHdvbid0IHBvbGx1dGUgdGhlIGRhdGFiYXNlLlxuICpcbiAqIEBwYWNrYWdlIHRlc3RcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhcHBBY2NlcHRhbmNlVGVzdChhdmE6IGFueSkge1xuXG4gIGF2YS5iZWZvcmVFYWNoKGFzeW5jICh0OiBhbnkpID0+IHtcbiAgICBsZXQgYXBwID0gdC5jb250ZXh0LmFwcCA9IG5ldyBBcHBBY2NlcHRhbmNlKCk7XG4gICAgYXdhaXQgYXBwLnN0YXJ0KCk7XG4gICAgbGV0IGFkYXB0ZXJzID0gYXBwLmFwcGxpY2F0aW9uLmNvbnRhaW5lci5sb29rdXBBbGwoJ29ybS1hZGFwdGVyJyk7XG4gICAgbGV0IHRyYW5zYWN0aW9uSW5pdGlhbGl6ZXJzOiBQcm9taXNlPHZvaWQ+W10gPSBbXTtcbiAgICBmb3JFYWNoKGFkYXB0ZXJzLCAoQWRhcHRlcikgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBBZGFwdGVyLnN0YXJ0VGVzdFRyYW5zYWN0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRyYW5zYWN0aW9uSW5pdGlhbGl6ZXJzLnB1c2goQWRhcHRlci5zdGFydFRlc3RUcmFuc2FjdGlvbigpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBhd2FpdCBhbGwodHJhbnNhY3Rpb25Jbml0aWFsaXplcnMpO1xuICB9KTtcblxuICBhdmEuYWZ0ZXJFYWNoLmFsd2F5cyhhc3luYyAodDogYW55KSA9PiB7XG4gICAgbGV0IGFwcCA9IHQuY29udGV4dC5hcHA7XG4gICAgbGV0IHRyYW5zYWN0aW9uUm9sbGJhY2tzOiBQcm9taXNlPHZvaWQ+W10gPSBbXTtcbiAgICBsZXQgYWRhcHRlcnMgPSBhcHAuYXBwbGljYXRpb24uY29udGFpbmVyLmxvb2t1cEFsbCgnb3JtLWFkYXB0ZXInKTtcbiAgICBmb3JFYWNoKGFkYXB0ZXJzLCAoQWRhcHRlcikgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBBZGFwdGVyLnJvbGxiYWNrVGVzdFRyYW5zYWN0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRyYW5zYWN0aW9uUm9sbGJhY2tzLnB1c2goQWRhcHRlci5yb2xsYmFja1Rlc3RUcmFuc2FjdGlvbigpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBhd2FpdCBhbGwodHJhbnNhY3Rpb25Sb2xsYmFja3MpO1xuICAgIGF3YWl0IGFwcC5zaHV0ZG93bigpO1xuICB9KTtcblxufVxuIl19