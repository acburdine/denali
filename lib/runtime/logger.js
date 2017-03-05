"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const chalk = require("chalk");
const object_1 = require("../metal/object");
/**
 * A simple Logger class that adds timestamps and supports multiple levels of logging, colorized
 * output, and control over verbosity.
 *
 * @package runtime
 * @since 0.1.0
 */
class Logger extends object_1.default {
    constructor() {
        super(...arguments);
        /**
         * Default log level if none specified.
         *
         * @since 0.1.0
         */
        this.loglevel = 'info';
        /**
         * Specify if logs should be colorized.
         *
         * @since 0.1.0
         */
        this.colorize = true;
        /**
         * Available log levels that can be used.
         */
        this.levels = [
            'info',
            'warn',
            'error'
        ];
        /**
         * Color map for the available levels.
         */
        this.colors = {
            info: chalk.white,
            warn: chalk.yellow,
            error: chalk.red
        };
    }
    /**
     * Log at the 'info' level.
     *
     * @since 0.1.0
     */
    info(msg) {
        this.log('info', msg);
    }
    /**
     * Log at the 'warn' level.
     *
     * @since 0.1.0
     */
    warn(msg) {
        this.log('warn', msg);
    }
    /**
     * Log at the 'error' level.
     *
     * @since 0.1.0
     */
    error(msg) {
        this.log('error', msg);
    }
    /**
     * Log a message to the logger at a specific log level.
     */
    log(level, msg) {
        if (this.levels.indexOf(level) === -1) {
            level = this.loglevel;
        }
        let timestamp = (new Date()).toISOString();
        let padLength = this.levels.reduce((n, label) => Math.max(n, label.length), null);
        let levelLabel = lodash_1.padStart(level.toUpperCase(), padLength);
        if (this.colorize) {
            let colorizer = this.colors[level] || lodash_1.identity;
            msg = colorizer(msg);
            levelLabel = colorizer(levelLabel);
        }
        /* tslint:disable:no-console */
        console.log(`[${timestamp}] ${levelLabel} - ${msg}`);
        /* tslint:enable:no-console */
    }
}
exports.default = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9ydW50aW1lL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUdnQjtBQUNoQiwrQkFBK0I7QUFDL0IsNENBQTJDO0FBSTNDOzs7Ozs7R0FNRztBQUNILFlBQTRCLFNBQVEsZ0JBQVk7SUFBaEQ7O1FBRUU7Ozs7V0FJRztRQUNJLGFBQVEsR0FBYSxNQUFNLENBQUM7UUFFbkM7Ozs7V0FJRztRQUNJLGFBQVEsR0FBRyxJQUFJLENBQUM7UUFFdkI7O1dBRUc7UUFDSSxXQUFNLEdBQWU7WUFDMUIsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPO1NBQ1IsQ0FBQztRQUVGOztXQUVHO1FBQ0ksV0FBTSxHQUEwQztZQUNyRCxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUs7WUFDakIsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQ2xCLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRztTQUNqQixDQUFDO0lBaURKLENBQUM7SUEvQ0M7Ozs7T0FJRztJQUNJLElBQUksQ0FBQyxHQUFRO1FBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksSUFBSSxDQUFDLEdBQVE7UUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxLQUFLLENBQUMsR0FBUTtRQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQ7O09BRUc7SUFDSSxHQUFHLENBQUMsS0FBZSxFQUFFLEdBQVE7UUFDbEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3hCLENBQUM7UUFDRCxJQUFJLFNBQVMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQVMsRUFBRSxLQUFLLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFGLElBQUksVUFBVSxHQUFHLGlCQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzFELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksaUJBQVEsQ0FBQztZQUMvQyxHQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUNELCtCQUErQjtRQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUssU0FBVSxLQUFNLFVBQVcsTUFBTyxHQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzNELDhCQUE4QjtJQUNoQyxDQUFDO0NBRUY7QUFqRkQseUJBaUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaWRlbnRpdHksXG4gIHBhZFN0YXJ0XG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQgRGVuYWxpT2JqZWN0IGZyb20gJy4uL21ldGFsL29iamVjdCc7XG5cbmV4cG9ydCB0eXBlIExvZ0xldmVsID0gJ2luZm8nIHwgJ3dhcm4nIHwgJ2Vycm9yJztcblxuLyoqXG4gKiBBIHNpbXBsZSBMb2dnZXIgY2xhc3MgdGhhdCBhZGRzIHRpbWVzdGFtcHMgYW5kIHN1cHBvcnRzIG11bHRpcGxlIGxldmVscyBvZiBsb2dnaW5nLCBjb2xvcml6ZWRcbiAqIG91dHB1dCwgYW5kIGNvbnRyb2wgb3ZlciB2ZXJib3NpdHkuXG4gKlxuICogQHBhY2thZ2UgcnVudGltZVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvZ2dlciBleHRlbmRzIERlbmFsaU9iamVjdCB7XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgbG9nIGxldmVsIGlmIG5vbmUgc3BlY2lmaWVkLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBsb2dsZXZlbDogTG9nTGV2ZWwgPSAnaW5mbyc7XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgaWYgbG9ncyBzaG91bGQgYmUgY29sb3JpemVkLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBjb2xvcml6ZSA9IHRydWU7XG5cbiAgLyoqXG4gICAqIEF2YWlsYWJsZSBsb2cgbGV2ZWxzIHRoYXQgY2FuIGJlIHVzZWQuXG4gICAqL1xuICBwdWJsaWMgbGV2ZWxzOiBMb2dMZXZlbFtdID0gW1xuICAgICdpbmZvJyxcbiAgICAnd2FybicsXG4gICAgJ2Vycm9yJ1xuICBdO1xuXG4gIC8qKlxuICAgKiBDb2xvciBtYXAgZm9yIHRoZSBhdmFpbGFibGUgbGV2ZWxzLlxuICAgKi9cbiAgcHVibGljIGNvbG9yczogeyBbbGV2ZWw6IHN0cmluZ106IGNoYWxrLkNoYWxrQ2hhaW4gfSA9IHtcbiAgICBpbmZvOiBjaGFsay53aGl0ZSxcbiAgICB3YXJuOiBjaGFsay55ZWxsb3csXG4gICAgZXJyb3I6IGNoYWxrLnJlZFxuICB9O1xuXG4gIC8qKlxuICAgKiBMb2cgYXQgdGhlICdpbmZvJyBsZXZlbC5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgaW5mbyhtc2c6IGFueSk6IHZvaWQge1xuICAgIHRoaXMubG9nKCdpbmZvJywgbXNnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2cgYXQgdGhlICd3YXJuJyBsZXZlbC5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgd2Fybihtc2c6IGFueSk6IHZvaWQge1xuICAgIHRoaXMubG9nKCd3YXJuJywgbXNnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2cgYXQgdGhlICdlcnJvcicgbGV2ZWwuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIGVycm9yKG1zZzogYW55KTogdm9pZCB7XG4gICAgdGhpcy5sb2coJ2Vycm9yJywgbXNnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2cgYSBtZXNzYWdlIHRvIHRoZSBsb2dnZXIgYXQgYSBzcGVjaWZpYyBsb2cgbGV2ZWwuXG4gICAqL1xuICBwdWJsaWMgbG9nKGxldmVsOiBMb2dMZXZlbCwgbXNnOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5sZXZlbHMuaW5kZXhPZihsZXZlbCkgPT09IC0xKSB7XG4gICAgICBsZXZlbCA9IHRoaXMubG9nbGV2ZWw7XG4gICAgfVxuICAgIGxldCB0aW1lc3RhbXAgPSAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKTtcbiAgICBsZXQgcGFkTGVuZ3RoID0gdGhpcy5sZXZlbHMucmVkdWNlKChuOiBudW1iZXIsIGxhYmVsKSA9PiBNYXRoLm1heChuLCBsYWJlbC5sZW5ndGgpLCBudWxsKTtcbiAgICBsZXQgbGV2ZWxMYWJlbCA9IHBhZFN0YXJ0KGxldmVsLnRvVXBwZXJDYXNlKCksIHBhZExlbmd0aCk7XG4gICAgaWYgKHRoaXMuY29sb3JpemUpIHtcbiAgICAgIGxldCBjb2xvcml6ZXIgPSB0aGlzLmNvbG9yc1tsZXZlbF0gfHwgaWRlbnRpdHk7XG4gICAgICBtc2cgPSBjb2xvcml6ZXIobXNnKTtcbiAgICAgIGxldmVsTGFiZWwgPSBjb2xvcml6ZXIobGV2ZWxMYWJlbCk7XG4gICAgfVxuICAgIC8qIHRzbGludDpkaXNhYmxlOm5vLWNvbnNvbGUgKi9cbiAgICBjb25zb2xlLmxvZyhgWyR7IHRpbWVzdGFtcCB9XSAkeyBsZXZlbExhYmVsIH0gLSAkeyBtc2cgfWApO1xuICAgIC8qIHRzbGludDplbmFibGU6bm8tY29uc29sZSAqL1xuICB9XG5cbn1cbiJdfQ==