"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert = require("assert");
const action_1 = require("../../lib/runtime/action");
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
        this.parser = inject_1.default('parser:flat');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYXBwL2FjdGlvbnMvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQWlDO0FBQ2pDLHFEQUE4QztBQUc5QyxtREFBNEM7QUFFNUM7Ozs7Ozs7OztHQVNHO0FBQ0gsaUJBQWlDLFNBQVEsZ0JBQU07SUFBL0M7O1FBTUUsV0FBTSxHQUFHLGdCQUFNLENBQVMsWUFBWSxDQUFDLENBQUM7UUFDdEMsV0FBTSxHQUFHLGdCQUFNLENBQWEsYUFBYSxDQUFDLENBQUM7SUFtQzdDLENBQUM7SUF4Q0MsSUFBSSxjQUFjO1FBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQztJQUN0QyxDQUFDO0lBS0Q7O09BRUc7SUFDRyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQU87O1lBQzNCLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDekIsTUFBTSxDQUFDLEtBQUssRUFBRSx1REFBdUQsQ0FBQyxDQUFDO1lBQ3ZFLDhCQUE4QjtZQUM5QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2pGLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVksSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFHLGNBQWUsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsT0FBUSxFQUFFLENBQUMsQ0FBQztZQUNoRyxDQUFDO1lBQ0Qsc0NBQXNDO1lBQ3RDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxJQUFJLEdBQUcsQ0FBQztZQUMxRCx1RUFBdUU7WUFDdkUsYUFBYTtZQUNiLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDakUsS0FBSyxDQUFDLElBQUksR0FBRztvQkFDWCxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7b0JBQ2xCLE1BQU0sRUFBRSxJQUFJLENBQUMsY0FBYztpQkFDNUIsQ0FBQztnQkFDSixpQ0FBaUM7WUFDakMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsS0FBSyxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQztnQkFDbkMsQ0FBQztnQkFDRCxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDckIsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUUsTUFBTSxDQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLFdBQVcsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNqSCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDM0QsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuQyxDQUFDO1FBQ0gsQ0FBQztLQUFBO0NBRUY7QUExQ0QsOEJBMENDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgQWN0aW9uIGZyb20gJy4uLy4uL2xpYi9ydW50aW1lL2FjdGlvbic7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4uLy4uL2xpYi9ydW50aW1lL2xvZ2dlcic7XG5pbXBvcnQgRmxhdFBhcnNlciBmcm9tICcuLi8uLi9saWIvcGFyc2UvZmxhdCc7XG5pbXBvcnQgaW5qZWN0IGZyb20gJy4uLy4uL2xpYi9tZXRhbC9pbmplY3QnO1xuXG4vKipcbiAqIFRoZSBkZWZhdWx0IGVycm9yIGFjdGlvbi4gV2hlbiBEZW5hbGkgZW5jb3VudGVycyBhbiBlcnJvciB3aGlsZSBwcm9jZXNzaW5nIGEgcmVxdWVzdCwgaXQgd2lsbFxuICogYXR0ZW1wdCB0byBoYW5kIG9mZiB0aGF0IGVycm9yIHRvIHRoZSBgZXJyb3JgIGFjdGlvbiwgd2hpY2ggY2FuIGRldGVybWluZSBob3cgdG8gcmVzcG9uZC4gVGhpcyBpc1xuICogYSBnb29kIHNwb3QgdG8gZG8gdGhpbmdzIGxpa2UgcmVwb3J0IHRoZSBlcnJvciB0byBhbiBlcnJvci10cmFja2luZyBzZXJ2aWNlLCBzYW5pdGl6ZSB0aGUgZXJyb3JcbiAqIHJlc3BvbnNlIGJhc2VkIG9uIGVudmlyb25tZW50IChpLmUuIGEgZnVsbCBzdGFjayB0cmFjZSBpbiBkZXYsIGJ1dCBsaW1pdGVkIGluZm8gaW4gcHJvZCksIGV0Yy5cbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgRXJyb3JBY3Rpb25cbiAqIEBleHRlbmRzIHtBY3Rpb259XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yQWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcblxuICBnZXQgb3JpZ2luYWxBY3Rpb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0Ll9vcmlnaW5hbEFjdGlvbjtcbiAgfVxuXG4gIGxvZ2dlciA9IGluamVjdDxMb2dnZXI+KCdhcHA6bG9nZ2VyJyk7XG4gIHBhcnNlciA9IGluamVjdDxGbGF0UGFyc2VyPigncGFyc2VyOmZsYXQnKTtcblxuICAvKipcbiAgICogUmVzcG9uZCB3aXRoIEpTT04gYnkgZGVmYXVsdFxuICAgKi9cbiAgYXN5bmMgcmVzcG9uZCh7IHBhcmFtcyB9OiBhbnkpIHtcbiAgICBsZXQgZXJyb3IgPSBwYXJhbXMuZXJyb3I7XG4gICAgYXNzZXJ0KGVycm9yLCAnRXJyb3IgYWN0aW9uIG11c3QgYmUgaW52b2tlZCB3aXRoIGFuIGVycm9yIGFzIGEgcGFyYW0nKTtcbiAgICAvLyBQcmludCB0aGUgZXJyb3IgdG8gdGhlIGxvZ3NcbiAgICBpZiAoKCFlcnJvci5zdGF0dXMgfHwgZXJyb3Iuc3RhdHVzID49IDUwMCkgJiYgdGhpcy5jb25maWcuZW52aXJvbm1lbnQgIT09ICd0ZXN0Jykge1xuICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoYFJlcXVlc3QgJHsgdGhpcy5yZXF1ZXN0LmlkIH0gZXJyb3JlZDpcXG4keyBlcnJvci5zdGFjayB8fCBlcnJvci5tZXNzYWdlIH1gKTtcbiAgICB9XG4gICAgLy8gRW5zdXJlIGEgZGVmYXVsdCBzdGF0dXMgY29kZSBvZiA1MDBcbiAgICBlcnJvci5zdGF0dXMgPSBlcnJvci5zdGF0dXNDb2RlID0gZXJyb3Iuc3RhdHVzQ29kZSB8fCA1MDA7XG4gICAgLy8gSWYgZGVidWdnaW5nIGluZm8gaXMgYWxsb3dlZCwgYXR0YWNoIHNvbWUgZGVidWdnaW5nIGluZm8gdG8gc3RhbmRhcmRcbiAgICAvLyBsb2NhdGlvbnMuXG4gICAgaWYgKHRoaXMuY29uZmlnLmxvZ2dpbmcgJiYgdGhpcy5jb25maWcubG9nZ2luZy5zaG93RGVidWdnaW5nSW5mbykge1xuICAgICAgZXJyb3IubWV0YSA9IHtcbiAgICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgICBhY3Rpb246IHRoaXMub3JpZ2luYWxBY3Rpb25cbiAgICAgIH07XG4gICAgLy8gT3RoZXJ3aXNlLCBzYW5pdGl6ZSB0aGUgb3V0cHV0XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChlcnJvci5zdGF0dXNDb2RlID09PSA1MDApIHtcbiAgICAgICAgZXJyb3IubWVzc2FnZSA9ICdJbnRlcm5hbCBFcnJvcic7XG4gICAgICB9XG4gICAgICBkZWxldGUgZXJyb3Iuc3RhY2s7XG4gICAgfVxuICAgIGlmICh0aGlzLnJlcXVlc3QuYWNjZXB0cyhbICdodG1sJyBdKSAmJiB0aGlzLmNvbnRhaW5lci5sb29rdXAoJ2NvbmZpZzplbnZpcm9ubWVudCcpLmVudmlyb25tZW50ICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIHRoaXMucmVuZGVyKGVycm9yLnN0YXR1cywgZXJyb3IsIHsgdmlldzogJ2Vycm9yLmh0bWwnIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbmRlcihlcnJvci5zdGF0dXMsIGVycm9yKTtcbiAgICB9XG4gIH1cblxufVxuIl19