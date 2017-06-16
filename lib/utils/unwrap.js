"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dedent = require("dedent-js");
/**
 * Take the tagged string and remove indentation and word-wrapping.
 *
 * @package util
 */
function unwrap(strings, ...expressions) {
    let text = dedent(strings, ...expressions);
    text = text.replace(/(\S.*?)\n(.*?\S)/g, '$1 $2');
    return text;
}
exports.default = unwrap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW53cmFwLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvbWFpbi8iLCJzb3VyY2VzIjpbImxpYi91dGlscy91bndyYXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvQ0FBb0M7QUFFcEM7Ozs7R0FJRztBQUNILGdCQUErQixPQUE2QixFQUFFLEdBQUcsV0FBa0I7SUFDakYsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLFdBQVcsQ0FBQyxDQUFDO0lBQzNDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xELE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBSkQseUJBSUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBkZWRlbnQgZnJvbSAnZGVkZW50LWpzJztcblxuLyoqXG4gKiBUYWtlIHRoZSB0YWdnZWQgc3RyaW5nIGFuZCByZW1vdmUgaW5kZW50YXRpb24gYW5kIHdvcmQtd3JhcHBpbmcuXG4gKlxuICogQHBhY2thZ2UgdXRpbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB1bndyYXAoc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXksIC4uLmV4cHJlc3Npb25zOiBhbnlbXSk6IHN0cmluZyB7XG4gIGxldCB0ZXh0ID0gZGVkZW50KHN0cmluZ3MsIC4uLmV4cHJlc3Npb25zKTtcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvKFxcUy4qPylcXG4oLio/XFxTKS9nLCAnJDEgJDInKTtcbiAgcmV0dXJuIHRleHQ7XG59XG4iXX0=