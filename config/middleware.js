"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const timing = require("response-time");
const compression = require("compression");
const cookies = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const body_parser_1 = require("body-parser");
/**
 * Denali ships with several base middleware included, each of which can be enabled/disabled
 * individually through config options.
 */
function baseMiddleware(router, application) {
    let config = application.config;
    /**
     * Returns true if the given property either does not exist on the config object, or it does exist
     * and it's `enabled` property is not `false`. All the middleware here are opt out, so to disable
     * you must define set that middleware's root config property to `{ enabled: false }`
     */
    function isEnabled(prop) {
        return !config[prop] || (config[prop] && config[prop].enabled !== false);
    }
    if (isEnabled('timing')) {
        router.use(timing());
    }
    if (isEnabled('logging')) {
        let defaultLoggingFormat = application.environment === 'production' ? 'combined' : 'dev';
        let defaultLoggingOptions = {
            // tslint:disable-next-line:completed-docs
            skip() {
                return application.environment === 'test';
            }
        };
        let format = (config.logging && config.logging.format) || defaultLoggingFormat;
        let options = lodash_1.defaults(config.logging || {}, defaultLoggingOptions);
        router.use(morgan(format, options));
        // Patch morgan to read from our non-express response
        morgan.token('res', (req, res, field) => {
            let header = res.getHeader(field);
            return Array.isArray(header) ? header.join(', ') : header;
        });
    }
    if (isEnabled('compression')) {
        router.use(compression());
    }
    if (isEnabled('cookies')) {
        router.use(cookies(config.cookies));
    }
    if (isEnabled('cors')) {
        router.use(cors(config.cors));
    }
    if (isEnabled('xssFilter')) {
        router.use(helmet.xssFilter());
    }
    if (isEnabled('frameguard')) {
        router.use(helmet.frameguard());
    }
    if (isEnabled('hidePoweredBy')) {
        router.use(helmet.hidePoweredBy());
    }
    if (isEnabled('ieNoOpen')) {
        router.use(helmet.ieNoOpen());
    }
    if (isEnabled('noSniff')) {
        router.use(helmet.noSniff());
    }
    if (isEnabled('bodyParser')) {
        router.use(body_parser_1.json({ type: (config.bodyParser && config.bodyParser.type) || 'application/json' }));
    }
}
exports.default = baseMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJjb25maWcvbWlkZGxld2FyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUdnQjtBQUNoQix3Q0FBd0M7QUFDeEMsMkNBQTJDO0FBQzNDLHlDQUF5QztBQUN6Qyw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBQ2pDLGlDQUFpQztBQUNqQyw2Q0FBbUM7QUFLbkM7OztHQUdHO0FBQ0gsd0JBQXVDLE1BQWMsRUFBRSxXQUF3QjtJQUU3RSxJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO0lBRWhDOzs7O09BSUc7SUFDSCxtQkFBbUIsSUFBWTtRQUM3QixNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsSUFBSSxvQkFBb0IsR0FBRyxXQUFXLENBQUMsV0FBVyxLQUFLLFlBQVksR0FBRyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3pGLElBQUkscUJBQXFCLEdBQUc7WUFDMUIsMENBQTBDO1lBQzFDLElBQUk7Z0JBQ0YsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFDO1lBQzVDLENBQUM7U0FDRixDQUFDO1FBQ0YsSUFBSSxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksb0JBQW9CLENBQUM7UUFDL0UsSUFBSSxPQUFPLEdBQUcsaUJBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRXBDLHFEQUFxRDtRQUNyRCxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQW9CLEVBQUUsR0FBbUIsRUFBRSxLQUFhO1lBQzNFLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUM7UUFDNUQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNsRyxDQUFDO0FBRUgsQ0FBQztBQXhFRCxpQ0F3RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBkZWZhdWx0cyxcbiAgZGVmYXVsdHNEZWVwXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyB0aW1pbmcgZnJvbSAncmVzcG9uc2UtdGltZSc7XG5pbXBvcnQgKiBhcyBjb21wcmVzc2lvbiBmcm9tICdjb21wcmVzc2lvbic7XG5pbXBvcnQgKiBhcyBjb29raWVzIGZyb20gJ2Nvb2tpZS1wYXJzZXInO1xuaW1wb3J0ICogYXMgY29ycyBmcm9tICdjb3JzJztcbmltcG9ydCAqIGFzIGhlbG1ldCBmcm9tICdoZWxtZXQnO1xuaW1wb3J0ICogYXMgbW9yZ2FuIGZyb20gJ21vcmdhbic7XG5pbXBvcnQgeyBqc29uIH0gZnJvbSAnYm9keS1wYXJzZXInO1xuaW1wb3J0IHsgSW5jb21pbmdNZXNzYWdlLCBTZXJ2ZXJSZXNwb25zZSB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IFJvdXRlciBmcm9tICcuLi9saWIvcnVudGltZS9yb3V0ZXInO1xuaW1wb3J0IEFwcGxpY2F0aW9uIGZyb20gJy4uL2xpYi9ydW50aW1lL2FwcGxpY2F0aW9uJztcblxuLyoqXG4gKiBEZW5hbGkgc2hpcHMgd2l0aCBzZXZlcmFsIGJhc2UgbWlkZGxld2FyZSBpbmNsdWRlZCwgZWFjaCBvZiB3aGljaCBjYW4gYmUgZW5hYmxlZC9kaXNhYmxlZFxuICogaW5kaXZpZHVhbGx5IHRocm91Z2ggY29uZmlnIG9wdGlvbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJhc2VNaWRkbGV3YXJlKHJvdXRlcjogUm91dGVyLCBhcHBsaWNhdGlvbjogQXBwbGljYXRpb24pOiB2b2lkIHtcblxuICBsZXQgY29uZmlnID0gYXBwbGljYXRpb24uY29uZmlnO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHByb3BlcnR5IGVpdGhlciBkb2VzIG5vdCBleGlzdCBvbiB0aGUgY29uZmlnIG9iamVjdCwgb3IgaXQgZG9lcyBleGlzdFxuICAgKiBhbmQgaXQncyBgZW5hYmxlZGAgcHJvcGVydHkgaXMgbm90IGBmYWxzZWAuIEFsbCB0aGUgbWlkZGxld2FyZSBoZXJlIGFyZSBvcHQgb3V0LCBzbyB0byBkaXNhYmxlXG4gICAqIHlvdSBtdXN0IGRlZmluZSBzZXQgdGhhdCBtaWRkbGV3YXJlJ3Mgcm9vdCBjb25maWcgcHJvcGVydHkgdG8gYHsgZW5hYmxlZDogZmFsc2UgfWBcbiAgICovXG4gIGZ1bmN0aW9uIGlzRW5hYmxlZChwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIWNvbmZpZ1twcm9wXSB8fCAoY29uZmlnW3Byb3BdICYmIGNvbmZpZ1twcm9wXS5lbmFibGVkICE9PSBmYWxzZSk7XG4gIH1cblxuICBpZiAoaXNFbmFibGVkKCd0aW1pbmcnKSkge1xuICAgIHJvdXRlci51c2UodGltaW5nKCkpO1xuICB9XG5cbiAgaWYgKGlzRW5hYmxlZCgnbG9nZ2luZycpKSB7XG4gICAgbGV0IGRlZmF1bHRMb2dnaW5nRm9ybWF0ID0gYXBwbGljYXRpb24uZW52aXJvbm1lbnQgPT09ICdwcm9kdWN0aW9uJyA/ICdjb21iaW5lZCcgOiAnZGV2JztcbiAgICBsZXQgZGVmYXVsdExvZ2dpbmdPcHRpb25zID0ge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNvbXBsZXRlZC1kb2NzXG4gICAgICBza2lwKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gYXBwbGljYXRpb24uZW52aXJvbm1lbnQgPT09ICd0ZXN0JztcbiAgICAgIH1cbiAgICB9O1xuICAgIGxldCBmb3JtYXQgPSAoY29uZmlnLmxvZ2dpbmcgJiYgY29uZmlnLmxvZ2dpbmcuZm9ybWF0KSB8fCBkZWZhdWx0TG9nZ2luZ0Zvcm1hdDtcbiAgICBsZXQgb3B0aW9ucyA9IGRlZmF1bHRzKGNvbmZpZy5sb2dnaW5nIHx8IHt9LCBkZWZhdWx0TG9nZ2luZ09wdGlvbnMpO1xuICAgIHJvdXRlci51c2UobW9yZ2FuKGZvcm1hdCwgb3B0aW9ucykpO1xuXG4gICAgLy8gUGF0Y2ggbW9yZ2FuIHRvIHJlYWQgZnJvbSBvdXIgbm9uLWV4cHJlc3MgcmVzcG9uc2VcbiAgICBtb3JnYW4udG9rZW4oJ3JlcycsIChyZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSwgZmllbGQ6IHN0cmluZykgPT4ge1xuICAgICAgbGV0IGhlYWRlciA9IHJlcy5nZXRIZWFkZXIoZmllbGQpO1xuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoaGVhZGVyKSA/IGhlYWRlci5qb2luKCcsICcpIDogaGVhZGVyO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKGlzRW5hYmxlZCgnY29tcHJlc3Npb24nKSkge1xuICAgIHJvdXRlci51c2UoY29tcHJlc3Npb24oKSk7XG4gIH1cblxuICBpZiAoaXNFbmFibGVkKCdjb29raWVzJykpIHtcbiAgICByb3V0ZXIudXNlKGNvb2tpZXMoY29uZmlnLmNvb2tpZXMpKTtcbiAgfVxuXG4gIGlmIChpc0VuYWJsZWQoJ2NvcnMnKSkge1xuICAgIHJvdXRlci51c2UoY29ycyhjb25maWcuY29ycykpO1xuICB9XG5cbiAgaWYgKGlzRW5hYmxlZCgneHNzRmlsdGVyJykpIHtcbiAgICByb3V0ZXIudXNlKGhlbG1ldC54c3NGaWx0ZXIoKSk7XG4gIH1cblxuICBpZiAoaXNFbmFibGVkKCdmcmFtZWd1YXJkJykpIHtcbiAgICByb3V0ZXIudXNlKGhlbG1ldC5mcmFtZWd1YXJkKCkpO1xuICB9XG5cbiAgaWYgKGlzRW5hYmxlZCgnaGlkZVBvd2VyZWRCeScpKSB7XG4gICAgcm91dGVyLnVzZShoZWxtZXQuaGlkZVBvd2VyZWRCeSgpKTtcbiAgfVxuXG4gIGlmIChpc0VuYWJsZWQoJ2llTm9PcGVuJykpIHtcbiAgICByb3V0ZXIudXNlKGhlbG1ldC5pZU5vT3BlbigpKTtcbiAgfVxuXG4gIGlmIChpc0VuYWJsZWQoJ25vU25pZmYnKSkge1xuICAgIHJvdXRlci51c2UoaGVsbWV0Lm5vU25pZmYoKSk7XG4gIH1cblxuICBpZiAoaXNFbmFibGVkKCdib2R5UGFyc2VyJykpIHtcbiAgICByb3V0ZXIudXNlKGpzb24oeyB0eXBlOiAoY29uZmlnLmJvZHlQYXJzZXIgJiYgY29uZmlnLmJvZHlQYXJzZXIudHlwZSkgfHwgJ2FwcGxpY2F0aW9uL2pzb24nIH0pKTtcbiAgfVxuXG59XG4iXX0=