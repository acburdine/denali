"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const instrumentation_1 = require("../metal/instrumentation");
const model_1 = require("../data/model");
const response_1 = require("./response");
const createDebug = require("debug");
const lodash_1 = require("lodash");
const assert = require("assert");
const each_prototype_1 = require("../metal/each-prototype");
const object_1 = require("../metal/object");
const errors_1 = require("./errors");
const debug = createDebug('denali:action');
/**
 * An error used to break the chain of promises created by running filters. Indicates that a before
 * filter returned a value which will be rendered as the response, and that the remaining filters
 * and the responder method should not be run.
 */
class PreemptiveRender extends Error {
    constructor(response) {
        super();
        this.response = response;
    }
}
/**
 * Actions form the core of interacting with a Denali application. They are the controller layer in
 * the MVC architecture, taking in incoming requests, performing business logic, and handing off to
 * the renderer to send the response.
 *
 * When a request comes in, Denali will invoke the `respond` method (or `respondWith__` for content
 * negotiated requests) on the matching Action class. The return value (or resolved return value) of
 * this method is used to render the response.
 *
 * Actions also support filters. Simply define a method on your action, and add the method name to
 * the `before` or `after` array. Filters behave similar to responders in that they receive the
 * request params and can return a promise which will be waited on before continuing. Filters are
 * inheritable, so child classes will run filters added by parent classes.
 *
 * @package runtime
 * @since 0.1.0
 */
class Action extends object_1.default {
    /**
     * Creates an Action that will respond to the given Request.
     */
    constructor(options) {
        super();
        /**
         * Force which serializer should be used for the rendering of the response.
         *
         * By default if the response is of type Error it will use the 'error' serializer. On the other
         * hand if it's a Model, it will use that model's serializer. Otherwise, it will use the
         * 'application' serializer.
         *
         * @since 0.1.0
         */
        this.serializer = null;
        this.request = options.request;
        this.logger = options.logger;
        this.container = options.container;
        this.config = this.container.config;
    }
    /**
     * Cache the list of available formats this action can respond to.
     */
    static formats() {
        if (!this._formats) {
            debug(`caching list of content types accepted by ${this.name} action`);
            this._formats = [];
            each_prototype_1.default(this.prototype, (proto) => {
                this._formats = this._formats.concat(Object.getOwnPropertyNames(proto));
            });
            this._formats = this._formats.filter((prop) => {
                return /^respondWith/.test(prop);
            }).map((responder) => {
                return responder.match(/respondWith(.+)/)[1].toLowerCase();
            });
            this._formats = lodash_1.uniq(this._formats);
        }
        return this._formats;
    }
    /**
     * Fetch a model class by it's type string, i.e. 'post' => PostModel
     *
     * @since 0.1.0
     */
    modelFor(type) {
        return this.container.lookup(`model:${type}`);
    }
    /**
     * Fetch a service by it's container name, i.e. 'email' => 'services/email.js'
     *
     * @since 0.1.0
     */
    service(type) {
        return this.container.lookup(`service:${type}`);
    }
    /**
     * Render some supplied data to the response. Data can be:
     *
     *   * a Model instance
     *   * an array of Model instances
     *   * a Denali.Response instance
     */
    render(response) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`[${this.request.id}]: rendering`);
            if (!(response instanceof response_1.default)) {
                debug(`[${this.request.id}]: wrapping returned value in a Response`);
                response = new response_1.default(200, response);
            }
            response.options.action = this;
            if (response.body && response.options.raw !== true && this.serializer !== false) {
                let sample = lodash_1.isArray(response.body) ? response.body[0] : response.body;
                let type;
                if (this.serializer) {
                    type = this.serializer;
                }
                else if (sample instanceof Error) {
                    type = 'error';
                }
                else if (sample instanceof model_1.default) {
                    type = sample.type;
                }
                else {
                    type = 'application';
                }
                let serializer = this.container.lookup(`serializer:${type}`);
                debug(`[${this.request.id}]: serializing response body with ${type} serializer`);
                yield serializer.serialize(response, lodash_1.assign({ action: this }, response.options));
            }
            return response;
        });
    }
    /**
     * Invokes the action. Determines the best responder method for content negotiation, then executes
     * the filter/responder chain in sequence, handling errors and rendering the response.
     *
     * You shouldn't invoke this directly - Denali will automatically wire up your routes to this
     * method.
     */
    run() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Merge all available params into a single convenience object. The original params (query,
            // body, url) can all be accessed at their original locations still if you want.
            let paramSources = [
                (this.request.route && this.request.route.additionalParams) || {},
                this.request.params,
                this.request.query,
                this.request.body
            ];
            let params = lodash_1.assign({}, ...paramSources);
            // Content negotiation. Pick the best responder method based on the incoming content type and
            // the available responder types.
            let respond = this._pickBestResponder();
            debug(`[${this.request.id}]: content negotiation picked \`${respond.name}()\` responder method`);
            respond = respond.bind(this, params);
            // Build the before and after filter chains
            let { beforeChain, afterChain } = this._buildFilterChains();
            let render = this.render.bind(this);
            let instrumentation = instrumentation_1.default.instrument('action.run', {
                action: this.constructor.name,
                params,
                headers: this.request.headers
            });
            let response;
            try {
                debug(`[${this.request.id}]: running before filters`);
                yield this._invokeFilters(beforeChain, params, true);
                debug(`[${this.request.id}]: running responder`);
                let result = yield respond(params);
                response = yield render(result);
                debug(`[${this.request.id}]: running after filters`);
                yield this._invokeFilters(afterChain, params, false);
            }
            catch (error) {
                if (error instanceof PreemptiveRender) {
                    response = error.response;
                }
                else {
                    throw error;
                }
            }
            finally {
                instrumentation.finish();
            }
            return response;
        });
    }
    /**
     * Find the best responder method for the incoming request, given the incoming request's Accept
     * header.
     *
     * If the Accept header is "Accept: * / *", then the generic `respond()` method is selected.
     * Otherwise, attempt to find the best responder method based on the mime types.
     */
    _pickBestResponder() {
        let responder = this.respond;
        let bestFormat;
        assert(typeof responder === 'function', `Your '${this.constructor.name}' action must define a respond method.`);
        if (this.request.get('accept') !== '*/*') {
            let ActionClass = this.constructor;
            let formats = ActionClass.formats();
            if (formats.length > 0) {
                bestFormat = this.request.accepts(formats);
                if (bestFormat === false) {
                    throw new errors_1.default.NotAcceptable();
                }
                responder = this[`respondWith${lodash_1.capitalize(bestFormat)}`];
            }
        }
        return responder;
    }
    /**
     * Walk the prototype chain of this Action instance to find all the `before` and `after` arrays to
     * build the complete filter chains.
     *
     * Caches the result on the child Action class to avoid the potentially expensive prototype walk
     * on each request.
     *
     * Throws if it encounters the name of a filter method that doesn't exist.
     */
    _buildFilterChains() {
        let ActionClass = this.constructor;
        if (!ActionClass._before) {
            let prototypeChain = [];
            each_prototype_1.default(ActionClass, (prototype) => {
                prototypeChain.push(prototype);
            });
            ['before', 'after'].forEach((stage) => {
                let filterNames = lodash_1.compact(lodash_1.uniq(lodash_1.flatten(lodash_1.map(prototypeChain, stage))));
                filterNames.forEach((filterName) => {
                    if (!this[filterName]) {
                        throw new Error(`${filterName} method not found on the ${ActionClass.name} action.`);
                    }
                });
                ActionClass[`_${stage}`] = filterNames;
            });
        }
        return {
            beforeChain: ActionClass._before,
            afterChain: ActionClass._after
        };
    }
    /**
     * Invokes the filters in the supplied chain in sequence.
     */
    _invokeFilters(chain, params, haltable) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            chain = chain.slice(0);
            let ActionClass = this.constructor;
            while (chain.length > 0) {
                let filterName = chain.shift();
                let filter = this[filterName];
                let instrumentation = instrumentation_1.default.instrument('action.filter', {
                    action: ActionClass.name,
                    params,
                    filter: filterName,
                    headers: this.request.headers
                });
                debug(`[${this.request.id}]: running \`${filterName}\` filter`);
                let filterResult = yield filter.call(this, params);
                if (haltable && filterResult != null) {
                    debug(`[${this.request.id}]: \`${filterName}\` preempted the action, rendering the returned value`);
                    let response = yield this.render(filterResult);
                    throw new PreemptiveRender(response);
                }
                instrumentation.finish();
            }
        });
    }
}
/**
 * Invoked before the `respond()` method. The framework will invoke filters from parent classes
 * and mixins in the same order the mixins were applied.
 *
 * Filters can be synchronous, or return a promise (which will pause the before/respond/after
 * chain until it resolves).
 *
 * If a before filter returns any value (or returns a promise which resolves to any value) other
 * than null or undefined, Denali will attempt to render that response and halt further processing
 * of the request (including remaining before filters).
 *
 * @since 0.1.0
 */
