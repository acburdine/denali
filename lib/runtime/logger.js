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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9ydW50aW1lL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUdnQjtBQUNoQiwrQkFBK0I7QUFDL0IsNENBQTJDO0FBSTNDOzs7Ozs7R0FNRztBQUNILFlBQTRCLFNBQVEsZ0JBQVk7SUFBaEQ7O1FBRUU7Ozs7V0FJRztRQUNILGFBQVEsR0FBYSxNQUFNLENBQUM7UUFFNUI7Ozs7V0FJRztRQUNILGFBQVEsR0FBRyxJQUFJLENBQUM7UUFFaEI7O1dBRUc7UUFDSCxXQUFNLEdBQWU7WUFDbkIsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPO1NBQ1IsQ0FBQztRQUVGOztXQUVHO1FBQ0gsV0FBTSxHQUEwQztZQUM5QyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUs7WUFDakIsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQ2xCLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRztTQUNqQixDQUFDO0lBaURKLENBQUM7SUEvQ0M7Ozs7T0FJRztJQUNILElBQUksQ0FBQyxHQUFRO1FBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxJQUFJLENBQUMsR0FBUTtRQUNYLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLEdBQVE7UUFDWixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxHQUFHLENBQUMsS0FBZSxFQUFFLEdBQVE7UUFDM0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3hCLENBQUM7UUFDRCxJQUFJLFNBQVMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQVMsRUFBRSxLQUFLLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFGLElBQUksVUFBVSxHQUFHLGlCQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzFELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksaUJBQVEsQ0FBQztZQUMvQyxHQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUNELCtCQUErQjtRQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUssU0FBVSxLQUFNLFVBQVcsTUFBTyxHQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzNELDhCQUE4QjtJQUNoQyxDQUFDO0NBRUY7QUFqRkQseUJBaUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaWRlbnRpdHksXG4gIHBhZFN0YXJ0XG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQgRGVuYWxpT2JqZWN0IGZyb20gJy4uL21ldGFsL29iamVjdCc7XG5cbmV4cG9ydCB0eXBlIExvZ0xldmVsID0gJ2luZm8nIHwgJ3dhcm4nIHwgJ2Vycm9yJztcblxuLyoqXG4gKiBBIHNpbXBsZSBMb2dnZXIgY2xhc3MgdGhhdCBhZGRzIHRpbWVzdGFtcHMgYW5kIHN1cHBvcnRzIG11bHRpcGxlIGxldmVscyBvZiBsb2dnaW5nLCBjb2xvcml6ZWRcbiAqIG91dHB1dCwgYW5kIGNvbnRyb2wgb3ZlciB2ZXJib3NpdHkuXG4gKlxuICogQHBhY2thZ2UgcnVudGltZVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvZ2dlciBleHRlbmRzIERlbmFsaU9iamVjdCB7XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgbG9nIGxldmVsIGlmIG5vbmUgc3BlY2lmaWVkLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGxvZ2xldmVsOiBMb2dMZXZlbCA9ICdpbmZvJztcblxuICAvKipcbiAgICogU3BlY2lmeSBpZiBsb2dzIHNob3VsZCBiZSBjb2xvcml6ZWQuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgY29sb3JpemUgPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBBdmFpbGFibGUgbG9nIGxldmVscyB0aGF0IGNhbiBiZSB1c2VkLlxuICAgKi9cbiAgbGV2ZWxzOiBMb2dMZXZlbFtdID0gW1xuICAgICdpbmZvJyxcbiAgICAnd2FybicsXG4gICAgJ2Vycm9yJ1xuICBdO1xuXG4gIC8qKlxuICAgKiBDb2xvciBtYXAgZm9yIHRoZSBhdmFpbGFibGUgbGV2ZWxzLlxuICAgKi9cbiAgY29sb3JzOiB7IFtsZXZlbDogc3RyaW5nXTogY2hhbGsuQ2hhbGtDaGFpbiB9ID0ge1xuICAgIGluZm86IGNoYWxrLndoaXRlLFxuICAgIHdhcm46IGNoYWxrLnllbGxvdyxcbiAgICBlcnJvcjogY2hhbGsucmVkXG4gIH07XG5cbiAgLyoqXG4gICAqIExvZyBhdCB0aGUgJ2luZm8nIGxldmVsLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGluZm8obXNnOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmxvZygnaW5mbycsIG1zZyk7XG4gIH1cblxuICAvKipcbiAgICogTG9nIGF0IHRoZSAnd2FybicgbGV2ZWwuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgd2Fybihtc2c6IGFueSk6IHZvaWQge1xuICAgIHRoaXMubG9nKCd3YXJuJywgbXNnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2cgYXQgdGhlICdlcnJvcicgbGV2ZWwuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZXJyb3IobXNnOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmxvZygnZXJyb3InLCBtc2cpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZyBhIG1lc3NhZ2UgdG8gdGhlIGxvZ2dlciBhdCBhIHNwZWNpZmljIGxvZyBsZXZlbC5cbiAgICovXG4gIGxvZyhsZXZlbDogTG9nTGV2ZWwsIG1zZzogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMubGV2ZWxzLmluZGV4T2YobGV2ZWwpID09PSAtMSkge1xuICAgICAgbGV2ZWwgPSB0aGlzLmxvZ2xldmVsO1xuICAgIH1cbiAgICBsZXQgdGltZXN0YW1wID0gKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKCk7XG4gICAgbGV0IHBhZExlbmd0aCA9IHRoaXMubGV2ZWxzLnJlZHVjZSgobjogbnVtYmVyLCBsYWJlbCkgPT4gTWF0aC5tYXgobiwgbGFiZWwubGVuZ3RoKSwgbnVsbCk7XG4gICAgbGV0IGxldmVsTGFiZWwgPSBwYWRTdGFydChsZXZlbC50b1VwcGVyQ2FzZSgpLCBwYWRMZW5ndGgpO1xuICAgIGlmICh0aGlzLmNvbG9yaXplKSB7XG4gICAgICBsZXQgY29sb3JpemVyID0gdGhpcy5jb2xvcnNbbGV2ZWxdIHx8IGlkZW50aXR5O1xuICAgICAgbXNnID0gY29sb3JpemVyKG1zZyk7XG4gICAgICBsZXZlbExhYmVsID0gY29sb3JpemVyKGxldmVsTGFiZWwpO1xuICAgIH1cbiAgICAvKiB0c2xpbnQ6ZGlzYWJsZTpuby1jb25zb2xlICovXG4gICAgY29uc29sZS5sb2coYFskeyB0aW1lc3RhbXAgfV0gJHsgbGV2ZWxMYWJlbCB9IC0gJHsgbXNnIH1gKTtcbiAgICAvKiB0c2xpbnQ6ZW5hYmxlOm5vLWNvbnNvbGUgKi9cbiAgfVxuXG59XG4iXX0=