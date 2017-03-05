/**
 * Recursively require every .js file in a directory. Returns an object whose keys are the filepaths
 * of the loaded modules (relative to the given directory). Handles modules with default exports
 * (the default export will be the returned module value).
 *
 * @package util
 */
export default function requireDir(dirpath: string, options?: {
    recurse?: false;
}): {
    [moduleName: string]: any;
};