Action.before = [];
/**
 * Invoked after the `respond()` method. The framework will invoke filters from parent classes and
 * mixins in the same order the mixins were applied.
 *
 * Filters can be synchronous, or return a promise (which will pause the before/respond/after
 * chain until it resolves).
 *
 * @since 0.1.0
 */
Action.after = [];
exports.default = Action;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9ydW50aW1lL2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBdUQ7QUFDdkQseUNBQWtDO0FBQ2xDLHlDQUFrQztBQUVsQyxxQ0FBcUM7QUFDckMsbUNBUWdCO0FBQ2hCLGlDQUFpQztBQUNqQyw0REFBb0Q7QUFDcEQsNENBQTJDO0FBSzNDLHFDQUE4QjtBQUc5QixNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFM0M7Ozs7R0FJRztBQUNILHNCQUF1QixTQUFRLEtBQUs7SUFFbEMsWUFBWSxRQUFrQjtRQUM1QixLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzNCLENBQUM7Q0FDRjtBQWtCRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILFlBQXNCLFNBQVEsZ0JBQVk7SUE0RnhDOztPQUVHO0lBQ0gsWUFBWSxPQUFzQjtRQUNoQyxLQUFLLEVBQUUsQ0FBQztRQTNDVjs7Ozs7Ozs7V0FRRztRQUNJLGVBQVUsR0FBcUIsSUFBSSxDQUFDO1FBbUN6QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0lBQ3RDLENBQUM7SUE5RkQ7O09BRUc7SUFDSyxNQUFNLENBQUMsT0FBTztRQUNwQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ25CLEtBQUssQ0FBQyw2Q0FBOEMsSUFB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dXJjZXNDb250ZW50IjpbImltcG9ydCBJbnN0cnVtZW50YXRpb24gZnJvbSAnLi4vbWV0YWwvaW5zdHJ1bWVudGF0aW9uJztcbmltcG9ydCBNb2RlbCBmcm9tICcuLi9kYXRhL21vZGVsJztcbmltcG9ydCBSZXNwb25zZSBmcm9tICcuL3Jlc3BvbnNlJztcbmltcG9ydCAqIGFzIGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgKiBhcyBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQge1xuICBhc3NpZ24sXG4gIGNhcGl0YWxpemUsXG4gIGlzQXJyYXksXG4gIHVuaXEsXG4gIGZsYXR0ZW4sXG4gIGNvbXBhY3QsXG4gIG1hcFxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgZWFjaFByb3RvdHlwZSBmcm9tICcuLi9tZXRhbC9lYWNoLXByb3RvdHlwZSc7XG5pbXBvcnQgRGVuYWxpT2JqZWN0IGZyb20gJy4uL21ldGFsL29iamVjdCc7XG5pbXBvcnQgUmVxdWVzdCBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IExvZ2dlciBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4vY29udGFpbmVyJztcbmltcG9ydCBTZXJ2aWNlIGZyb20gJy4vc2VydmljZSc7XG5pbXBvcnQgRXJyb3JzIGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCBTZXJpYWxpemVyIGZyb20gJy4uL2RhdGEvc2VyaWFsaXplcic7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RlbmFsaTphY3Rpb24nKTtcblxuLyoqXG4gKiBBbiBlcnJvciB1c2VkIHRvIGJyZWFrIHRoZSBjaGFpbiBvZiBwcm9taXNlcyBjcmVhdGVkIGJ5IHJ1bm5pbmcgZmlsdGVycy4gSW5kaWNhdGVzIHRoYXQgYSBiZWZvcmVcbiAqIGZpbHRlciByZXR1cm5lZCBhIHZhbHVlIHdoaWNoIHdpbGwgYmUgcmVuZGVyZWQgYXMgdGhlIHJlc3BvbnNlLCBhbmQgdGhhdCB0aGUgcmVtYWluaW5nIGZpbHRlcnNcbiAqIGFuZCB0aGUgcmVzcG9uZGVyIG1ldGhvZCBzaG91bGQgbm90IGJlIHJ1bi5cbiAqL1xuY2xhc3MgUHJlZW1wdGl2ZVJlbmRlciBleHRlbmRzIEVycm9yIHtcbiAgcHVibGljIHJlc3BvbnNlOiBSZXNwb25zZTtcbiAgY29uc3RydWN0b3IocmVzcG9uc2U6IFJlc3BvbnNlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RvciBvcHRpb25zIGZvciBBY3Rpb24gY2xhc3NcbiAqXG4gKiBAcGFja2FnZSBydW50aW1lXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aW9uT3B0aW9ucyB7XG4gIHJlcXVlc3Q6IFJlcXVlc3Q7XG4gIHJlc3BvbnNlOiBodHRwLlNlcnZlclJlc3BvbnNlO1xuICBsb2dnZXI6IExvZ2dlcjtcbiAgY29udGFpbmVyOiBDb250YWluZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzcG9uZGVyIHtcbiAgKHBhcmFtczogYW55KTogUmVzcG9uc2UgfCB7IFtrZXk6IHN0cmluZ106IGFueSB9IHwgdm9pZDtcbn1cblxuLyoqXG4gKiBBY3Rpb25zIGZvcm0gdGhlIGNvcmUgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIERlbmFsaSBhcHBsaWNhdGlvbi4gVGhleSBhcmUgdGhlIGNvbnRyb2xsZXIgbGF5ZXIgaW5cbiAqIHRoZSBNVkMgYXJjaGl0ZWN0dXJlLCB0YWtpbmcgaW4gaW5jb21pbmcgcmVxdWVzdHMsIHBlcmZvcm1pbmcgYnVzaW5lc3MgbG9naWMsIGFuZCBoYW5kaW5nIG9mZiB0b1xuICogdGhlIHJlbmRlcmVyIHRvIHNlbmQgdGhlIHJlc3BvbnNlLlxuICpcbiAqIFdoZW4gYSByZXF1ZXN0IGNvbWVzIGluLCBEZW5hbGkgd2lsbCBpbnZva2UgdGhlIGByZXNwb25kYCBtZXRob2QgKG9yIGByZXNwb25kV2l0aF9fYCBmb3IgY29udGVudFxuICogbmVnb3RpYXRlZCByZXF1ZXN0cykgb24gdGhlIG1hdGNoaW5nIEFjdGlvbiBjbGFzcy4gVGhlIHJldHVybiB2YWx1ZSAob3IgcmVzb2x2ZWQgcmV0dXJuIHZhbHVlKSBvZlxuICogdGhpcyBtZXRob2QgaXMgdXNlZCB0byByZW5kZXIgdGhlIHJlc3BvbnNlLlxuICpcbiAqIEFjdGlvbnMgYWxzbyBzdXBwb3J0IGZpbHRlcnMuIFNpbXBseSBkZWZpbmUgYSBtZXRob2Qgb24geW91ciBhY3Rpb24sIGFuZCBhZGQgdGhlIG1ldGhvZCBuYW1lIHRvXG4gKiB0aGUgYGJlZm9yZWAgb3IgYGFmdGVyYCBhcnJheS4gRmlsdGVycyBiZWhhdmUgc2ltaWxhciB0byByZXNwb25kZXJzIGluIHRoYXQgdGhleSByZWNlaXZlIHRoZVxuICogcmVxdWVzdCBwYXJhbXMgYW5kIGNhbiByZXR1cm4gYSBwcm9taXNlIHdoaWNoIHdpbGwgYmUgd2FpdGVkIG9uIGJlZm9yZSBjb250aW51aW5nLiBGaWx0ZXJzIGFyZVxuICogaW5oZXJpdGFibGUsIHNvIGNoaWxkIGNsYXNzZXMgd2lsbCBydW4gZmlsdGVycyBhZGRlZCBieSBwYXJlbnQgY2xhc3Nlcy5cbiAqXG4gKiBAcGFja2FnZSBydW50aW1lXG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuYWJzdHJhY3QgY2xhc3MgQWN0aW9uIGV4dGVuZHMgRGVuYWxpT2JqZWN0IHtcblxuICAvKipcbiAgICogQ2FjaGVkIGxpc3Qgb2YgcmVzcG9uZGVyIGZvcm1hdHMgdGhpcyBhY3Rpb24gY2xhc3Mgc3VwcG9ydHMuXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBfZm9ybWF0czogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIENhY2hlIHRoZSBsaXN0IG9mIGF2YWlsYWJsZSBmb3JtYXRzIHRoaXMgYWN0aW9uIGNhbiByZXNwb25kIHRvLlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZm9ybWF0cygpOiBzdHJpbmdbXSB7XG4gICAgaWYgKCF0aGlzLl9mb3JtYXRzKSB7XG4gICAgICBkZWJ1ZyhgY2FjaGluZyBsaXN0IG9mIGNvbnRlbnQgdHlwZXMgYWNjZXB0ZWQgYnkgJHsgdGhpcy5uYW1lIH0gYWN0aW9uYCk7XG4gICAgICB0aGlzLl9mb3JtYXRzID0gW107XG4gICAgICBlYWNoUHJvdG90eXBlKHRoaXMucHJvdG90eXBlLCAocHJvdG8pID0+IHtcbiAgICAgICAgdGhpcy5fZm9ybWF0cyA9IHRoaXMuX2Zvcm1hdHMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHByb3RvKSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2Zvcm1hdHMgPSB0aGlzLl9mb3JtYXRzLmZpbHRlcigocHJvcCkgPT4ge1xuICAgICAgICByZXR1cm4gL15yZXNwb25kV2l0aC8udGVzdChwcm9wKTtcbiAgICAgIH0pLm1hcCgocmVzcG9uZGVyKSA9PiB7XG4gICAgICAgIHJldHVybiByZXNwb25kZXIubWF0Y2goL3Jlc3BvbmRXaXRoKC4rKS8pWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2Zvcm1hdHMgPSB1bmlxKHRoaXMuX2Zvcm1hdHMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZm9ybWF0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnZva2VkIGJlZm9yZSB0aGUgYHJlc3BvbmQoKWAgbWV0aG9kLiBUaGUgZnJhbWV3b3JrIHdpbGwgaW52b2tlIGZpbHRlcnMgZnJvbSBwYXJlbnQgY2xhc3Nlc1xuICAgKiBhbmQgbWl4aW5zIGluIHRoZSBzYW1lIG9yZGVyIHRoZSBtaXhpbnMgd2VyZSBhcHBsaWVkLlxuICAgKlxuICAgKiBGaWx0ZXJzIGNhbiBiZSBzeW5jaHJvbm91cywgb3IgcmV0dXJuIGEgcHJvbWlzZSAod2hpY2ggd2lsbCBwYXVzZSB0aGUgYmVmb3JlL3Jlc3BvbmQvYWZ0ZXJcbiAgICogY2hhaW4gdW50aWwgaXQgcmVzb2x2ZXMpLlxuICAgKlxuICAgKiBJZiBhIGJlZm9yZSBmaWx0ZXIgcmV0dXJucyBhbnkgdmFsdWUgKG9yIHJldHVybnMgYSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHRvIGFueSB2YWx1ZSkgb3RoZXJcbiAgICogdGhhbiBudWxsIG9yIHVuZGVmaW5lZCwgRGVuYWxpIHdpbGwgYXR0ZW1wdCB0byByZW5kZXIgdGhhdCByZXNwb25zZSBhbmQgaGFsdCBmdXJ0aGVyIHByb2Nlc3NpbmdcbiAgICogb2YgdGhlIHJlcXVlc3QgKGluY2x1ZGluZyByZW1haW5pbmcgYmVmb3JlIGZpbHRlcnMpLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgYmVmb3JlOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBJbnZva2VkIGFmdGVyIHRoZSBgcmVzcG9uZCgpYCBtZXRob2QuIFRoZSBmcmFtZXdvcmsgd2lsbCBpbnZva2UgZmlsdGVycyBmcm9tIHBhcmVudCBjbGFzc2VzIGFuZFxuICAgKiBtaXhpbnMgaW4gdGhlIHNhbWUgb3JkZXIgdGhlIG1peGlucyB3ZXJlIGFwcGxpZWQuXG4gICAqXG4gICAqIEZpbHRlcnMgY2FuIGJlIHN5bmNocm9ub3VzLCBvciByZXR1cm4gYSBwcm9taXNlICh3aGljaCB3aWxsIHBhdXNlIHRoZSBiZWZvcmUvcmVzcG9uZC9hZnRlclxuICAgKiBjaGFpbiB1bnRpbCBpdCByZXNvbHZlcykuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhZnRlcjogc3RyaW5nW10gPSBbXTtcblxuICAvKipcbiAgICogRm9yY2Ugd2hpY2ggc2VyaWFsaXplciBzaG91bGQgYmUgdXNlZCBmb3IgdGhlIHJlbmRlcmluZyBvZiB0aGUgcmVzcG9uc2UuXG4gICAqXG4gICAqIEJ5IGRlZmF1bHQgaWYgdGhlIHJlc3BvbnNlIGlzIG9mIHR5cGUgRXJyb3IgaXQgd2lsbCB1c2UgdGhlICdlcnJvcicgc2VyaWFsaXplci4gT24gdGhlIG90aGVyXG4gICAqIGhhbmQgaWYgaXQncyBhIE1vZGVsLCBpdCB3aWxsIHVzZSB0aGF0IG1vZGVsJ3Mgc2VyaWFsaXplci4gT3RoZXJ3aXNlLCBpdCB3aWxsIHVzZSB0aGVcbiAgICogJ2FwcGxpY2F0aW9uJyBzZXJpYWxpemVyLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBzZXJpYWxpemVyOiBzdHJpbmcgfCBib29sZWFuID0gbnVsbDtcblxuICAvKipcbiAgICogVGhlIGFwcGxpY2F0aW9uIGNvbmZpZ1xuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBjb25maWc6IGFueTtcblxuICAvKipcbiAgICogVGhlIGluY29taW5nIFJlcXVlc3QgdGhhdCB0aGlzIEFjdGlvbiBpcyByZXNwb25kaW5nIHRvLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyByZXF1ZXN0OiBSZXF1ZXN0O1xuXG4gIC8qKlxuICAgKiBUaGUgYXBwbGljYXRpb24gbG9nZ2VyIGluc3RhbmNlXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIGxvZ2dlcjogTG9nZ2VyO1xuXG4gIC8qKlxuICAgKiBUaGUgYXBwbGljYXRpb24gY29udGFpbmVyXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIGNvbnRhaW5lcjogQ29udGFpbmVyO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIEFjdGlvbiB0aGF0IHdpbGwgcmVzcG9uZCB0byB0aGUgZ2l2ZW4gUmVxdWVzdC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEFjdGlvbk9wdGlvbnMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucmVxdWVzdCA9IG9wdGlvbnMucmVxdWVzdDtcbiAgICB0aGlzLmxvZ2dlciA9IG9wdGlvbnMubG9nZ2VyO1xuICAgIHRoaXMuY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXI7XG4gICAgdGhpcy5jb25maWcgPSB0aGlzLmNvbnRhaW5lci5jb25maWc7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggYSBtb2RlbCBjbGFzcyBieSBpdCdzIHR5cGUgc3RyaW5nLCBpLmUuICdwb3N0JyA9PiBQb3N0TW9kZWxcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgbW9kZWxGb3IodHlwZTogc3RyaW5nKTogTW9kZWwge1xuICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5sb29rdXAoYG1vZGVsOiR7IHR5cGUgfWApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIGEgc2VydmljZSBieSBpdCdzIGNvbnRhaW5lciBuYW1lLCBpLmUuICdlbWFpbCcgPT4gJ3NlcnZpY2VzL2VtYWlsLmpzJ1xuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBzZXJ2aWNlKHR5cGU6IHN0cmluZyk6IFNlcnZpY2Uge1xuICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5sb29rdXAoYHNlcnZpY2U6JHsgdHlwZSB9YCk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHNvbWUgc3VwcGxpZWQgZGF0YSB0byB0aGUgcmVzcG9uc2UuIERhdGEgY2FuIGJlOlxuICAgKlxuICAgKiAgICogYSBNb2RlbCBpbnN0YW5jZVxuICAgKiAgICogYW4gYXJyYXkgb2YgTW9kZWwgaW5zdGFuY2VzXG4gICAqICAgKiBhIERlbmFsaS5SZXNwb25zZSBpbnN0YW5jZVxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyByZW5kZXIocmVzcG9uc2U6IGFueSk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICBkZWJ1ZyhgWyR7IHRoaXMucmVxdWVzdC5pZCB9XTogcmVuZGVyaW5nYCk7XG4gICAgaWYgKCEocmVzcG9uc2UgaW5zdGFuY2VvZiBSZXNwb25zZSkpIHtcbiAgICAgIGRlYnVnKGBbJHsgdGhpcy5yZXF1ZXN0LmlkIH1dOiB3cmFwcGluZyByZXR1cm5lZCB2YWx1ZSBpbiBhIFJlc3BvbnNlYCk7XG4gICAgICByZXNwb25zZSA9IG5ldyBSZXNwb25zZSgyMDAsIHJlc3BvbnNlKTtcbiAgICB9XG5cbiAgICByZXNwb25zZS5vcHRpb25zLmFjdGlvbiA9IHRoaXM7XG5cbiAgICBpZiAocmVzcG9uc2UuYm9keSAmJiByZXNwb25zZS5vcHRpb25zLnJhdyAhPT0gdHJ1ZSAmJiB0aGlzLnNlcmlhbGl6ZXIgIT09IGZhbHNlKSB7XG4gICAgICBsZXQgc2FtcGxlID0gaXNBcnJheShyZXNwb25zZS5ib2R5KSA/IHJlc3BvbnNlLmJvZHlbMF0gOiByZXNwb25zZS5ib2R5O1xuICAgICAgbGV0IHR5cGU7XG4gICAgICBpZiAodGhpcy5zZXJpYWxpemVyKSB7XG4gICAgICAgIHR5cGUgPSB0aGlzLnNlcmlhbGl6ZXI7XG4gICAgICB9IGVsc2UgaWYgKHNhbXBsZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHR5cGUgPSAnZXJyb3InO1xuICAgICAgfSBlbHNlIGlmIChzYW1wbGUgaW5zdGFuY2VvZiBNb2RlbCkge1xuICAgICAgICB0eXBlID0gc2FtcGxlLnR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlID0gJ2FwcGxpY2F0aW9uJztcbiAgICAgIH1cbiAgICAgIGxldCBzZXJpYWxpemVyOiBTZXJpYWxpemVyID0gdGhpcy5jb250YWluZXIubG9va3VwKGBzZXJpYWxpemVyOiR7IHR5cGUgfWApO1xuICAgICAgZGVidWcoYFskeyB0aGlzLnJlcXVlc3QuaWQgfV06IHNlcmlhbGl6aW5nIHJlc3BvbnNlIGJvZHkgd2l0aCAkeyB0eXBlIH0gc2VyaWFsaXplcmApO1xuICAgICAgYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUocmVzcG9uc2UsIGFzc2lnbih7IGFjdGlvbjogdGhpcyB9LCByZXNwb25zZS5vcHRpb25zKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEludm9rZXMgdGhlIGFjdGlvbi4gRGV0ZXJtaW5lcyB0aGUgYmVzdCByZXNwb25kZXIgbWV0aG9kIGZvciBjb250ZW50IG5lZ290aWF0aW9uLCB0aGVuIGV4ZWN1dGVzXG4gICAqIHRoZSBmaWx0ZXIvcmVzcG9uZGVyIGNoYWluIGluIHNlcXVlbmNlLCBoYW5kbGluZyBlcnJvcnMgYW5kIHJlbmRlcmluZyB0aGUgcmVzcG9uc2UuXG4gICAqXG4gICAqIFlvdSBzaG91bGRuJ3QgaW52b2tlIHRoaXMgZGlyZWN0bHkgLSBEZW5hbGkgd2lsbCBhdXRvbWF0aWNhbGx5IHdpcmUgdXAgeW91ciByb3V0ZXMgdG8gdGhpc1xuICAgKiBtZXRob2QuXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcnVuKCk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICAvLyBNZXJnZSBhbGwgYXZhaWxhYmxlIHBhcmFtcyBpbnRvIGEgc2luZ2xlIGNvbnZlbmllbmNlIG9iamVjdC4gVGhlIG9yaWdpbmFsIHBhcmFtcyAocXVlcnksXG4gICAgLy8gYm9keSwgdXJsKSBjYW4gYWxsIGJlIGFjY2Vzc2VkIGF0IHRoZWlyIG9yaWdpbmFsIGxvY2F0aW9ucyBzdGlsbCBpZiB5b3Ugd2FudC5cbiAgICBsZXQgcGFyYW1Tb3VyY2VzID0gW1xuICAgICAgKHRoaXMucmVxdWVzdC5yb3V0ZSAmJiB0aGlzLnJlcXVlc3Qucm91dGUuYWRkaXRpb25hbFBhcmFtcykgfHwge30sXG4gICAgICB0aGlzLnJlcXVlc3QucGFyYW1zLFxuICAgICAgdGhpcy5yZXF1ZXN0LnF1ZXJ5LFxuICAgICAgdGhpcy5yZXF1ZXN0LmJvZHlcbiAgICBdO1xuICAgIGxldCBwYXJhbXMgPSBhc3NpZ248YW55Pih7fSwgLi4ucGFyYW1Tb3VyY2VzKTtcblxuICAgIC8vIENvbnRlbnQgbmVnb3RpYXRpb24uIFBpY2sgdGhlIGJlc3QgcmVzcG9uZGVyIG1ldGhvZCBiYXNlZCBvbiB0aGUgaW5jb21pbmcgY29udGVudCB0eXBlIGFuZFxuICAgIC8vIHRoZSBhdmFpbGFibGUgcmVzcG9uZGVyIHR5cGVzLlxuICAgIGxldCByZXNwb25kID0gdGhpcy5fcGlja0Jlc3RSZXNwb25kZXIoKTtcbiAgICBkZWJ1ZyhgWyR7IHRoaXMucmVxdWVzdC5pZCB9XTogY29udGVudCBuZWdvdGlhdGlvbiBwaWNrZWQgXFxgJHsgcmVzcG9uZC5uYW1lIH0oKVxcYCByZXNwb25kZXIgbWV0aG9kYCk7XG4gICAgcmVzcG9uZCA9IHJlc3BvbmQuYmluZCh0aGlzLCBwYXJhbXMpO1xuXG4gICAgLy8gQnVpbGQgdGhlIGJlZm9yZSBhbmQgYWZ0ZXIgZmlsdGVyIGNoYWluc1xuICAgIGxldCB7IGJlZm9yZUNoYWluLCBhZnRlckNoYWluIH0gPSB0aGlzLl9idWlsZEZpbHRlckNoYWlucygpO1xuXG4gICAgbGV0IHJlbmRlciA9IHRoaXMucmVuZGVyLmJpbmQodGhpcyk7XG5cbiAgICBsZXQgaW5zdHJ1bWVudGF0aW9uID0gSW5zdHJ1bWVudGF0aW9uLmluc3RydW1lbnQoJ2FjdGlvbi5ydW4nLCB7XG4gICAgICBhY3Rpb246IHRoaXMuY29uc3RydWN0b3IubmFtZSxcbiAgICAgIHBhcmFtcyxcbiAgICAgIGhlYWRlcnM6IHRoaXMucmVxdWVzdC5oZWFkZXJzXG4gICAgfSk7XG5cbiAgICBsZXQgcmVzcG9uc2U6IFJlc3BvbnNlO1xuICAgIHRyeSB7XG4gICAgICBkZWJ1ZyhgWyR7IHRoaXMucmVxdWVzdC5pZCB9XTogcnVubmluZyBiZWZvcmUgZmlsdGVyc2ApO1xuICAgICAgYXdhaXQgdGhpcy5faW52b2tlRmlsdGVycyhiZWZvcmVDaGFpbiwgcGFyYW1zLCB0cnVlKTtcbiAgICAgIGRlYnVnKGBbJHsgdGhpcy5yZXF1ZXN0LmlkIH1dOiBydW5uaW5nIHJlc3BvbmRlcmApO1xuICAgICAgbGV0IHJlc3VsdCA9IGF3YWl0IHJlc3BvbmQocGFyYW1zKTtcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgcmVuZGVyKHJlc3VsdCk7XG4gICAgICBkZWJ1ZyhgWyR7IHRoaXMucmVxdWVzdC5pZCB9XTogcnVubmluZyBhZnRlciBmaWx0ZXJzYCk7XG4gICAgICBhd2FpdCB0aGlzLl9pbnZva2VGaWx0ZXJzKGFmdGVyQ2hhaW4sIHBhcmFtcywgZmFsc2UpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBQcmVlbXB0aXZlUmVuZGVyKSB7XG4gICAgICAgIHJlc3BvbnNlID0gZXJyb3IucmVzcG9uc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaW5zdHJ1bWVudGF0aW9uLmZpbmlzaCgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUgYmVzdCByZXNwb25kZXIgbWV0aG9kIGZvciB0aGUgaW5jb21pbmcgcmVxdWVzdCwgZ2l2ZW4gdGhlIGluY29taW5nIHJlcXVlc3QncyBBY2NlcHRcbiAgICogaGVhZGVyLlxuICAgKlxuICAgKiBJZiB0aGUgQWNjZXB0IGhlYWRlciBpcyBcIkFjY2VwdDogKiAvICpcIiwgdGhlbiB0aGUgZ2VuZXJpYyBgcmVzcG9uZCgpYCBtZXRob2QgaXMgc2VsZWN0ZWQuXG4gICAqIE90aGVyd2lzZSwgYXR0ZW1wdCB0byBmaW5kIHRoZSBiZXN0IHJlc3BvbmRlciBtZXRob2QgYmFzZWQgb24gdGhlIG1pbWUgdHlwZXMuXG4gICAqL1xuICBwdWJsaWMgX3BpY2tCZXN0UmVzcG9uZGVyKCk6IFJlc3BvbmRlciB7XG4gICAgbGV0IHJlc3BvbmRlcjogUmVzcG9uZGVyID0gdGhpcy5yZXNwb25kO1xuICAgIGxldCBiZXN0Rm9ybWF0O1xuICAgIGFzc2VydCh0eXBlb2YgcmVzcG9uZGVyID09PSAnZnVuY3Rpb24nLCBgWW91ciAnJHsgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lIH0nIGFjdGlvbiBtdXN0IGRlZmluZSBhIHJlc3BvbmQgbWV0aG9kLmApO1xuICAgIGlmICh0aGlzLnJlcXVlc3QuZ2V0KCdhY2NlcHQnKSAhPT0gJyovKicpIHtcbiAgICAgIGxldCBBY3Rpb25DbGFzcyA9IDx0eXBlb2YgQWN0aW9uPnRoaXMuY29uc3RydWN0b3I7XG4gICAgICBsZXQgZm9ybWF0cyA9IEFjdGlvbkNsYXNzLmZvcm1hdHMoKTtcbiAgICAgIGlmIChmb3JtYXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYmVzdEZvcm1hdCA9IHRoaXMucmVxdWVzdC5hY2NlcHRzKGZvcm1hdHMpO1xuICAgICAgICBpZiAoYmVzdEZvcm1hdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3JzLk5vdEFjY2VwdGFibGUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXNwb25kZXIgPSA8UmVzcG9uZGVyPnRoaXNbYHJlc3BvbmRXaXRoJHsgY2FwaXRhbGl6ZSg8c3RyaW5nPmJlc3RGb3JtYXQpIH1gXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbmRlcjtcbiAgfVxuXG4gIFtrZXk6IHN0cmluZ106IGFueTtcblxuICAvKipcbiAgICogVGhlIGRlZmF1bHQgcmVzcG9uZGVyIG1ldGhvZC4gWW91IHNob3VsZCBvdmVycmlkZSB0aGlzIG1ldGhvZCB3aXRoIHdoYXRldmVyIGxvZ2ljIGlzIG5lZWRlZCB0b1xuICAgKiByZXNwb25kIHRvIHRoZSBpbmNvbWluZyByZXF1ZXN0LlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBhYnN0cmFjdCByZXNwb25kKHBhcmFtczogYW55KTogUmVzcG9uc2UgfCB7IFtrZXk6IHN0cmluZ106IGFueSB9IHwgdm9pZDtcblxuICAvKipcbiAgICogQ2FjaGVkIGxpc3Qgb2YgYmVmb3JlIGZpbHRlcnMgdGhhdCBzaG91bGQgYmUgZXhlY3V0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgc3RhdGljIF9iZWZvcmU6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBDYWNoZWQgbGlzdCBvZiBhZnRlciBmaWx0ZXJzIHRoYXQgc2hvdWxkIGJlIGV4ZWN1dGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIHN0YXRpYyBfYWZ0ZXI6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBXYWxrIHRoZSBwcm90b3R5cGUgY2hhaW4gb2YgdGhpcyBBY3Rpb24gaW5zdGFuY2UgdG8gZmluZCBhbGwgdGhlIGBiZWZvcmVgIGFuZCBgYWZ0ZXJgIGFycmF5cyB0b1xuICAgKiBidWlsZCB0aGUgY29tcGxldGUgZmlsdGVyIGNoYWlucy5cbiAgICpcbiAgICogQ2FjaGVzIHRoZSByZXN1bHQgb24gdGhlIGNoaWxkIEFjdGlvbiBjbGFzcyB0byBhdm9pZCB0aGUgcG90ZW50aWFsbHkgZXhwZW5zaXZlIHByb3RvdHlwZSB3YWxrXG4gICAqIG9uIGVhY2ggcmVxdWVzdC5cbiAgICpcbiAgICogVGhyb3dzIGlmIGl0IGVuY291bnRlcnMgdGhlIG5hbWUgb2YgYSBmaWx0ZXIgbWV0aG9kIHRoYXQgZG9lc24ndCBleGlzdC5cbiAgICovXG4gIHByaXZhdGUgX2J1aWxkRmlsdGVyQ2hhaW5zKCk6IHsgYmVmb3JlQ2hhaW46IHN0cmluZ1tdLCBhZnRlckNoYWluOiBzdHJpbmdbXSB9IHtcbiAgICBsZXQgQWN0aW9uQ2xhc3MgPSA8dHlwZW9mIEFjdGlvbj50aGlzLmNvbnN0cnVjdG9yO1xuICAgIGlmICghQWN0aW9uQ2xhc3MuX2JlZm9yZSkge1xuICAgICAgbGV0IHByb3RvdHlwZUNoYWluOiBBY3Rpb25bXSA9IFtdO1xuICAgICAgZWFjaFByb3RvdHlwZShBY3Rpb25DbGFzcywgKHByb3RvdHlwZSkgPT4ge1xuICAgICAgICBwcm90b3R5cGVDaGFpbi5wdXNoKHByb3RvdHlwZSk7XG4gICAgICB9KTtcbiAgICAgIFsgJ2JlZm9yZScsICdhZnRlcicgXS5mb3JFYWNoKChzdGFnZTogJ2JlZm9yZScgfCAnYWZ0ZXInKSA9PiB7XG4gICAgICAgIGxldCBmaWx0ZXJOYW1lcyA9IDxzdHJpbmdbXT5jb21wYWN0KHVuaXEoZmxhdHRlbihtYXAocHJvdG90eXBlQ2hhaW4sIHN0YWdlKSkpKTtcbiAgICAgICAgZmlsdGVyTmFtZXMuZm9yRWFjaCgoZmlsdGVyTmFtZSkgPT4ge1xuICAgICAgICAgIGlmICghdGhpc1tmaWx0ZXJOYW1lXSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAkeyBmaWx0ZXJOYW1lIH0gbWV0aG9kIG5vdCBmb3VuZCBvbiB0aGUgJHsgQWN0aW9uQ2xhc3MubmFtZSB9IGFjdGlvbi5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAoPGFueT5BY3Rpb25DbGFzcylbYF8keyBzdGFnZSB9YF0gPSBmaWx0ZXJOYW1lcztcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgYmVmb3JlQ2hhaW46IEFjdGlvbkNsYXNzLl9iZWZvcmUsXG4gICAgICBhZnRlckNoYWluOiBBY3Rpb25DbGFzcy5fYWZ0ZXJcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEludm9rZXMgdGhlIGZpbHRlcnMgaW4gdGhlIHN1cHBsaWVkIGNoYWluIGluIHNlcXVlbmNlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfaW52b2tlRmlsdGVycyhjaGFpbjogc3RyaW5nW10sIHBhcmFtczogYW55LCBoYWx0YWJsZTogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNoYWluID0gY2hhaW4uc2xpY2UoMCk7XG4gICAgbGV0IEFjdGlvbkNsYXNzID0gPHR5cGVvZiBBY3Rpb24+dGhpcy5jb25zdHJ1Y3RvcjtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IGZpbHRlck5hbWUgPSBjaGFpbi5zaGlmdCgpO1xuICAgICAgbGV0IGZpbHRlciA9IHRoaXNbZmlsdGVyTmFtZV07XG4gICAgICBsZXQgaW5zdHJ1bWVudGF0aW9uID0gSW5zdHJ1bWVudGF0aW9uLmluc3RydW1lbnQoJ2FjdGlvbi5maWx0ZXInLCB7XG4gICAgICAgIGFjdGlvbjogQWN0aW9uQ2xhc3MubmFtZSxcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICBmaWx0ZXI6IGZpbHRlck5hbWUsXG4gICAgICAgIGhlYWRlcnM6IHRoaXMucmVxdWVzdC5oZWFkZXJzXG4gICAgICB9KTtcbiAgICAgIGRlYnVnKGBbJHsgdGhpcy5yZXF1ZXN0LmlkIH1dOiBydW5uaW5nIFxcYCR7IGZpbHRlck5hbWUgfVxcYCBmaWx0ZXJgKTtcbiAgICAgIGxldCBmaWx0ZXJSZXN1bHQgPSBhd2FpdCBmaWx0ZXIuY2FsbCh0aGlzLCBwYXJhbXMpO1xuICAgICAgaWYgKGhhbHRhYmxlICYmIGZpbHRlclJlc3VsdCAhPSBudWxsKSB7XG4gICAgICAgIGRlYnVnKGBbJHsgdGhpcy5yZXF1ZXN0LmlkIH1dOiBcXGAkeyBmaWx0ZXJOYW1lIH1cXGAgcHJlZW1wdGVkIHRoZSBhY3Rpb24sIHJlbmRlcmluZyB0aGUgcmV0dXJuZWQgdmFsdWVgKTtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5yZW5kZXIoZmlsdGVyUmVzdWx0KTtcbiAgICAgICAgdGhyb3cgbmV3IFByZWVtcHRpdmVSZW5kZXIocmVzcG9uc2UpO1xuICAgICAgfVxuICAgICAgaW5zdHJ1bWVudGF0aW9uLmZpbmlzaCgpO1xuICAgIH1cbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IEFjdGlvbjtcbiJdfQ==