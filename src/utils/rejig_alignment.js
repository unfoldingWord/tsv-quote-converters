import xre from "xregexp";

// Folds each \zaln-s milestone's original-language word into one x-align attribute:
// "content:occurrence:occurrences", plus ":chapter:verse" when the milestone has an x-ref.
// An x-ref marks which verse of a verse bridge the word comes from; it must stay with its own
// milestone, since Proskomma flattens the attributes of nested milestones onto each token.
export const rejigAlignment = (str) =>
  xre.replace(
    str,
    / x-occurrence="(\d+)" x-occurrences="(\d+)" x-content="([^"]+)"(?: x-ref="(\d+):(\d+)")?/g,
    (match, occurrence, occurrences, content, chapter, verse) =>
      chapter
        ? ` x-align="${content}:${occurrence}:${occurrences}:${chapter}:${verse}"`
        : ` x-align="${content}:${occurrence}:${occurrences}"`
  );

/**
 * Gets the x-ref chapter and verse carried in an x-align scope, if any.
 * @param {string} scope - e.g. "attribute/milestone/zaln/x-align/0/וּ⁠מִתְפַּלֵּ֔ל:1:1:9:20"
 * @returns {{chapter: string, verse: string}|null} The x-ref, or null if the alignment has none.
 */
export function getAlignedRef(scope) {
  const match = scope.match(/:\d+:\d+:(\d+):(\d+)$/);
  return match ? { chapter: match[1], verse: match[2] } : null;
}
