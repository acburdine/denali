/**
 * Take the tagged string and change the word wrapping to 100 columns (or the width of the terminal
 * window, if smaller). Useful for writing paragraphs of text that should wrap in the source code,
 * but may need to wrap to a different width when printed out to the terminal.
 *
 * @package util
 */
export default function rewrap(strings: TemplateStringsArray, ...expressions: any[]): string;
