/**
 * Invoke the supplied callback for each file (not directories) in the supplied directory.
 *
 * @package util
 */
export default function eachFile(dirpath: string, fn: (childpath: string) => void): void;
