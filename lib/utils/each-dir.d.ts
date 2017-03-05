/**
 * Invoke the supplied callback for each directory in the supplied directory.
 *
 * @package util
 */
export default function eachDir(dirpath: string, fn: (childpath: string) => void): void;
