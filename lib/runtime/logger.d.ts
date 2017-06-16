/// <reference types="chalk" />
import * as chalk from 'chalk';
import DenaliObject from '../metal/object';
export declare type LogLevel = 'info' | 'warn' | 'error';
/**
 * A simple Logger class that adds timestamps and supports multiple levels of logging, colorized
 * output, and control over verbosity.
 *
 * @package runtime
 * @since 0.1.0
 */
export default class Logger extends DenaliObject {
    /**
     * Default log level if none specified.
     *
     * @since 0.1.0
     */
    loglevel: LogLevel;
    /**
     * Specify if logs should be colorized.
     *
     * @since 0.1.0
     */
    colorize: boolean;
    /**
     * Available log levels that can be used.
     */
    levels: LogLevel[];
    /**
     * Color map for the available levels.
     */
    colors: {
        [level: string]: chalk.ChalkChain;
    };
    /**
     * Log at the 'info' level.
     *
     * @since 0.1.0
     */
    info(msg: any): void;
    /**
     * Log at the 'warn' level.
     *
     * @since 0.1.0
     */
    warn(msg: any): void;
    /**
     * Log at the 'error' level.
     *
     * @since 0.1.0
     */
    error(msg: any): void;
    /**
     * Log a message to the logger at a specific log level.
     */
    log(level: LogLevel, msg: any): void;
}
