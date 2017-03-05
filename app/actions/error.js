"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const action_1 = require("../../lib/runtime/action");
const response_1 = require("../../lib/runtime/response");
const fs = require("fs-extra");
const path = require("path");
const lodash_1 = require("lodash");
const createDebug = require("debug");
const assert = require("assert");
const debug = createDebug('denali:app:error-action');
const errorHTML = fs.readFileSync(path.join(__dirname, '..', 'assets', 'error.html'), 'utf-8');
const errorHTMLTemplate = lodash_1.template(errorHTML, { variable: 'data' });
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
    get originalAction() {
        return this.request._originalAction;
    }
    /**
     * Respond with JSON by default
     */
    respond(params) {
        return this.respondWithJson(params);
    }
    /**
     * Render an HTML template with the error details
     */
    respondWithHtml(params) {
        let response = this.prepareError(params.error);
        let html = errorHTMLTemplate({ error: response.body });
        return new response_1.default(response.status || 500, html, { contentType: 'text/html', raw: true });
    }
    /**
     * Render the error details as a JSON payload
     */
    respondWithJson(params) {
        debug('Client requested JSON, preparing error as JSON payload');
        return this.prepareError(params.error);
    }
    /**
     * Prepare the error for rendering. Santize the details of the error in production.
     */
    prepareError(error) {
        assert(error, 'Error action must be invoked with an error as a param');
        if (this.config.environment !== 'test') {
            this.logger.error(error.stack || error.message);
        }
        // Ensure a default status code of 500
        error.status = error.statusCode = error.statusCode || 500;
        // If debugging info is allowed, attach some debugging info to standard
        // locations.
        if (this.includeDebugInfo()) {
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
        debug('Error prepared: %o', error);
        return new response_1.default(error.status || 500, error, { raw: true });
    }
    /**
     * Should the response include details about the error (i.e. a full stack trace)?
     */
    includeDebugInfo() {
        return this.config.logging && this.config.logging.showDebuggingInfo;
    }
}
exports.default = ErrorAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYXBwL2FjdGlvbnMvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUU7QUFDakUseURBQWtEO0FBQ2xELCtCQUErQjtBQUMvQiw2QkFBNkI7QUFDN0IsbUNBRWdCO0FBQ2hCLHFDQUFxQztBQUNyQyxpQ0FBaUM7QUFFakMsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFFckQsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQy9GLE1BQU0saUJBQWlCLEdBQUcsaUJBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUVwRTs7Ozs7Ozs7O0dBU0c7QUFDSCxpQkFBaUMsU0FBUSxnQkFBTTtJQUU3QyxJQUFJLGNBQWM7UUFDaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7T0FFRztJQUNJLE9BQU8sQ0FBQyxNQUFXO1FBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7T0FFRztJQUNJLGVBQWUsQ0FBQyxNQUFXO1FBQ2hDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9DLElBQUksSUFBSSxHQUFHLGlCQUFpQixDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sQ0FBQyxJQUFJLGtCQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM3RixDQUFDO0lBRUQ7O09BRUc7SUFDSSxlQUFlLENBQUMsTUFBVztRQUNoQyxLQUFLLENBQUMsd0RBQXdELENBQUMsQ0FBQztRQUNoRSxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVEOztPQUVHO0lBQ08sWUFBWSxDQUFDLEtBQVU7UUFDL0IsTUFBTSxDQUFDLEtBQUssRUFBRSx1REFBdUQsQ0FBQyxDQUFDO1FBQ3ZFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUNELHNDQUFzQztRQUN0QyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsSUFBSSxHQUFHLENBQUM7UUFDMUQsdUVBQXVFO1FBQ3ZFLGFBQWE7UUFDYixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUIsS0FBSyxDQUFDLElBQUksR0FBRztnQkFDWCxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7Z0JBQ2xCLE1BQU0sRUFBRSxJQUFJLENBQUMsY0FBYzthQUM1QixDQUFDO1lBQ0osaUNBQWlDO1FBQ2pDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsS0FBSyxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQztZQUNuQyxDQUFDO1lBQ0QsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ3JCLENBQUM7UUFDRCxLQUFLLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLElBQUksa0JBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQ7O09BRUc7SUFDTyxnQkFBZ0I7UUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO0lBQ3RFLENBQUM7Q0FFRjtBQWpFRCw4QkFpRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQWN0aW9uLCB7IEFjdGlvbk9wdGlvbnMgfSBmcm9tICcuLi8uLi9saWIvcnVudGltZS9hY3Rpb24nO1xuaW1wb3J0IFJlc3BvbnNlIGZyb20gJy4uLy4uL2xpYi9ydW50aW1lL3Jlc3BvbnNlJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge1xuICB0ZW1wbGF0ZVxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RlbmFsaTphcHA6ZXJyb3ItYWN0aW9uJyk7XG5cbmNvbnN0IGVycm9ySFRNTCA9IGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnYXNzZXRzJywgJ2Vycm9yLmh0bWwnKSwgJ3V0Zi04Jyk7XG5jb25zdCBlcnJvckhUTUxUZW1wbGF0ZSA9IHRlbXBsYXRlKGVycm9ySFRNTCwgeyB2YXJpYWJsZTogJ2RhdGEnIH0pO1xuXG4vKipcbiAqIFRoZSBkZWZhdWx0IGVycm9yIGFjdGlvbi4gV2hlbiBEZW5hbGkgZW5jb3VudGVycyBhbiBlcnJvciB3aGlsZSBwcm9jZXNzaW5nIGEgcmVxdWVzdCwgaXQgd2lsbFxuICogYXR0ZW1wdCB0byBoYW5kIG9mZiB0aGF0IGVycm9yIHRvIHRoZSBgZXJyb3JgIGFjdGlvbiwgd2hpY2ggY2FuIGRldGVybWluZSBob3cgdG8gcmVzcG9uZC4gVGhpcyBpc1xuICogYSBnb29kIHNwb3QgdG8gZG8gdGhpbmdzIGxpa2UgcmVwb3J0IHRoZSBlcnJvciB0byBhbiBlcnJvci10cmFja2luZyBzZXJ2aWNlLCBzYW5pdGl6ZSB0aGUgZXJyb3JcbiAqIHJlc3BvbnNlIGJhc2VkIG9uIGVudmlyb25tZW50IChpLmUuIGEgZnVsbCBzdGFjayB0cmFjZSBpbiBkZXYsIGJ1dCBsaW1pdGVkIGluZm8gaW4gcHJvZCksIGV0Yy5cbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgRXJyb3JBY3Rpb25cbiAqIEBleHRlbmRzIHtBY3Rpb259XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yQWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcblxuICBnZXQgb3JpZ2luYWxBY3Rpb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0Ll9vcmlnaW5hbEFjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNwb25kIHdpdGggSlNPTiBieSBkZWZhdWx0XG4gICAqL1xuICBwdWJsaWMgcmVzcG9uZChwYXJhbXM6IGFueSk6IFJlc3BvbnNlIHtcbiAgICByZXR1cm4gdGhpcy5yZXNwb25kV2l0aEpzb24ocGFyYW1zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgYW4gSFRNTCB0ZW1wbGF0ZSB3aXRoIHRoZSBlcnJvciBkZXRhaWxzXG4gICAqL1xuICBwdWJsaWMgcmVzcG9uZFdpdGhIdG1sKHBhcmFtczogYW55KTogUmVzcG9uc2Uge1xuICAgIGxldCByZXNwb25zZSA9IHRoaXMucHJlcGFyZUVycm9yKHBhcmFtcy5lcnJvcik7XG4gICAgbGV0IGh0bWwgPSBlcnJvckhUTUxUZW1wbGF0ZSh7IGVycm9yOiByZXNwb25zZS5ib2R5IH0pO1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UocmVzcG9uc2Uuc3RhdHVzIHx8IDUwMCwgaHRtbCwgeyBjb250ZW50VHlwZTogJ3RleHQvaHRtbCcsIHJhdzogdHJ1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIGVycm9yIGRldGFpbHMgYXMgYSBKU09OIHBheWxvYWRcbiAgICovXG4gIHB1YmxpYyByZXNwb25kV2l0aEpzb24ocGFyYW1zOiBhbnkpOiBSZXNwb25zZSB7XG4gICAgZGVidWcoJ0NsaWVudCByZXF1ZXN0ZWQgSlNPTiwgcHJlcGFyaW5nIGVycm9yIGFzIEpTT04gcGF5bG9hZCcpO1xuICAgIHJldHVybiB0aGlzLnByZXBhcmVFcnJvcihwYXJhbXMuZXJyb3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBhcmUgdGhlIGVycm9yIGZvciByZW5kZXJpbmcuIFNhbnRpemUgdGhlIGRldGFpbHMgb2YgdGhlIGVycm9yIGluIHByb2R1Y3Rpb24uXG4gICAqL1xuICBwcm90ZWN0ZWQgcHJlcGFyZUVycm9yKGVycm9yOiBhbnkpOiBSZXNwb25zZSB7XG4gICAgYXNzZXJ0KGVycm9yLCAnRXJyb3IgYWN0aW9uIG11c3QgYmUgaW52b2tlZCB3aXRoIGFuIGVycm9yIGFzIGEgcGFyYW0nKTtcbiAgICBpZiAodGhpcy5jb25maWcuZW52aXJvbm1lbnQgIT09ICd0ZXN0Jykge1xuICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoZXJyb3Iuc3RhY2sgfHwgZXJyb3IubWVzc2FnZSk7XG4gICAgfVxuICAgIC8vIEVuc3VyZSBhIGRlZmF1bHQgc3RhdHVzIGNvZGUgb2YgNTAwXG4gICAgZXJyb3Iuc3RhdHVzID0gZXJyb3Iuc3RhdHVzQ29kZSA9IGVycm9yLnN0YXR1c0NvZGUgfHwgNTAwO1xuICAgIC8vIElmIGRlYnVnZ2luZyBpbmZvIGlzIGFsbG93ZWQsIGF0dGFjaCBzb21lIGRlYnVnZ2luZyBpbmZvIHRvIHN0YW5kYXJkXG4gICAgLy8gbG9jYXRpb25zLlxuICAgIGlmICh0aGlzLmluY2x1ZGVEZWJ1Z0luZm8oKSkge1xuICAgICAgZXJyb3IubWV0YSA9IHtcbiAgICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgICBhY3Rpb246IHRoaXMub3JpZ2luYWxBY3Rpb25cbiAgICAgIH07XG4gICAgLy8gT3RoZXJ3aXNlLCBzYW5pdGl6ZSB0aGUgb3V0cHV0XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChlcnJvci5zdGF0dXNDb2RlID09PSA1MDApIHtcbiAgICAgICAgZXJyb3IubWVzc2FnZSA9ICdJbnRlcm5hbCBFcnJvcic7XG4gICAgICB9XG4gICAgICBkZWxldGUgZXJyb3Iuc3RhY2s7XG4gICAgfVxuICAgIGRlYnVnKCdFcnJvciBwcmVwYXJlZDogJW8nLCBlcnJvcik7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShlcnJvci5zdGF0dXMgfHwgNTAwLCBlcnJvciwgeyByYXc6IHRydWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2hvdWxkIHRoZSByZXNwb25zZSBpbmNsdWRlIGRldGFpbHMgYWJvdXQgdGhlIGVycm9yIChpLmUuIGEgZnVsbCBzdGFjayB0cmFjZSk/XG4gICAqL1xuICBwcm90ZWN0ZWQgaW5jbHVkZURlYnVnSW5mbygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcubG9nZ2luZyAmJiB0aGlzLmNvbmZpZy5sb2dnaW5nLnNob3dEZWJ1Z2dpbmdJbmZvO1xuICB9XG5cbn1cbiJdfQ==