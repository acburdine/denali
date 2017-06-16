"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert = require("assert");
const action_1 = require("../../lib/runtime/action");
const flat_1 = require("../../lib/parse/flat");
const inject_1 = require("../../lib/metal/inject");
/**
 * The default error action. When Denali encounters an error while processing a request, it will
 * attempt to hand off that error to the `error` action, which can determine how to respond. This is
 * a good spot to do things like report the error to an error-tracking service, sanitize the error
 * response based on environment (i.e. a full stack trace in dev, but limited info in prod), etc.
 *
 * @export
 * @class ErrorAction
 * @extends {Action}
 */
class ErrorAction extends action_1.default {
    constructor() {
        super(...arguments);
        this.logger = inject_1.default('app:logger');
        this.parser = new flat_1.default();
    }
    get originalAction() {
        return this.request._originalAction;
    }
    /**
     * Respond with JSON by default
     */
    respond({ params }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let error = params.error;
            assert(error, 'Error action must be invoked with an error as a param');
            // Print the error to the logs
            if ((!error.status || error.status >= 500) && this.config.environment !== 'test') {
                this.logger.error(`Request ${this.request.id} errored:\n${error.stack || error.message}`);
            }
            // Ensure a default status code of 500
            error.status = error.statusCode = error.statusCode || 500;
            // If debugging info is allowed, attach some debugging info to standard
            // locations.
            if (this.config.logging && this.config.logging.showDebuggingInfo) {
                error.meta = {
                    stack: error.stack,
                    action: this.originalAction
                };
                // Otherwise, sanitize the output
            }
            else {
                if (error.statusCode === 500) {
                    error.message = 'Internal Error';
                }
                delete error.stack;
            }
            if (this.request.accepts(['html']) && this.container.lookup('config:environment').environment !== 'production') {
                this.render(error.status, error, { view: 'error.html' });
            }
            else {
                this.render(error.status, error);
            }
        });
    }
}
exports.default = ErrorAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsiYXBwL2FjdGlvbnMvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQWlDO0FBQ2pDLHFEQUE4QztBQUU5QywrQ0FBOEM7QUFDOUMsbURBQTRDO0FBRTVDOzs7Ozs7Ozs7R0FTRztBQUNILGlCQUFpQyxTQUFRLGdCQUFNO0lBQS9DOztRQU1FLFdBQU0sR0FBRyxnQkFBTSxDQUFTLFlBQVksQ0FBQyxDQUFDO1FBQ3RDLFdBQU0sR0FBRyxJQUFJLGNBQVUsRUFBRSxDQUFDO0lBbUM1QixDQUFDO0lBeENDLElBQUksY0FBYztRQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7SUFDdEMsQ0FBQztJQUtEOztPQUVHO0lBQ0csT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFPOztZQUMzQixJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsdURBQXVELENBQUMsQ0FBQztZQUN2RSw4QkFBOEI7WUFDOUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNqRixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRyxjQUFlLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE9BQVEsRUFBRSxDQUFDLENBQUM7WUFDaEcsQ0FBQztZQUNELHNDQUFzQztZQUN0QyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsSUFBSSxHQUFHLENBQUM7WUFDMUQsdUVBQXVFO1lBQ3ZFLGFBQWE7WUFDYixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pFLEtBQUssQ0FBQyxJQUFJLEdBQUc7b0JBQ1gsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO29CQUNsQixNQUFNLEVBQUUsSUFBSSxDQUFDLGNBQWM7aUJBQzVCLENBQUM7Z0JBQ0osaUNBQWlDO1lBQ2pDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLEtBQUssQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUM7Z0JBQ25DLENBQUM7Z0JBQ0QsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQ3JCLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFFLE1BQU0sQ0FBRSxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxXQUFXLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDakgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1lBQzNELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkMsQ0FBQztRQUNILENBQUM7S0FBQTtDQUVGO0FBMUNELDhCQTBDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IEFjdGlvbiBmcm9tICcuLi8uLi9saWIvcnVudGltZS9hY3Rpb24nO1xuaW1wb3J0IExvZ2dlciBmcm9tICcuLi8uLi9saWIvcnVudGltZS9sb2dnZXInO1xuaW1wb3J0IEZsYXRQYXJzZXIgZnJvbSAnLi4vLi4vbGliL3BhcnNlL2ZsYXQnO1xuaW1wb3J0IGluamVjdCBmcm9tICcuLi8uLi9saWIvbWV0YWwvaW5qZWN0JztcblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBlcnJvciBhY3Rpb24uIFdoZW4gRGVuYWxpIGVuY291bnRlcnMgYW4gZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBhIHJlcXVlc3QsIGl0IHdpbGxcbiAqIGF0dGVtcHQgdG8gaGFuZCBvZmYgdGhhdCBlcnJvciB0byB0aGUgYGVycm9yYCBhY3Rpb24sIHdoaWNoIGNhbiBkZXRlcm1pbmUgaG93IHRvIHJlc3BvbmQuIFRoaXMgaXNcbiAqIGEgZ29vZCBzcG90IHRvIGRvIHRoaW5ncyBsaWtlIHJlcG9ydCB0aGUgZXJyb3IgdG8gYW4gZXJyb3ItdHJhY2tpbmcgc2VydmljZSwgc2FuaXRpemUgdGhlIGVycm9yXG4gKiByZXNwb25zZSBiYXNlZCBvbiBlbnZpcm9ubWVudCAoaS5lLiBhIGZ1bGwgc3RhY2sgdHJhY2UgaW4gZGV2LCBidXQgbGltaXRlZCBpbmZvIGluIHByb2QpLCBldGMuXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIEVycm9yQWN0aW9uXG4gKiBAZXh0ZW5kcyB7QWN0aW9ufVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvckFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG5cbiAgZ2V0IG9yaWdpbmFsQWN0aW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdC5fb3JpZ2luYWxBY3Rpb247XG4gIH1cblxuICBsb2dnZXIgPSBpbmplY3Q8TG9nZ2VyPignYXBwOmxvZ2dlcicpO1xuICBwYXJzZXIgPSBuZXcgRmxhdFBhcnNlcigpO1xuXG4gIC8qKlxuICAgKiBSZXNwb25kIHdpdGggSlNPTiBieSBkZWZhdWx0XG4gICAqL1xuICBhc3luYyByZXNwb25kKHsgcGFyYW1zIH06IGFueSkge1xuICAgIGxldCBlcnJvciA9IHBhcmFtcy5lcnJvcjtcbiAgICBhc3NlcnQoZXJyb3IsICdFcnJvciBhY3Rpb24gbXVzdCBiZSBpbnZva2VkIHdpdGggYW4gZXJyb3IgYXMgYSBwYXJhbScpO1xuICAgIC8vIFByaW50IHRoZSBlcnJvciB0byB0aGUgbG9nc1xuICAgIGlmICgoIWVycm9yLnN0YXR1cyB8fCBlcnJvci5zdGF0dXMgPj0gNTAwKSAmJiB0aGlzLmNvbmZpZy5lbnZpcm9ubWVudCAhPT0gJ3Rlc3QnKSB7XG4gICAgICB0aGlzLmxvZ2dlci5lcnJvcihgUmVxdWVzdCAkeyB0aGlzLnJlcXVlc3QuaWQgfSBlcnJvcmVkOlxcbiR7IGVycm9yLnN0YWNrIHx8IGVycm9yLm1lc3NhZ2UgfWApO1xuICAgIH1cbiAgICAvLyBFbnN1cmUgYSBkZWZhdWx0IHN0YXR1cyBjb2RlIG9mIDUwMFxuICAgIGVycm9yLnN0YXR1cyA9IGVycm9yLnN0YXR1c0NvZGUgPSBlcnJvci5zdGF0dXNDb2RlIHx8IDUwMDtcbiAgICAvLyBJZiBkZWJ1Z2dpbmcgaW5mbyBpcyBhbGxvd2VkLCBhdHRhY2ggc29tZSBkZWJ1Z2dpbmcgaW5mbyB0byBzdGFuZGFyZFxuICAgIC8vIGxvY2F0aW9ucy5cbiAgICBpZiAodGhpcy5jb25maWcubG9nZ2luZyAmJiB0aGlzLmNvbmZpZy5sb2dnaW5nLnNob3dEZWJ1Z2dpbmdJbmZvKSB7XG4gICAgICBlcnJvci5tZXRhID0ge1xuICAgICAgICBzdGFjazogZXJyb3Iuc3RhY2ssXG4gICAgICAgIGFjdGlvbjogdGhpcy5vcmlnaW5hbEFjdGlvblxuICAgICAgfTtcbiAgICAvLyBPdGhlcndpc2UsIHNhbml0aXplIHRoZSBvdXRwdXRcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGVycm9yLnN0YXR1c0NvZGUgPT09IDUwMCkge1xuICAgICAgICBlcnJvci5tZXNzYWdlID0gJ0ludGVybmFsIEVycm9yJztcbiAgICAgIH1cbiAgICAgIGRlbGV0ZSBlcnJvci5zdGFjaztcbiAgICB9XG4gICAgaWYgKHRoaXMucmVxdWVzdC5hY2NlcHRzKFsgJ2h0bWwnIF0pICYmIHRoaXMuY29udGFpbmVyLmxvb2t1cCgnY29uZmlnOmVudmlyb25tZW50JykuZW52aXJvbm1lbnQgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgdGhpcy5yZW5kZXIoZXJyb3Iuc3RhdHVzLCBlcnJvciwgeyB2aWV3OiAnZXJyb3IuaHRtbCcgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVuZGVyKGVycm9yLnN0YXR1cywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=