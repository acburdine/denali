export interface Vertex {
    name: string;
    before: string | string[];
    after: string | string[];
    [key: string]: any;
}
/**
 * Take an array of vertices (objects with a name, value, and optional before / after), create a
 * directed acyclic graph of them, and return the vertex values in a sorted array.
 *
 * @package util
 */
export default function topsort(items: Vertex[], options?: {
    valueKey?: string;
}): any[];
